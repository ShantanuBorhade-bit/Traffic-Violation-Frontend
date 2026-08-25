import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { grievanceAPI, challanAPI } from '../../api/client';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Spinner from '../../components/Spinner';
import { format } from 'date-fns';
import {
  FileWarning,
  AlertCircle,
  Plus,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [challans, setChallans] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [challanRes, grievanceRes] = await Promise.allSettled([
          grievanceAPI.getMyGrievances(),
        ]);
        if (grievanceRes.status === 'fulfilled') {
          setGrievances(grievanceRes.value.data.grievances || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const pendingGrievances = grievances.filter((g) => g.status === 'PENDING' || g.status === 'UNDER_REVIEW');
  const totalFines = challans
    .filter((c) => c.status === 'ISSUED' || c.status === 'PENDING_PAYMENT')
    .reduce((sum, c) => sum + parseFloat(c.fineAmount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.fullName?.split(' ')[0]}
          </h1>
          <p className="text-slate-500 mt-1">Here&apos;s an overview of your account</p>
        </div>
        <Link to="/citizen/grievances/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          File Grievance
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileWarning} label="Total Challans" value={challans.length} color="warning" />
        <StatCard
          icon={IndianRupee}
          label="Pending Fines"
          value={`₹${totalFines.toLocaleString()}`}
          color="danger"
        />
        <StatCard icon={AlertCircle} label="Grievances" value={grievances.length} color="primary" />
        <StatCard
          icon={Clock}
          label="Pending Reviews"
          value={pendingGrievances.length}
          color="warning"
        />
      </div>

      {/* Recent Grievances */}
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Recent Grievances</h2>
          <Link
            to="/citizen/grievances"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {grievances.length === 0 ? (
            <EmptyState
              icon={AlertCircle}
              title="No grievances yet"
              description="When you file a grievance against a challan, it will appear here."
              action={
                <Link to="/citizen/grievances/new" className="btn-primary text-sm">
                  <Plus className="h-4 w-4" />
                  File Grievance
                </Link>
              }
            />
          ) : (
            grievances.slice(0, 5).map((g) => (
              <Link
                key={g.id}
                to={`/citizen/grievances/${g.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={g.status} />
                    <StatusBadge status={g.reason} />
                  </div>
                  <p className="text-sm text-slate-600 truncate">
                    {g.description || 'No description provided'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
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
