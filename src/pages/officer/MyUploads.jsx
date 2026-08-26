import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { manualViolationAPI } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Spinner from '../../components/Spinner';
import { format } from 'date-fns';
import { FileWarning, Camera, MapPin, ArrowRight, Plus, Search, IndianRupee } from 'lucide-react';

const VIOLATION_ICONS = {
  NO_HELMET: '🪖', NO_SEATBELT: '🔗', RED_LIGHT_JUMP: '🔴',
  SPEEDING: '⚡', WRONG_SIDE: '↩️', ILLEGAL_PARKING: '🅿️',
  LANE_VIOLATION: '↔️', MORE_THAN_2_PEOPLE_ON_BIKE: '🏍️',
};

const VIOLATION_LABELS = {
  NO_HELMET: 'No Helmet', NO_SEATBELT: 'No Seatbelt',
  RED_LIGHT_JUMP: 'Red Light Jump', SPEEDING: 'Speeding',
  WRONG_SIDE: 'Wrong Side Driving', ILLEGAL_PARKING: 'Illegal Parking',
  LANE_VIOLATION: 'Lane Violation', MORE_THAN_2_PEOPLE_ON_BIKE: 'More Than 2 on Bike',
};

export default function MyUploads() {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetch() {
      try {
        const res = await manualViolationAPI.list();
        setViolations(res.data.violations || []);
      } catch { /* ignore */ } finally { setLoading(false); }
    }
    fetch();
  }, []);

  const filtered = violations.filter(v =>
    !search ||
    v.detectedPlate?.toLowerCase().includes(search.toLowerCase()) ||
    v.locationText?.toLowerCase().includes(search.toLowerCase()) ||
    VIOLATION_LABELS[v.violationType]?.toLowerCase().includes(search.toLowerCase())
  );

  const challanCount = violations.filter(v => v.challan).length;
  const totalFines = violations.filter(v => v.challan).reduce((s, v) => s + parseFloat(v.challan?.fineAmount || 0), 0);

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Uploads</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manual violations you&apos;ve reported from the field</p>
        </div>
        <Link to="/officer/upload" className="btn-primary">
          <Plus className="h-4 w-4" /> Upload New
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/40 rounded-lg"><FileWarning className="h-5 w-5 text-primary-600 dark:text-primary-400" /></div>
          <div><p className="text-xs text-slate-500">Total Uploads</p><p className="text-lg font-bold text-slate-900 dark:text-white">{violations.length}</p></div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="p-2 bg-success-100 dark:bg-success-900/40 rounded-lg"><Camera className="h-5 w-5 text-success-600 dark:text-success-400" /></div>
          <div><p className="text-xs text-slate-500">Challans Issued</p><p className="text-lg font-bold text-slate-900 dark:text-white">{challanCount}</p></div>
        </div>
        <div className="card p-4 flex items-center gap-3 col-span-2 lg:col-span-1">
          <div className="p-2 bg-danger-100 dark:bg-danger-900/40 rounded-lg"><IndianRupee className="h-5 w-5 text-danger-600 dark:text-danger-400" /></div>
          <div><p className="text-xs text-slate-500">Total Fines</p><p className="text-lg font-bold text-danger-600">₹{totalFines.toLocaleString()}</p></div>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input type="text" className="input pl-10" placeholder="Search by plate, location, or type..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FileWarning} title="No uploads yet" description="Upload your first manual violation from the field."
          action={<Link to="/officer/upload" className="btn-primary text-sm"><Plus className="h-4 w-4" /> Upload Violation</Link>} />
      ) : (
        <div className="space-y-3">
          {filtered.map(v => (
            <div key={v.id} className="card-hover p-5 flex items-center gap-4">
              {/* Thumbnail */}
              {v.evidence?.imageUrl ? (
                <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                  <img src={v.evidence.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-2xl">
                  {VIOLATION_ICONS[v.violationType] || '📋'}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={v.status} />
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {VIOLATION_ICONS[v.violationType]} {VIOLATION_LABELS[v.violationType] || v.violationType}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 mt-1">
                  <span className="font-mono">{v.detectedPlate}</span>
                  {v.locationText && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {v.locationText}</span>}
                  <span>{format(new Date(v.createdAt), 'MMM d, h:mm a')}</span>
                </div>
              </div>

              {/* Fine */}
              {v.challan && (
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-danger-600">₹{parseFloat(v.challan.fineAmount).toLocaleString()}</p>
                  <p className="text-xs text-slate-400">{v.challan.challanNumber}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
