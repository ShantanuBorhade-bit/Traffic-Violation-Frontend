import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { grievanceAPI } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Spinner from '../../components/Spinner';
import { format } from 'date-fns';
import { AlertCircle, Plus, ArrowRight, Search } from 'lucide-react';

export default function MyGrievances() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    async function fetch() {
      try {
        const res = await grievanceAPI.getMyGrievances();
        setGrievances(res.data.grievances || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  const filtered =
    filter === 'ALL'
      ? grievances
      : grievances.filter((g) => g.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Grievances</h1>
          <p className="text-slate-500 mt-1">Track and manage your filed grievances</p>
        </div>
        <Link to="/citizen/grievances/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          File Grievance
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              filter === status
                ? 'bg-primary-100 text-primary-700'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {status === 'ALL' ? 'All' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="No grievances found"
          description={filter === 'ALL' ? "You haven't filed any grievances yet." : `No grievances with status "${filter}".`}
          action={
            <Link to="/citizen/grievances/new" className="btn-primary text-sm">
              <Plus className="h-4 w-4" />
              File Grievance
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((g) => (
            <Link
              key={g.id}
              to={`/citizen/grievances/${g.id}`}
              className="card-hover block p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge status={g.status} />
                    <StatusBadge status={g.reason} />
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    {g.description || 'No description provided'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    {g.challan?.challanNumber && (
                      <span>Challan: {g.challan.challanNumber}</span>
                    )}
                    {g.challan?.vehicle?.registrationNumber && (
                      <span>Vehicle: {g.challan.vehicle.registrationNumber}</span>
                    )}
                    <span>{format(new Date(g.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400 flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
