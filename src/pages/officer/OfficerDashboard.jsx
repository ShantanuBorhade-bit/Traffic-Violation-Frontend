import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { officerGrievanceAPI, manualViolationAPI } from '../../api/client';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Spinner from '../../components/Spinner';
import { Stagger, FadeIn } from '../../components/AnimatedElements';
import { format } from 'date-fns';
import {
  Clock,
  CheckCircle2,
  ArrowRight,
  FileText,
  Camera,
  IndianRupee,
  Plus,
  MapPin,
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

// ─── Traffic Officer Dashboard ───
function TrafficOfficerContent() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await manualViolationAPI.list();
        setUploads(res.data.violations || []);
      } catch { /* ignore */ } finally { setLoading(false); }
    }
    fetch();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-10"><Spinner size="lg" /></div>;

  const challanCount = uploads.filter(v => v.challan).length;
  const totalFines = uploads.filter(v => v.challan).reduce((s, v) => s + parseFloat(v.challan?.fineAmount || 0), 0);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Total Uploads" value={uploads.length} color="primary" />
        <StatCard icon={CheckCircle2} label="Challans Issued" value={challanCount} color="success" />
        <StatCard icon={IndianRupee} label="Total Fines" value={`₹${totalFines.toLocaleString()}`} color="danger" />
        <StatCard icon={Camera} label="This Month" value={uploads.filter(v => {
          const d = new Date(v.createdAt);
          const now = new Date();
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length} color="warning" />
      </div>

      <div className="flex gap-3">
        <Link to="/officer/upload" className="btn-primary">
          <Camera className="h-4 w-4" /> Upload Violation
        </Link>
        <Link to="/officer/uploads" className="btn-secondary">
          View All Uploads
        </Link>
      </div>

      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Uploads</h2>
          <Link to="/officer/uploads" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {uploads.length === 0 ? (
            <EmptyState icon={Camera} title="No uploads yet" description="Upload your first manual violation from the field."
              action={<Link to="/officer/upload" className="btn-primary text-sm"><Plus className="h-4 w-4" /> Upload Now</Link>} />
          ) : (
            uploads.slice(0, 5).map(v => (
              <div key={v.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                {v.evidence?.imageUrl ? (
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                    <img src={v.evidence.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl border border-slate-200 dark:border-slate-600">
                    {VIOLATION_ICONS[v.violationType] || '📋'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1"><StatusBadge status={v.status} /></div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {VIOLATION_LABELS[v.violationType] || v.violationType}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 mt-1">
                    <span className="font-mono">{v.detectedPlate}</span>
                    {v.locationText && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {v.locationText}</span>}
                    <span>{format(new Date(v.createdAt), 'MMM d, h:mm a')}</span>
                  </div>
                </div>
                {v.challan && (
                  <p className="text-sm font-bold text-danger-600 flex-shrink-0">₹{parseFloat(v.challan.fineAmount).toLocaleString()}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

// ─── Grievance Officer Dashboard ───
function GrievanceOfficerContent() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await officerGrievanceAPI.list();
        setGrievances(res.data.grievances || []);
      } catch { /* ignore */ } finally { setLoading(false); }
    }
    fetch();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-10"><Spinner size="lg" /></div>;

  const pending = grievances.filter(g => g.status === 'PENDING');
  const underReview = grievances.filter(g => g.status === 'UNDER_REVIEW');
  const approved = grievances.filter(g => g.status === 'APPROVED');
  const totalFineAtStake = pending.reduce((s, g) => s + parseFloat(g.challan?.fineAmount || 0), 0);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Clock} label="Pending" value={pending.length} color="warning" />
        <StatCard icon={FileText} label="Under Review" value={underReview.length} color="primary" />
        <StatCard icon={CheckCircle2} label="Approved" value={approved.length} color="success" />
        <StatCard icon={IndianRupee} label="Fine at Stake" value={`₹${totalFineAtStake.toLocaleString()}`} color="danger" />
      </div>

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
          <Link to="/officer/grievances" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {pending.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="All caught up!" description="There are no pending grievances to review." />
          ) : (
            pending.slice(0, 5).map(g => {
              const evidenceUrl = g.challan?.violation?.evidence?.imageUrl;
              return (
                <Link key={g.id} to={`/officer/grievances/${g.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  {evidenceUrl ? (
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                      <img src={evidenceUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600">
                      <Camera className="h-5 w-5 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={g.status} />
                      <StatusBadge status={g.reason} />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 truncate">{g.citizen?.fullName} — {g.description || 'No description'}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {g.challan?.vehicle?.registrationNumber && <span className="font-mono">{g.challan.vehicle.registrationNumber}</span>}
                      {g.challan?.fineAmount && <span className="font-medium text-danger-500">₹{parseFloat(g.challan.fineAmount).toLocaleString()}</span>}
                      <span>{format(new Date(g.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 flex-shrink-0 ml-4" />
                </Link>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

// ─── Main Dashboard ───
export default function OfficerDashboard() {
  const { user } = useAuth();
  const isTrafficOfficer = user?.role === 'TRAFFIC_OFFICER';

  return (
    <Stagger className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isTrafficOfficer ? 'Traffic Officer Dashboard' : 'Grievance Officer Dashboard'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Welcome, {user?.fullName}. {isTrafficOfficer ? 'Upload and manage traffic violations from the field.' : 'Review and manage citizen grievances.'}
          </p>
        </div>
      </FadeIn>

      <FadeIn>
        {isTrafficOfficer ? <TrafficOfficerContent /> : <GrievanceOfficerContent />}
      </FadeIn>
    </Stagger>
  );
}
