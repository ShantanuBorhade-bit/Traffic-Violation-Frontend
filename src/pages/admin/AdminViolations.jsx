import { useState } from 'react';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { FileWarning, Search } from 'lucide-react';

const MOCK_VIOLATIONS = [
  // Placeholder - will be populated from API when endpoints are available
];

const VIOLATION_TYPES = [
  'NO_HELMET',
  'NO_SEATBELT',
  'RED_LIGHT_JUMP',
  'SPEEDING',
  'WRONG_SIDE',
  'ILLEGAL_PARKING',
  'LANE_VIOLATION',
];

export default function AdminViolations() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const violations = MOCK_VIOLATIONS;

  const filtered = violations
    .filter((v) => typeFilter === 'ALL' || v.violationType === typeFilter)
    .filter((v) => statusFilter === 'ALL' || v.status === statusFilter)
    .filter(
      (v) =>
        !search ||
        v.detectedPlate?.toLowerCase().includes(search.toLowerCase()) ||
        v.cameraId?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Violations</h1>
        <p className="text-slate-500 mt-1">All traffic violations detected by the ML system</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            className="input pl-10"
            placeholder="Search by plate or camera..."
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

      {/* Table or Empty State */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FileWarning}
          title="No violations found"
          description="Violations detected by the ML model will appear here. The backend violation listing API may need to be implemented."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                    Type
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                    Plate
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                    Camera
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                    Detected At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {v.violationType?.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">{v.detectedPlate}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{v.cameraId}</td>
                    <td className="px-6 py-4"><StatusBadge status={v.status} /></td>
                    <td className="px-6 py-4 text-sm text-slate-500">{v.detectedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
