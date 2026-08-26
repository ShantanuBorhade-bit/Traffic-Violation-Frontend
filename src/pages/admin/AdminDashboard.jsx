import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { violationAPI, challanAPI, adminUserAPI, grievanceAPI } from '../../api/client';
import StatCard from '../../components/StatCard';
import Spinner from '../../components/Spinner';
import { Stagger, FadeIn } from '../../components/AnimatedElements';
import {
  Users,
  FileWarning,
  AlertCircle,
  BadgeCheck,
  Shield,
  ArrowRight,
  Activity,
  TrendingUp,
  IndianRupee,
} from 'lucide-react';

const QUICK_ACTIONS = [
  { to: '/admin/violations', icon: FileWarning, label: 'Violations', description: 'View and manage all traffic violations detected by the system', color: 'bg-danger-50 dark:bg-danger-900/30 text-danger-600 dark:text-danger-400' },
  { to: '/admin/challans', icon: BadgeCheck, label: 'Challans', description: 'Track and manage all issued challans and payment statuses', color: 'bg-warning-50 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400' },
  { to: '/admin/grievances', icon: AlertCircle, label: 'Grievances', description: 'Review and resolve citizen-submitted grievances', color: 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' },
  { to: '/admin/users', icon: Users, label: 'Users', description: 'Manage user accounts and role assignments', color: 'bg-success-50 dark:bg-success-900/30 text-success-600 dark:text-success-400' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ violations: 0, challans: 0, users: 0, grievances: 0, pendingFines: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [vRes, cRes, uRes, gRes] = await Promise.allSettled([
          violationAPI.list(),
          challanAPI.list(),
          adminUserAPI.list(),
          grievanceAPI.getMyGrievances(), // Using this as a proxy — admin may not have own grievances
        ]);
        const violations = vRes.status === 'fulfilled' ? (vRes.value.data.violations || []) : [];
        const challans = cRes.status === 'fulfilled' ? (cRes.value.data.challans || []) : [];
        const users = uRes.status === 'fulfilled' ? (uRes.value.data.users || []) : [];
        setStats({
          violations: violations.length,
          challans: challans.length,
          users: users.length,
          grievances: gRes.status === 'fulfilled' ? (gRes.value.data.grievances || []).length : 0,
          pendingFines: challans
            .filter(c => c.status === 'ISSUED' || c.status === 'PENDING_PAYMENT')
            .reduce((s, c) => s + parseFloat(c.fineAmount || 0), 0),
        });
      } catch { /* ignore */ } finally { setLoading(false); }
    }
    fetchStats();
  }, []);

  return (
    <Stagger className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Welcome, {user?.fullName}. Manage the traffic violation system.
          </p>
        </div>
      </FadeIn>

      {/* Live Stats */}
      {loading ? (
        <div className="flex items-center justify-center py-10"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={FileWarning} label="Total Violations" value={stats.violations} color="danger" />
          <StatCard icon={BadgeCheck} label="Total Challans" value={stats.challans} color="warning" />
          <StatCard icon={IndianRupee} label="Pending Fines" value={`₹${stats.pendingFines.toLocaleString()}`} color="danger" />
          <StatCard icon={Users} label="Users" value={stats.users} color="primary" />
          <StatCard icon={AlertCircle} label="Grievances" value={stats.grievances} color="success" />
        </div>
      )}

      <FadeIn>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {QUICK_ACTIONS.map(action => (
              <Link key={action.to} to={action.to} className="card-hover p-5 flex items-start gap-4">
                <div className={`p-3 rounded-xl ${action.color}`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{action.label}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{action.description}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400 flex-shrink-0 mt-2" />
              </Link>
            ))}
          </div>
        </div>
      </FadeIn>

      <FadeIn>
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">System Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <Shield className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">System</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Traffic Mama v1.0</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <Activity className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">ML Pipeline</p>
                <p className="text-sm font-medium text-success-600 dark:text-success-400">● Active</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Detection Model</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">v2.1</p>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </Stagger>
  );
}
