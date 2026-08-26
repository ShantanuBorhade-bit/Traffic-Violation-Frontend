import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { grievanceAPI, citizenChallanAPI } from '../../api/client';
import { Loader2, Upload, ArrowLeft, AlertCircle, FileWarning, CheckCircle2, FileText, IndianRupee, Clock } from 'lucide-react';

const REASONS = [
  { value: 'FALSE_DETECTION', label: 'False Detection', desc: 'The violation was not actually committed' },
  { value: 'VEHICLE_NOT_MINE', label: 'Vehicle Not Mine', desc: 'This vehicle is not registered to me' },
  { value: 'NOT_MYSELF_DRIVING', label: 'Not Myself Driving', desc: 'I was not driving at the time' },
  { value: 'CHALLAN_ALREADY_PAID', label: 'Already Paid', desc: 'I have already paid this challan' },
  { value: 'OTHER', label: 'Other', desc: 'Any other reason not listed above' },
];

const VIOLATION_LABELS = {
  NO_HELMET: 'No Helmet', NO_SEATBELT: 'No Seatbelt',
  RED_LIGHT_JUMP: 'Red Light Jump', SPEEDING: 'Speeding',
  WRONG_SIDE: 'Wrong Side Driving', ILLEGAL_PARKING: 'Illegal Parking',
  LANE_VIOLATION: 'Lane Violation', MORE_THAN_2_PEOPLE_ON_BIKE: 'More Than 2 on Bike',
  MOBILE_PHONE_USAGE: 'Mobile Phone Usage',
};

export default function FileGrievance() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const challanIdFromUrl = searchParams.get('challanId') || '';

  const [challanId, setChallanId] = useState(challanIdFromUrl);
  const [challan, setChallan] = useState(null);
  const [loadingChallan, setLoadingChallan] = useState(!!challanIdFromUrl);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Fetch challan details if ID is provided
  useEffect(() => {
    if (!challanIdFromUrl) return;
    setLoadingChallan(true);
    citizenChallanAPI.getById(challanIdFromUrl)
      .then(res => {
        const c = res.data.challan;
        setChallan(c);
        setChallanId(c.id);
      })
      .catch(() => setError('Challan not found'))
      .finally(() => setLoadingChallan(false));
  }, [challanIdFromUrl]);

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
        <div className="p-4 bg-success-100 dark:bg-success-900/30 rounded-2xl w-fit mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-success-600 dark:text-success-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Grievance Filed!
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Your grievance has been submitted successfully. Redirecting to your grievances...
        </p>
      </div>
    );
  }

  const inputClass = "w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          to="/citizen/grievances"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to grievances
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">File a Grievance</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Dispute a challan by providing your reason and evidence
        </p>
      </div>

      {/* Challan Info Card (if loaded) */}
      {loadingChallan && (
        <div className="card p-6 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
          <span className="text-sm text-slate-500">Loading challan details...</span>
        </div>
      )}

      {challan && (
        <div className="card p-4 border-l-4 border-primary-500">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <FileText className="h-5 w-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {challan.challanNumber}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {VIOLATION_LABELS[challan.violation?.violationType] || challan.violation?.violationType?.replace(/_/g, ' ')}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <IndianRupee className="h-3 w-3" /> ₹{parseFloat(challan.fineAmount).toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Due {new Date(challan.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card p-6">
        {error && (
          <div className="mb-4 p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-400 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Hidden challan ID if pre-filled */}
          {challanId && (
            <input type="hidden" value={challanId} />
          )}

          {!challanId && (
            <div>
              <label className="input-label">Challan ID *</label>
              <input
                type="text"
                className="input"
                placeholder="Enter the challan ID"
                value={challanId}
                onChange={(e) => setChallanId(e.target.value)}
                required
              />
            </div>
          )}

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
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                  }`}
                >
                  <span
                    className={`block text-sm font-medium ${
                      reason === r.value
                        ? 'text-primary-700 dark:text-primary-300'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {r.label}
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {r.desc}
                  </span>
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
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {description.length}/500 characters
            </p>
          </div>

          <div>
            <label className="input-label">Supporting Evidence (optional)</label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center hover:border-primary-400 transition-colors">
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
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Click to upload an image
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <button type="submit" disabled={loading || !challanId || !reason} className="btn-primary w-full">
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
