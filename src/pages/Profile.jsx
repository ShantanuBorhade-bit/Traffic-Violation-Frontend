import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

const ROLE_LABEL = {
  CITIZEN: 'Citizen',
  TRAFFIC_OFFICER: 'Traffic Officer',
  GRIEVANCE_OFFICER: 'Grievance Officer',
  ADMIN: 'Administrator',
};

const ROLE_COLORS = {
  CITIZEN: 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300',
  TRAFFIC_OFFICER: 'bg-success-100 dark:bg-success-900/40 text-success-700 dark:text-success-300',
  GRIEVANCE_OFFICER: 'bg-warning-100 dark:bg-warning-900/40 text-warning-700 dark:text-warning-300',
  ADMIN: 'bg-danger-100 dark:bg-danger-900/40 text-danger-700 dark:text-danger-300',
};

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Your account information</p>
      </div>

      <div className="card p-8">
        <div className="flex items-center gap-5 mb-8">
          <div className="h-20 w-20 bg-primary-100 dark:bg-primary-900/40 rounded-2xl flex items-center justify-center">
            <User className="h-10 w-10 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.fullName}</h2>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${ROLE_COLORS[user?.role]}`}
            >
              {ROLE_LABEL[user?.role]}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <Mail className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <Shield className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{ROLE_LABEL[user?.role]}</p>
            </div>
          </div>

          {user?.id && (
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <Calendar className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">User ID</p>
                <p className="text-sm font-mono text-slate-700 dark:text-slate-200">{user.id}</p>
              </div>
            </div>
          )}

          {user?.createdAt && (
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <Clock className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Member Since
                </p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {format(new Date(user.createdAt), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
