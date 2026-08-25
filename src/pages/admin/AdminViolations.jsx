import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { violationAPI } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Spinner from '../../components/Spinner';
import { FileWarning, Search, ArrowRight, MapPin, Camera } from 'lucide-react';
import { format } from 'date-fns';

const VIOLATION_TYPES = [
  'NO_HELMET', 'NO_SEATBELT', 'RED_LIGHT_JUMP', 'SPEEDING',
  'WRONG_SIDE', 'ILLEGAL_PARKING', 'LANE_VIOLATION',
];

const VIOLATION_ICONS = {
  NO_HELMET: '🪖',
  NO_SEATBELT: '🔗',
  RED_LIGHT_JUMP: '🔴',
  SPEEDING: '⚡',
  WRONG_SIDE: '↩️',
  ILLEGAL_PARKING: '🅿️',
  LANE_VIOLATION: '↔️',
  MORE_THAN_2_PEOPLE_ON_BIKE: '🏍️',
};

export default function AdminViolations() {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    async function fetch() {
      try {
        const res = await violationAPI.list();
        setViolations(res.data.violations || []);
      } catch {
        // endpoint may not exist yet
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  const filtered = violations
    .filter((v) => typeFilter === 'ALL' || v.violationType === typeFilter)
    .filter((v) => statusFilter === 'ALL' || v.status === statusFilter)
    .filter(
      (v) =>
        !search ||
        v.detectedPlate?.toLowerCase().includes(search.toLowerCase()) ||
        v.cameraId?.toLowerCase().includes(search.toLowerCase()) ||
        v.locationText?.toLowerCase().includes(search.toLowerCase())
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Violations</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          All traffic violations detected by the ML system
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            className="input pl-10"
            placeholder="Search by plate, camera, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-auto"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="ALL">All Types</option>
          {VIOLATION_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <select
          className="input w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="RECEIVED">Received</option>
          <option value="VERIFIED">Verified</option>
          <option value="MANUAL_REVIEW">Manual Review</option>
          <option value="REJECTED">Rejected</option>
          <option value="CHALLAN_GENERATED">Challan Generated</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileWarning}
          title="No violations found"
          description={
            search || typeFilter !== 'ALL' || statusFilter !== 'ALL'
              ? 'Try adjusting your filters.'
              : 'Violations detected by the ML model will appear here.'
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((v) => (
            <Link
              key={v.id}
              to={`/admin/violations/${v.id}`}
              className="card-hover block p-5"
            >
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                {v.evidence?.imageUrl ? (
                  <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                    <img
                      src={v.evidence.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-2xl">
                    {VIOLATION_ICONS[v.violationType] || '📋'}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <StatusBadge status={v.status} />
                    {v.duplicateFlag && (
                      <span className="px-2 py-0.5 bg-warning-100 dark:bg-warning-900/40 text-warning-700 dark:text-warning-300 text-xs font-medium rounded-full">
                        Duplicate
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-0.5">
                    {VIOLATION_ICONS[v.violationType]}{' '}
                    {v.violationType?.replace(/_/g, ' ')}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono">{v.detectedPlate}</span>
                    {v.cameraId && (
                      <span className="flex items-center gap-1">
                        <Camera className="h-3 w-3" />
                        {v.cameraId}
                      </span>
                    )}
                    {v.locationText && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{v.locationText}</span>
                      </span>
                    )}
                    {v.detectedAt && (
                      <span className="hidden sm:inline">
                        {format(new Date(v.detectedAt), 'MMM d, h:mm a')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <ArrowRight className="h-5 w-5 text-slate-400 flex-shrink-0 mt-2" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
