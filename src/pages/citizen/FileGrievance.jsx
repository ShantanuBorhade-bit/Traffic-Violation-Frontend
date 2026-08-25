import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { grievanceAPI } from '../../api/client';
import { Loader2, Upload, ArrowLeft, AlertCircle, FileWarning } from 'lucide-react';

const REASONS = [
  { value: 'FALSE_DETECTION', label: 'False Detection', desc: 'The violation was not actually committed' },
  { value: 'VEHICLE_NOT_MINE', label: 'Vehicle Not Mine', desc: 'This vehicle is not registered to me' },
  { value: 'NOT_MYSELF_DRIVING', label: 'Not Myself Driving', desc: 'I was not driving at the time' },
  { value: 'CHALLAN_ALREADY_PAID', label: 'Already Paid', desc: 'I have already paid this challan' },
  { value: 'OTHER', label: 'Other', desc: 'Any other reason not listed above' },
];

export default function FileGrievance() {
  const navigate = useNavigate();
  const [challanId, setChallanId] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('challanId', challanId);
      formData.append('reason', reason);
      if (description) formData.append('description', description);
      if (file) formData.append('evidence', file);

      await grievanceAPI.create(formData);
      setSuccess(true);
      setTimeout(() => navigate('/citizen/grievances'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to file grievance. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="p-4 bg-success-100 rounded-2xl w-fit mx-auto mb-6">
          <AlertCircle className="h-10 w-10 text-success-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Grievance Filed!</h2>
        <p className="text-slate-500">
          Your grievance has been submitted successfully. Redirecting to your grievances...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          to="/citizen/grievances"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to grievances
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">File a Grievance</h1>
        <p className="text-slate-500 mt-1">Dispute a challan by providing your reason and evidence</p>
      </div>

      <div className="card p-6">
        {error && (
          <div className="mb-4 p-3 bg-danger-50 border border-danger-200 text-danger-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="input-label">Challan ID *</label>
            <input
              type="text"
              className="input"
              placeholder="Enter the challan ID (UUID)"
              value={challanId}
              onChange={(e) => setChallanId(e.target.value)}
              required
            />
            <p className="text-xs text-slate-400 mt-1">
              You can find this on your challan notice
            </p>
          </div>

          <div>
            <label className="input-label">Reason for Grievance *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setReason(r.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    reason === r.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span
                    className={`block text-sm font-medium ${
                      reason === r.value ? 'text-primary-700' : 'text-slate-700'
                    }`}
                  >
                    {r.label}
                  </span>
                  <span className="block text-xs text-slate-500 mt-0.5">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="input-label">Description (optional)</label>
            <textarea
              className="input min-h-[100px] resize-y"
              placeholder="Provide additional details about your grievance..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
            />
            <p className="text-xs text-slate-400 mt-1">{description.length}/500 characters</p>
          </div>

          <div>
            <label className="input-label">Supporting Evidence (optional)</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="evidence-upload"
              />
              <label htmlFor="evidence-upload" className="cursor-pointer">
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileWarning className="h-8 w-8 text-primary-500" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-700">{file.name}</p>
                      <p className="text-xs text-slate-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Click to upload an image</p>
                    <p className="text-xs text-slate-400">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <button type="submit" disabled={loading || !reason} className="btn-primary w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Grievance'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
