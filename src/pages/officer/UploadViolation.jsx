import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { manualViolationAPI } from '../../api/client';
import { Loader2, Camera, Upload, CheckCircle2, MapPin, AlertCircle } from 'lucide-react';

const VIOLATION_TYPES = [
  { value: 'NO_HELMET', label: 'No Helmet', icon: '🪖' },
  { value: 'NO_SEATBELT', label: 'No Seatbelt', icon: '🔗' },
  { value: 'RED_LIGHT_JUMP', label: 'Red Light Jump', icon: '🔴' },
  { value: 'SPEEDING', label: 'Speeding', icon: '⚡' },
  { value: 'WRONG_SIDE', label: 'Wrong Side Driving', icon: '↩️' },
  { value: 'ILLEGAL_PARKING', label: 'Illegal Parking', icon: '🅿️' },
  { value: 'LANE_VIOLATION', label: 'Lane Violation', icon: '↔️' },
  { value: 'MORE_THAN_2_PEOPLE_ON_BIKE', label: 'More Than 2 on Bike', icon: '🏍️' },
];

export default function UploadViolation() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [violationType, setViolationType] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [locationText, setLocationText] = useState('');
  const [areaCode, setAreaCode] = useState('AREA-01');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [plateDetected, setPlateDetected] = useState(false);

  const handleFileChange = async (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setPlateDetected(false);
      setPlateNumber('');

      // Auto-detect plate from the image
      setDetecting(true);
      try {
        const formData = new FormData();
        formData.append('image', selected);
        const res = await manualViolationAPI.detectPlate(formData);
        if (res.data.success && res.data.detectedPlate) {
          setPlateNumber(res.data.detectedPlate);
          setPlateDetected(true);
        }
      } catch (err) {
        // Silent fail — officer can type manually
        console.log('Plate auto-detection failed:', err.message);
      } finally {
        setDetecting(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('metadata', JSON.stringify({
        violationType,
        detectedPlate: plateNumber.toUpperCase(),
        locationText: locationText || undefined,
        areaCode,
      }));

      const res = await manualViolationAPI.upload(formData);
      setResult(res.data.violation);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.detectedPlate?.[0] || 'Failed to upload violation');
    } finally {
      setLoading(false);
    }
  };

  if (success && result) {
    return (
      <div className="max-w-2xl mx-auto py-10 space-y-6">
        <div className="text-center">
          <div className="p-4 bg-success-100 dark:bg-success-900/30 rounded-2xl w-fit mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-success-600 dark:text-success-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Violation Uploaded!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">The violation has been recorded and a challan has been generated.</p>
        </div>

        <div className="card overflow-hidden">
          {result.evidence?.imageUrl && (
            <img src={result.evidence.imageUrl} alt="Violation" className="w-full h-64 object-cover" />
          )}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-400">Violation Type</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">{result.violationType?.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Plate Number</p>
                <p className="font-medium text-slate-700 dark:text-slate-200 font-mono">{result.detectedPlate}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Status</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                  {result.status?.replace(/_/g, ' ')}
                </span>
              </div>
              {result.challan && (
                <div>
                  <p className="text-xs text-slate-400">Fine Amount</p>
                  <p className="font-bold text-danger-600">₹{parseFloat(result.challan.fineAmount).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button onClick={() => { setSuccess(false); setResult(null); setFile(null); setPreview(null); setViolationType(''); setPlateNumber(''); }} className="btn-primary">
            <Camera className="h-4 w-4" /> Upload Another
          </button>
          <button onClick={() => navigate('/officer/uploads')} className="btn-secondary">
            View My Uploads
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Upload Violation</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Capture or upload a photo of a traffic violation you&apos;ve witnessed
        </p>
      </div>

      {error && (
        <div className="p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-400 text-sm rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">📷 Photo Evidence</h3>
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden hover:border-primary-400 transition-colors">
            <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" id="violation-upload" />
            <label htmlFor="violation-upload" className="cursor-pointer block">
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Preview" className="w-full h-72 object-cover" />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="opacity-0 hover:opacity-100 px-4 py-2 bg-black/70 text-white text-sm rounded-lg">Tap to change photo</span>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center">
                  <Camera className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Tap to take a photo or choose from gallery</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">The photo will be used as evidence for the challan</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Violation Details */}
        <div className="card p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">⚠️ Violation Details</h3>

          {/* Violation Type */}
          <div>
            <label className="input-label">Violation Type *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {VIOLATION_TYPES.map(vt => (
                <button
                  key={vt.value}
                  type="button"
                  onClick={() => setViolationType(vt.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all text-sm ${
                    violationType === vt.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                  }`}
                >
                  <span className="text-lg">{vt.icon}</span>
                  <span className={`block mt-1 font-medium ${violationType === vt.value ? 'text-primary-700 dark:text-primary-300' : 'text-slate-700 dark:text-slate-300'}`}>
                    {vt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Plate Number */}
          <div>
            <label className="input-label">
              Vehicle Plate Number *
              {detecting && (
                <span className="ml-2 text-xs text-primary-500 font-normal flex items-center gap-1 inline-flex">
                  <Loader2 className="h-3 w-3 animate-spin" /> Detecting...
                </span>
              )}
              {plateDetected && !detecting && (
                <span className="ml-2 text-xs text-success-500 font-normal">✓ Auto-detected</span>
              )}
            </label>
            <input
              type="text"
              className={`input font-mono uppercase ${plateDetected ? 'border-success-300 bg-success-50 dark:bg-success-900/10' : ''}`}
              placeholder="e.g. MH12AB1234"
              value={plateNumber}
              onChange={e => { setPlateNumber(e.target.value.toUpperCase()); setPlateDetected(false); }}
              required
            />
            {plateDetected && (
              <p className="text-xs text-success-600 mt-1">
                Plate number auto-detected. Edit if incorrect.
              </p>
            )}
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Location (optional)</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="e.g. MG Road Signal"
                  value={locationText}
                  onChange={e => setLocationText(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="input-label">Area Code *</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. AREA-01"
                value={areaCode}
                onChange={e => setAreaCode(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !file || !violationType || !plateNumber}
          className="btn-primary w-full text-base py-3"
        >
          {loading ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Uploading...</>
          ) : (
            <><Upload className="h-5 w-5" /> Submit Violation Report</>
          )}
        </button>
      </form>
    </div>
  );
}
