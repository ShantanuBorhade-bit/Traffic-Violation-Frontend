import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/client';
import { Loader2, Save, CheckCircle2, AlertCircle, User, Car, MapPin, CreditCard } from 'lucide-react';

const REQUIRED_FIELDS = [
  { key: 'vehicleNumber', label: 'Vehicle Number', placeholder: 'e.g. MH12AB1234', icon: Car },
  { key: 'address', label: 'Street Address', placeholder: 'e.g. 123 Main Street', icon: MapPin },
  { key: 'city', label: 'City', placeholder: 'e.g. Pune', icon: MapPin },
  { key: 'state', label: 'State', placeholder: 'e.g. Maharashtra', icon: MapPin },
  { key: 'pincode', label: 'PIN Code', placeholder: 'e.g. 411001', icon: MapPin },
  { key: 'licenseNumber', label: 'Driving License Number', placeholder: 'e.g. MH1220230001234', icon: CreditCard },
];

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    vehicleNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    licenseNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        vehicleNumber: user.vehicleNumber || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        licenseNumber: user.licenseNumber || '',
      });
    }
  }, [user]);

  const filledCount = REQUIRED_FIELDS.filter(f => form[f.key]?.trim()).length;
  const progress = Math.round((filledCount / REQUIRED_FIELDS.length) * 100);
  const isComplete = filledCount === REQUIRED_FIELDS.length;

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await authAPI.updateProfile(form);
      if (res.data.success) {
        setSuccess(res.data.message);
        // Update the user in context
        if (res.data.user) {
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Complete your profile to activate your account
        </p>
      </div>

      {/* Progress Card */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Profile Completion</h3>
          <span className={`text-sm font-bold ${isComplete ? 'text-success-600' : 'text-primary-600'}`}>
            {progress}%
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-success-500' : 'bg-primary-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        {isComplete ? (
          <p className="text-xs text-success-600 mt-2 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Your profile is complete!
          </p>
        ) : (
          <p className="text-xs text-slate-500 mt-2">
            {REQUIRED_FIELDS.length - filledCount} field{REQUIRED_FIELDS.length - filledCount !== 1 ? 's' : ''} remaining
          </p>
        )}
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info (read-only) */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <User className="h-4 w-4" /> Account Info
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400">Full Name</label>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.fullName}</p>
            </div>
            <div>
              <label className="text-xs text-slate-400">Email</label>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.email}</p>
            </div>
            <div>
              <label className="text-xs text-slate-400">Phone</label>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.phone || '—'}</p>
            </div>
            <div>
              <label className="text-xs text-slate-400">Role</label>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Required Fields */}
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Required Details
          </h3>

          {error && (
            <div className="p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-400 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 text-success-700 dark:text-success-400 text-sm rounded-lg flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> {success}
            </div>
          )}

          {REQUIRED_FIELDS.map(({ key, label, placeholder, icon: Icon }) => {
            const filled = !!form[key]?.trim();
            return (
              <div key={key}>
                <label className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
                  <Icon className="h-3 w-3" /> {label} *
                  {filled && <CheckCircle2 className="h-3 w-3 text-success-500" />}
                </label>
                <input
                  type="text"
                  name={key}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={handleChange}
                  required
                  className={`${inputClass} ${filled ? 'border-success-300 bg-success-50/50 dark:bg-success-900/10' : ''}`}
                />
              </div>
            );
          })}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full text-base py-3"
        >
          {saving ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Saving...</>
          ) : (
            <><Save className="h-5 w-5" /> {isComplete ? 'Save Profile' : 'Complete Profile'}</>
          )}
        </button>
      </form>
    </div>
  );
}
