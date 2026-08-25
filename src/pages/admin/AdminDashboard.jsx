import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import Spinner from '../../components/Spinner';
import {
  Users,
  FileWarning,
  AlertCircle,
  BadgeCheck,
  Shield,
  ArrowRight,
  Activity,
  TrendingUp,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, violations: 0, challans: 0, grievances: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The backend doesn't expose a stats endpoint, so we'll show the dashboard
    // with role-based quick actions. Stats will be populated when endpoints exist.
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const QUICK_ACTIONS = [
    {
      to: '/admin/violations',
      icon: FileWarning,
      label: 'Violations',
      description: 'View and manage all traffic violations detected by the system',
      color: 'bg-danger-50 text-danger-600',
    },
    {
      to: '/admin/challans',
      icon: BadgeCheck,
      label: 'Challans',
      description: 'Track and manage all issued challans and payment statuses',
      color: 'bg-warning-50 text-warning-600',
    },
    {
      to: '/admin/grievances',
      icon: AlertCircle,
      label: 'Grievances',
      description: 'Review and resolve citizen-submitted grievances',
      color: 'bg-primary-50 text-primary-600',
    },
    {
      to: '/admin/users',
      icon: Users,
      label: 'Users',
      description: 'Manage user accounts and role assignments',
      color: 'bg-success-50 text-success-600',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Welcome, {user?.fullName}. Manage the traffic violation system.
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats.users} color="primary" />
        <StatCard icon={FileWarning} label="Violations" value={stats.violations} color="danger" />
        <StatCard icon={BadgeCheck} label="Challans" value={stats.challans} color="warning" />
        <StatCard icon={AlertCircle} label="Grievances" value={stats.grievances} color="success" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="card-hover p-5 flex items-start gap-4"
            >
              <div className={`p-3 rounded-xl ${action.color}`}>
                <action.icon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-slate-900 mb-1">{action.label}</h3>
                <p className="text-xs text-slate-500">{action.description}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 flex-shrink-0 mt-2" />
            </Link>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">System Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <Shield className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">System</p>
              <p className="text-sm font-medium text-slate-700">TrafficGuard v1.0</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <Activity className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">ML Pipeline</p>
              <p className="text-sm font-medium text-slate-700">Active</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <TrendingUp className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Detection Model</p>
              <p className="text-sm font-medium text-slate-700">v2.1</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
