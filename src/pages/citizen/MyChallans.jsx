import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { citizenChallanAPI } from '../../api/client';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Spinner from '../../components/Spinner';
import { format, isPast, formatDistanceToNow } from 'date-fns';
import {
  FileWarning,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Camera,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Search,
  AlertCircle,
  MapPin,
  X,
} from 'lucide-react';
import clsx from 'clsx';

const VIOLATION_LABELS = {
  NO_HELMET: 'No Helmet', NO_SEATBELT: 'No Seatbelt',
  RED_LIGHT_JUMP: 'Red Light Jump', SPEEDING: 'Speeding',
  WRONG_SIDE: 'Wrong Side Driving', ILLEGAL_PARKING: 'Illegal Parking',
  LANE_VIOLATION: 'Lane Violation', MORE_THAN_2_PEOPLE_ON_BIKE: 'More Than 2 on Bike',
};

const VIOLATION_ICONS = {
  NO_HELMET: '🪖', NO_SEATBELT: '🔗', RED_LIGHT_JUMP: '🔴',
  SPEEDING: '⚡', WRONG_SIDE: '↩️', ILLEGAL_PARKING: '🅿️',
  LANE_VIOLATION: '↔️', MORE_THAN_2_PEOPLE_ON_BIKE: '🏍️',
};

function ImageModal({ src, alt, onClose }) {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh] mx-4" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-3 -right-3 z-10 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700">
          <X className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        </button>
        <img src={src} alt={alt} className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl" />
      </div>
    </div>
  );
}

function ChallanCard({ challan, onViewImage }) {
  const [expanded, setExpanded] = useState(false);
  const isOverdue =
    (challan.status === 'ISSUED' || challan.status === 'PENDING_PAYMENT') &&
    isPast(new Date(challan.dueDate));
  const evidenceUrl = challan.violation?.evidence?.imageUrl;

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        {/* Evidence thumbnail */}
        {evidenceUrl ? (
          <div
            className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 cursor-pointer hover:ring-2 hover:ring-primary-400 transition-all"
            onClick={(e) => { e.stopPropagation(); onViewImage(evidenceUrl); }}
          >
            <img src={evidenceUrl} alt="Violation evidence" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-2xl border border-slate-200 dark:border-slate-600">
            {VIOLATION_ICONS[challan.violation?.violationType] || '📋'}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-mono font-semibold text-slate-800 dark:text-slate-200">
              {challan.challanNumber}
            </span>
            <StatusBadge status={challan.status} />
            {isOverdue && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-danger-100 dark:bg-danger-900/40 text-danger-700 dark:text-danger-400 text-xs font-medium rounded-full">
                <AlertTriangle className="h-3 w-3" /> Overdue
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {VIOLATION_LABELS[challan.violation?.violationType] || 'Traffic Violation'}
            {challan.vehicle?.registrationNumber && (
              <span className="text-slate-400 dark:text-slate-500"> · {challan.vehicle.registrationNumber}</span>
            )}
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 mt-1">
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Issued {format(new Date(challan.issuedAt), 'MMM d, yyyy')}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Due {format(new Date(challan.dueDate), 'MMM d, yyyy')}</span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-slate-900 dark:text-white">₹{parseFloat(challan.fineAmount).toLocaleString()}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">fine</p>
        </div>

        <div className="flex-shrink-0 text-slate-400">
          {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 px-5 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Evidence Image — Left side, prominent */}
            {evidenceUrl && (
              <div className="lg:col-span-3">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  📸 Violation Frame
                </h4>
                <div
                  className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 cursor-pointer group"
                  onClick={() => onViewImage(evidenceUrl)}
                >
                  <img
                    src={evidenceUrl}
                    alt="Violation evidence"
                    className="w-full h-64 sm:h-80 object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-black/70 text-white text-sm font-medium rounded-lg">
                      Click to enlarge
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
                      <Camera className="h-3 w-3" /> {challan.violation?.cameraId}
                    </div>
                    {challan.violation?.locationText && (
                      <div className="flex items-center gap-1 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
                        <MapPin className="h-3 w-3" /> {challan.violation.locationText}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Details — Right side */}
            <div className={clsx('space-y-4', evidenceUrl ? 'lg:col-span-2' : 'lg:col-span-5')}>
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Challan Details
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Challan Number</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 font-mono">{challan.challanNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Fine Amount</p>
                    <p className="text-sm font-bold text-danger-600 dark:text-danger-400">₹{parseFloat(challan.fineAmount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Status</p>
                    <StatusBadge status={challan.status} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Due Date</p>
                    <p className={clsx('text-sm font-medium', isOverdue ? 'text-danger-600 dark:text-danger-400' : 'text-slate-700 dark:text-slate-200')}>
                      {format(new Date(challan.dueDate), 'MMM d, yyyy')}
                      {isOverdue && <span className="text-xs text-danger-500 ml-1">({formatDistanceToNow(new Date(challan.dueDate))} ago)</span>}
                    </p>
                  </div>
                  {challan.paidAt && (
                    <div>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Paid On</p>
                      <p className="text-sm font-medium text-success-600 dark:text-success-400">{format(new Date(challan.paidAt), 'MMM d, yyyy')}</p>
                    </div>
                  )}
                </div>
              </div>

              {challan.violation && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Violation Info
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Type</p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {VIOLATION_ICONS[challan.violation.violationType]} {VIOLATION_LABELS[challan.violation.violationType] || challan.violation.violationType}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Plate Number</p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 font-mono">{challan.violation.detectedPlate}</p>
                    </div>
                    {challan.violation.detectedAt && (
                      <div className="col-span-2">
                        <p className="text-xs text-slate-400 dark:text-slate-500">Detected At</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {format(new Date(challan.violation.detectedAt), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                {(challan.status === 'ISSUED' || challan.status === 'PENDING_PAYMENT') && (
                  <Link to={`/citizen/grievances/new?challanId=${challan.id}`} className="btn-secondary text-sm">
                    <AlertCircle className="h-4 w-4" /> File Grievance
                  </Link>
                )}
                {challan.status === 'DISPUTED' && (
                  <span className="text-sm text-warning-600 dark:text-warning-400 font-medium flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" /> Under grievance review
                  </span>
                )}
                {challan.status === 'PAID' && (
                  <span className="text-sm text-success-600 dark:text-success-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Payment confirmed
                  </span>
                )}
                {challan.status === 'CANCELLED' && (
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Challan cancelled
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyChallans() {
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [imageModal, setImageModal] = useState(null);

  useEffect(() => {
    async function fetchChallans() {
      try {
        const res = await citizenChallanAPI.getMyChallans();
        setChallans(res.data.challans || []);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Challan listing endpoint not available yet. Backend needs GET /api/v1/challans/my');
        } else {
          setError(err.response?.data?.message || 'Failed to load challans');
        }
      } finally { setLoading(false); }
    }
    fetchChallans();
  }, []);

  const filtered = challans
    .filter(c => filter === 'ALL' || c.status === filter)
    .filter(s => !search || s.challanNumber?.toLowerCase().includes(search.toLowerCase()) || s.vehicle?.registrationNumber?.toLowerCase().includes(search.toLowerCase()) || VIOLATION_LABELS[s.violation?.violationType]?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.issuedAt) - new Date(a.issuedAt);
      if (sortBy === 'fine') return parseFloat(b.fineAmount) - parseFloat(a.fineAmount);
      if (sortBy === 'due') return new Date(a.dueDate) - new Date(b.dueDate);
      return 0;
    });

  const totalFines = challans.filter(c => c.status === 'ISSUED' || c.status === 'PENDING_PAYMENT').reduce((sum, c) => sum + parseFloat(c.fineAmount || 0), 0);
  const paidCount = challans.filter(c => c.status === 'PAID').length;
  const overdueCount = challans.filter(c => (c.status === 'ISSUED' || c.status === 'PENDING_PAYMENT') && isPast(new Date(c.dueDate))).length;

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <ImageModal src={imageModal} alt="Violation evidence" onClose={() => setImageModal(null)} />

      <div>
        <Link to="/citizen" className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-4">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Challans</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">View all traffic violation challans issued against your vehicles</p>
      </div>

      {error ? (
        <div className="card p-8 text-center">
          <div className="p-4 bg-warning-50 dark:bg-warning-900/30 rounded-2xl w-fit mx-auto mb-4">
            <AlertTriangle className="h-10 w-10 text-warning-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Endpoint Not Available</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">{error}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={FileWarning} label="Total Challans" value={challans.length} color="primary" />
            <StatCard icon={IndianRupee} label="Pending Fines" value={`₹${totalFines.toLocaleString()}`} color="danger" />
            <StatCard icon={CheckCircle2} label="Paid" value={paidCount} color="success" />
            <StatCard icon={AlertTriangle} label="Overdue" value={overdueCount} color="warning" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" className="input pl-10" placeholder="Search by challan #, vehicle, or type..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input w-auto" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="ISSUED">Issued</option>
              <option value="PENDING_PAYMENT">Pending Payment</option>
              <option value="PAID">Paid</option>
              <option value="DISPUTED">Disputed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select className="input w-auto" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="date">Sort by Date</option>
              <option value="fine">Sort by Fine Amount</option>
              <option value="due">Sort by Due Date</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={FileWarning} title="No challans found" description={search ? 'Try a different search term.' : filter !== 'ALL' ? `No challans with status "${filter}".` : 'You have no traffic violation challans. Nice driving!'} />
          ) : (
            <div className="space-y-3">
              {filtered.map(challan => (
                <ChallanCard key={challan.id} challan={challan} onViewImage={setImageModal} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
