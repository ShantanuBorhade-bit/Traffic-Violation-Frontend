import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/client';
import { Loader2, Save, CheckCircle2, AlertCircle, User, Car, MapPin, CreditCard, Shield, Calendar } from 'lucide-react';

const CITIZEN_FIELDS = [
  { key: 'vehicleNumber', label: 'Vehicle Number', placeholder: 'e.g. MH12AB1234', icon: Car },
  { key: 'address', label: 'Street Address', placeholder: 'e.g. 123 Main Street', icon: MapPin },
  { key: 'city', label: 'City', placeholder: 'e.g. Pune', icon: MapPin },
  { key: 'state', label: 'State', placeholder: 'e.g. Maharashtra', icon: MapPin },
  { key: 'pincode', label: 'PIN Code', placeholder: 'e.g. 411001', icon: MapPin },
  { key: 'licenseNumber', label: 'Driving License Number', placeholder: 'e.g. MH1220230001234', icon: CreditCard },
];

const ROLE_LABEL = {
  CITIZEN: 'Citizen',
  TRAFFIC_OFFICER: 'Traffic Officer',
  GRIEVANCE_OFFICER: 'Grievance Officer',
  ADMIN: 'Administrator',
};

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({});
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

  const isCitizen = user?.role === 'CITIZEN';
  const fields = isCitizen ? CITIZEN_FIELDS : [];
  const filledCount = fields.filter(f => form[f.key]?.trim()).length;
  const progress = fields.length > 0 ? Math.round((filledCount / fields.length) * 100) : 100;
  const isComplete = user?.profileComplete || progress === 100;

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
          {isCitizen && !isComplete
            ? 'Complete your profile to activate your account'
            : 'Your account information'}
        </p>
      </div>

      {/* Profile Header Card */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-primary-100 dark:bg-primary-900/40 rounded-2xl flex items-center justify-center">
            <User className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user?.fullName}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Shield className="h-3 w-3" /> {ROLE_LABEL[user?.role]}
              </span>
              {user?.createdAt && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          {isComplete ? (
            <span className="ml-auto px-3 py-1 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 text-xs font-semibold rounded-full flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Complete
            </span>
          ) : isCitizen ? (
            <span className="ml-auto px-3 py-1 bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400 text-xs font-semibold rounded-full">
              {progress}% Complete
            </span>
          ) : null}
        </div>
      </div>

      {/* Progress Bar (Citizens only) */}
      {isCitizen && !isComplete && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Profile Completion</span>
            <span className="text-xs font-bold text-primary-600">{filledCount}/{fields.length} fields</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Info (read-only) */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Account Info</h3>
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
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{ROLE_LABEL[user?.role]}</p>
            </div>
          </div>
        </div>

        {/* Editable Fields */}
        {fields.length > 0 && (
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
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

            {fields.map(({ key, label, placeholder, icon: Icon }) => {
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
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full text-base py-3"
        >
          {saving ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Saving...</>
          ) : (
            <><Save className="h-5 w-5" /> {isComplete ? 'Save Changes' : 'Complete Profile'}</>
          )}
        </button>
      </form>
    </div>
  );
}
