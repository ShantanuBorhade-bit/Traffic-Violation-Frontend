import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import {
  Video,
  Upload,
  Play,
  Square,
  Settings,
  Cpu,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import Spinner from '../../components/Spinner';
import {
  modelServiceAPI,
  getServiceSettings,
  saveServiceSettings,
  mediaUrl,
} from '../../api/modelService';

const RUNNING = ['starting', 'running'];

const TYPE_LABEL = {
  no_helmet: 'No helmet',
  triple: 'Triple riding',
  phone: 'Phone use',
};

function kindOf(eventId = '') {
  return eventId.split('-').pop();
}

function ServiceStatus({ health, error, onRetry }) {
  if (error) {
    return (
      <div className="card p-4 flex items-start gap-3 border-l-4 border-danger-500">
        <XCircle className="h-5 w-5 text-danger-500 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 dark:text-white">Model service offline</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 break-words">{error}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            On the detection machine run <code className="font-mono">start_model_service.bat</code>, then retry.
          </p>
        </div>
        <button className="btn-secondary text-sm" onClick={onRetry}>Retry</button>
      </div>
    );
  }
  if (!health) {
    return (
      <div className="card p-4 flex items-center gap-3">
        <Spinner size="sm" /> <span className="text-slate-500">Connecting to the model service…</span>
      </div>
    );
  }
  const ready = health.status === 'ok';
  return (
    <div className={clsx('card p-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-l-4',
      ready ? 'border-success-500' : 'border-warning-500')}>
      <div className="flex items-center gap-2">
        {ready ? <CheckCircle2 className="h-5 w-5 text-success-500" /> : <Spinner size="sm" />}
        <span className="font-medium text-slate-900 dark:text-white">
          {ready ? 'Model service ready' : health.status === 'loading' ? 'Loading models…' : 'Model error'}
        </span>
      </div>
      {health.gpu && (
        <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
          <Cpu className="h-4 w-4" /> {health.gpu}
        </span>
      )}
      <span className="text-sm text-slate-500 dark:text-slate-400 break-all">
        Reports to: {health.backendUrl || 'not configured'}
      </span>
      {health.modelsError && <span className="text-sm text-danger-600">{health.modelsError}</span>}
    </div>
  );
}

function SubmissionsTable({ submissions }) {
  if (!submissions?.length) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">No violations reported yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
            <th className="py-2 pr-3">Track</th>
            <th className="py-2 pr-3">Violation</th>
            <th className="py-2 pr-3">Backend</th>
            <th className="py-2 pr-3">Status</th>
            <th className="py-2">Photo</th>
          </tr>
        </thead>
        <tbody>
          {[...submissions].reverse().map((s) => (
            <tr key={s.modelEventId} className="border-b border-slate-100 dark:border-slate-800">
              <td className="py-2 pr-3 font-mono">#{s.trackId}</td>
              <td className="py-2 pr-3">{TYPE_LABEL[kindOf(s.modelEventId)] || s.violationType}</td>
              <td className={clsx('py-2 pr-3', s.result === 'rejected' && 'text-danger-600')}>
                {s.result}{s.http_status ? ` (${s.http_status})` : ''}
              </td>
              <td className="py-2 pr-3">{s.status || '—'}</td>
              <td className="py-2">{s.evidenceUploaded == null ? '—' : s.evidenceUploaded ? 'uploaded' : 'missing'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Stats({ session }) {
  const items = [
    ['Frames', session.frames ?? 0],
    ['Speed', `${session.fps ?? 0} fps`],
    ['Flagged motorcycles', session.flaggedTracks ?? 0],
    ['Reports sent', session.submissions?.length ?? 0],
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">{value}</p>
        </div>
      ))}
    </div>
  );
}

export default function AdminLiveDetection() {
  const [settings, setSettings] = useState(getServiceSettings);
  const [showSettings, setShowSettings] = useState(() => !getServiceSettings().token);
  const [health, setHealth] = useState(null);
  const [healthError, setHealthError] = useState('');
  const [tab, setTab] = useState('webcam');
  const [opts, setOpts] = useState({ cameraId: 'WEBCAM-01', areaCode: 'DEMO', location: '', sendToBackend: true });
  const [camera, setCamera] = useState(0);
  const [session, setSession] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const poll = useRef(null);

  const checkHealth = useCallback(async () => {
    try {
      const h = await modelServiceAPI.health();
      setHealth(h);
      setHealthError('');
      return h;
    } catch (e) {
      setHealth(null);
      setHealthError(e.message);
      return null;
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const t = setInterval(checkHealth, 5000); // picks up the service starting or stopping on the machine
    return () => clearInterval(t);
  }, [checkHealth]);

  const stopPolling = () => {
    if (poll.current) clearInterval(poll.current);
    poll.current = null;
  };

  const startPolling = (fetcher) => {
    stopPolling();
    poll.current = setInterval(async () => {
      try {
        const s = await fetcher();
        setSession(s);
        if (!RUNNING.includes(s.state)) stopPolling();
      } catch (e) {
        setError(e.message);
        stopPolling();
      }
    }, 1000);
  };

  useEffect(() => stopPolling, []);

  const submitMode = opts.sendToBackend ? 'live' : 'off';
  const running = session && RUNNING.includes(session.state);

  async function startWebcam() {
    setError('');
    setBusy(true);
    try {
      const s = await modelServiceAPI.startLive({
        camera: Number(camera), cameraId: opts.cameraId, areaCode: opts.areaCode,
        location: opts.location || null, submit: submitMode,
      });
      setSession(s);
      startPolling(modelServiceAPI.liveStatus);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function stopWebcam() {
    try {
      await modelServiceAPI.stopLive();
    } catch (e) {
      setError(e.message);
    }
  }

  async function processVideo() {
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      const s = await modelServiceAPI.uploadVideo(file, {
        cameraId: opts.cameraId, areaCode: opts.areaCode, location: opts.location, submit: submitMode,
      });
      setSession(s);
      startPolling(() => modelServiceAPI.jobStatus(s.id));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  function saveSettings(e) {
    e.preventDefault();
    saveServiceSettings(settings);
    setSettings(getServiceSettings());
    setShowSettings(false);
    checkHealth();
  }

  const ready = health?.status === 'ok';
  const isLive = session?.kind === 'live';
  const isVideo = session?.kind === 'video';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Live Detection</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Run the detection model on the webcam or an uploaded video. Detected violations are sent for
            officer review; no challan is issued automatically.
          </p>
        </div>
        <button className="btn-secondary flex items-center gap-2" onClick={() => setShowSettings((v) => !v)}>
          <Settings className="h-4 w-4" /> Settings
        </button>
      </div>

      {showSettings && (
        <form onSubmit={saveSettings} className="card p-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="input-label">Model service URL</label>
            <input className="input" value={settings.url}
              onChange={(e) => setSettings({ ...settings, url: e.target.value })} />
          </div>
          <div>
            <label className="input-label">Service token</label>
            <input className="input" type="password" value={settings.token} autoComplete="off"
              placeholder="Printed when the model service starts"
              onChange={(e) => setSettings({ ...settings, token: e.target.value })} />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button className="btn-primary" type="submit">Save and connect</button>
          </div>
        </form>
      )}

      <ServiceStatus health={health} error={healthError} onRetry={checkHealth} />

      <div className="card p-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="input-label">Camera ID</label>
          <input className="input" value={opts.cameraId} disabled={running}
            onChange={(e) => setOpts({ ...opts, cameraId: e.target.value })} />
        </div>
        <div>
          <label className="input-label">Area code</label>
          <input className="input" value={opts.areaCode} disabled={running}
            onChange={(e) => setOpts({ ...opts, areaCode: e.target.value })} />
        </div>
        <div>
          <label className="input-label">Location</label>
          <input className="input" value={opts.location} disabled={running} placeholder="Optional"
            onChange={(e) => setOpts({ ...opts, location: e.target.value })} />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 sm:mt-6">
          <input type="checkbox" checked={opts.sendToBackend} disabled={running}
            onChange={(e) => setOpts({ ...opts, sendToBackend: e.target.checked })} />
          Send violations to the backend
        </label>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {[['webcam', Video, 'Webcam'], ['upload', Upload, 'Upload video']].map(([key, Icon, label]) => (
          <button key={key} disabled={running}
            className={clsx('flex items-center gap-2 px-4 py-2 -mb-px border-b-2 text-sm font-medium',
              tab === key ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300')}
            onClick={() => { setTab(key); setSession(null); setError(''); }}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="card p-4 flex items-start gap-3 border-l-4 border-danger-500">
          <AlertTriangle className="h-5 w-5 text-danger-500 shrink-0" />
          <p className="text-sm text-slate-700 dark:text-slate-300 break-words">{error}</p>
        </div>
      )}

      {tab === 'webcam' && (
        <div className="card p-5 space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="input-label">Camera</label>
              <select className="input" value={camera} disabled={running} onChange={(e) => setCamera(e.target.value)}>
                {[0, 1, 2].map((c) => <option key={c} value={c}>Camera {c}{c === 0 ? ' (built-in)' : ''}</option>)}
              </select>
            </div>
            {running && isLive ? (
              <button className="btn-danger flex items-center gap-2" onClick={stopWebcam}>
                <Square className="h-4 w-4" /> Stop
              </button>
            ) : (
              <button className="btn-primary flex items-center gap-2" disabled={!ready || busy || running}
                onClick={startWebcam}>
                <Play className="h-4 w-4" /> Start live feed
              </button>
            )}
          </div>
          {isLive && (
            <>
              <div className="rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center">
                {running ? (
                  <img src={mediaUrl('/live/stream', session.id)} alt="Live detection feed"
                    className="w-full h-full object-contain" />
                ) : (
                  <p className="text-slate-400 text-sm">
                    Feed {session.state}{session.error ? `: ${session.error}` : ''}
                  </p>
                )}
              </div>
              <Stats session={session} />
              <SubmissionsTable submissions={session.submissions} />
            </>
          )}
        </div>
      )}

      {tab === 'upload' && (
        <div className="card p-5 space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[220px]">
              <label className="input-label">Video file</label>
              <input className="input" type="file" accept="video/*" disabled={running}
                onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            {running && isVideo ? (
              <button className="btn-danger flex items-center gap-2" onClick={() => modelServiceAPI.cancelJob(session.id)}>
                <Square className="h-4 w-4" /> Cancel
              </button>
            ) : (
              <button className="btn-primary flex items-center gap-2" disabled={!ready || !file || busy}
                onClick={processVideo}>
                {busy ? <Spinner size="sm" /> : <Upload className="h-4 w-4" />} Upload and process
              </button>
            )}
          </div>
          {isVideo && (
            <>
              <div>
                <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mb-1">
                  <span>{session.fileName} — {session.state}{session.error ? `: ${session.error}` : ''}</span>
                  <span>{session.progress != null ? `${Math.round(session.progress * 100)}%` : ''}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full bg-primary-500 transition-all"
                    style={{ width: `${Math.round((session.progress || 0) * 100)}%` }} />
                </div>
              </div>
              <Stats session={session} />
              {session.state === 'done' && session.hasResult && (
                <video controls className="w-full rounded-lg bg-black"
                  src={mediaUrl(`/video-jobs/${session.id}/result.webm`, session.id)} />
              )}
              <SubmissionsTable submissions={session.submissions} />
            </>
          )}
        </div>
      )}

      {session?.submissions?.length > 0 && (
        <Link to="/admin/violations" className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium">
          Review reported violations <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
