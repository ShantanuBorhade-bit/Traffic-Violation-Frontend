import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { grievanceAPI, citizenChallanAPI } from '../../api/client';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Spinner from '../../components/Spinner';
import { Stagger, FadeIn } from '../../components/AnimatedElements';
import { format } from 'date-fns';
import {
  FileWarning,
  AlertCircle,
  Plus,
  Clock,
  ArrowRight,
  IndianRupee,
  CheckCircle2,
  Camera,
  AlertTriangle,
} from 'lucide-react';

const VIOLATION_ICONS = {
  NO_HELMET: '🪖', NO_SEATBELT: '🔗', RED_LIGHT_JUMP: '🔴',
  SPEEDING: '⚡', WRONG_SIDE: '↩️', ILLEGAL_PARKING: '🅿️',
  LANE_VIOLATION: '↔️', MORE_THAN_2_PEOPLE_ON_BIKE: '🏍️',
};

const VIOLATION_LABELS = {
  NO_HELMET: 'No Helmet', NO_SEATBELT: 'No Seatbelt',
  RED_LIGHT_JUMP: 'Red Light Jump', SPEEDING: 'Speeding',
  WRONG_SIDE: 'Wrong Side Driving', ILLEGAL_PARKING: 'Illegal Parking',
  LANE_VIOLATION: 'Lane Violation', MORE_THAN_2_PEOPLE_ON_BIKE: 'More Than 2 on Bike',
};

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [grievances, setGrievances] = useState([]);
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [grievanceRes, challanRes] = await Promise.allSettled([
          grievanceAPI.getMyGrievances(),
          citizenChallanAPI.getMyChallans(),
        ]);
        if (grievanceRes.status === 'fulfilled') setGrievances(grievanceRes.value.data.grievances || []);
        if (challanRes.status === 'fulfilled') setChallans(challanRes.value.data.challans || []);
      } catch { /* ignore */ } finally { setLoading(false); }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  const pendingGrievances = grievances.filter(g => g.status === 'PENDING' || g.status === 'UNDER_REVIEW');
  const activeChallans = challans.filter(c => c.status === 'ISSUED' || c.status === 'PENDING_PAYMENT');
  const overdueChallans = activeChallans.filter(c => new Date(c.dueDate) < new Date());
  const totalFines = activeChallans.reduce((s, c) => s + parseFloat(c.fineAmount || 0), 0);
  const paidChallans = challans.filter(c => c.status === 'PAID');

  // Combine recent activity from both sources
  const recentActivity = [
    ...challans.slice(0, 3).map(c => ({
      type: 'challan',
      id: c.id,
      title: `${VIOLATION_ICONS[c.violation?.violationType] || '📋'} ${VIOLATION_LABELS[c.violation?.violationType] || 'Violation'}`,
      subtitle: `${c.challanNumber} · ₹${parseFloat(c.fineAmount).toLocaleString()}`,
      status: c.status,
      date: c.issuedAt,
      imageUrl: c.violation?.evidence?.imageUrl,
      cameraId: c.violation?.cameraId,
      link: '/citizen/challans',
    })),
    ...grievances.slice(0, 3).map(g => ({
      type: 'grievance',
      id: g.id,
      title: g.description || 'Grievance Filed',
      subtitle: `Challan: ${g.challan?.challanNumber || 'N/A'}`,
      status: g.status,
      date: g.createdAt,
      imageUrl: null,
      link: `/citizen/grievances/${g.id}`,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <Stagger className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome back, {user?.fullName?.split(' ')[0]}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Here&apos;s an overview of your account
            </p>
          </div>
          <Link to="/citizen/grievances/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            File Grievance
          </Link>
        </div>
      </FadeIn>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FadeIn>
          <StatCard icon={FileWarning} label="Active Challans" value={activeChallans.length} color="danger" />
        </FadeIn>
        <FadeIn>
          <StatCard icon={IndianRupee} label="Pending Fines" value={`₹${totalFines.toLocaleString()}`} color="warning" />
        </FadeIn>
        <FadeIn>
          <StatCard icon={CheckCircle2} label="Paid" value={paidChallans.length} color="success" />
        </FadeIn>
        <FadeIn>
          <StatCard icon={Clock} label="Grievances" value={grievances.length} color="primary" />
        </FadeIn>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <FadeIn>
          <Link to="/citizen/challans" className="card-hover p-5 flex items-center gap-4">
            <div className="p-3 bg-danger-50 dark:bg-danger-900/30 rounded-xl">
              <FileWarning className="h-6 w-6 text-danger-600 dark:text-danger-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">My Challans</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeChallans.length > 0 ? `${activeChallans.length} active · ₹${totalFines.toLocaleString()} due` : 'No active challans'}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400" />
          </Link>
        </FadeIn>
        <FadeIn>
          <Link to="/citizen/grievances" className="card-hover p-5 flex items-center gap-4">
            <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-xl">
              <AlertCircle className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">My Grievances</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {pendingGrievances.length > 0 ? `${pendingGrievances.length} pending review` : 'All resolved'}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400" />
          </Link>
        </FadeIn>
        <FadeIn>
          <Link to="/citizen/grievances/new" className="card-hover p-5 flex items-center gap-4">
            <div className="p-3 bg-success-50 dark:bg-success-900/30 rounded-xl">
              <Plus className="h-6 w-6 text-success-600 dark:text-success-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">File Grievance</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Dispute a challan with evidence</p>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400" />
          </Link>
        </FadeIn>
      </div>

      {/* Overdue Alert */}
      {overdueChallans.length > 0 && (
        <FadeIn>
          <div className="p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-xl flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-danger-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-danger-700 dark:text-danger-300">
                You have {overdueChallans.length} overdue challan{overdueChallans.length > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-danger-600 dark:text-danger-400">
                Total overdue fine: ₹{overdueChallans.reduce((s, c) => s + parseFloat(c.fineAmount || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </FadeIn>
      )}

      {/* Recent Activity with Evidence Thumbnails */}
      <FadeIn>
        <div className="card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
            <Link to="/citizen/challans" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {recentActivity.length === 0 ? (
              <EmptyState
                icon={AlertCircle}
                title="No activity yet"
                description="Your challans and grievances will appear here."
                action={<Link to="/citizen/grievances/new" className="btn-primary text-sm"><Plus className="h-4 w-4" /> File Grievance</Link>}
              />
            ) : (
              recentActivity.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  to={item.link}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  {/* Evidence Thumbnail */}
                  {item.imageUrl ? (
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-2xl border border-slate-200 dark:border-slate-600">
                      {item.type === 'challan' ? '📋' : '📝'}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={item.status} />
                      {item.cameraId && (
                        <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                          <Camera className="h-3 w-3" /> {item.cameraId}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{item.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.subtitle}</p>
                  </div>

                  {/* Date */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {format(new Date(item.date), 'MMM d')}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {format(new Date(item.date), 'h:mm a')}
                    </p>
                  </div>

                  <ArrowRight className="h-4 w-4 text-slate-400 flex-shrink-0 ml-2" />
                </Link>
              ))
            )}
          </div>
        </div>
      </FadeIn>
    </Stagger>
  );
}
