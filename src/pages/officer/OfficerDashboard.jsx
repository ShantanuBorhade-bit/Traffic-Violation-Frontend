import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { officerGrievanceAPI } from '../../api/client';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Spinner from '../../components/Spinner';
import { format } from 'date-fns';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  FileText,
} from 'lucide-react';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await officerGrievanceAPI.list();
        setGrievances(res.data.grievances || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const pending = grievances.filter((g) => g.status === 'PENDING');
  const underReview = grievances.filter((g) => g.status === 'UNDER_REVIEW');
  const approved = grievances.filter((g) => g.status === 'APPROVED');
  const rejected = grievances.filter((g) => g.status === 'REJECTED');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Officer Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Welcome, {user?.fullName}. Review and manage citizen grievances.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Clock} label="Pending" value={pending.length} color="warning" />
        <StatCard icon={FileText} label="Under Review" value={underReview.length} color="primary" />
        <StatCard icon={CheckCircle2} label="Approved" value={approved.length} color="success" />
        <StatCard icon={XCircle} label="Rejected" value={rejected.length} color="danger" />
      </div>

      {/* Pending Queue */}
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Pending Reviews
            {pending.length > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-warning-100 dark:bg-warning-900/40 text-warning-700 dark:text-warning-300 text-xs font-medium rounded-full">
                {pending.length}
              </span>
            )}
          </h2>
          <Link
            to="/officer/grievances"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-1"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {pending.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="All caught up!"
              description="There are no pending grievances to review."
            />
          ) : (
            pending.slice(0, 5).map((g) => (
              <Link
                key={g.id}
                to={`/officer/grievances/${g.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={g.status} />
                    <StatusBadge status={g.reason} />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 truncate">
                    {g.citizen?.fullName} — {g.description || 'No description'}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {format(new Date(g.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 flex-shrink-0 ml-4" />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
