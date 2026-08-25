import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { grievanceAPI } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import { format } from 'date-fns';
import { ArrowLeft, User, FileText } from 'lucide-react';

export default function GrievanceDetail() {
  const { id } = useParams();
  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetch() {
      try {
        const res = await grievanceAPI.getGrievanceById(id);
        setGrievance(res.data.grievance);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load grievance');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-danger-600 dark:text-danger-400">{error}</p>
        <Link to="/citizen/grievances" className="btn-primary mt-4">
          Back to Grievances
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/citizen/grievances"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to grievances
      </Link>

      <div className="card p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={grievance.status} />
            <StatusBadge status={grievance.reason} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Grievance Details</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">ID: {grievance.id}</p>
        </div>

        <div className="space-y-4">
          {grievance.challan && (
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Related Challan
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Challan Number</p>
                  <p className="font-medium text-slate-700 dark:text-slate-200">
                    {grievance.challan.challanNumber}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Fine Amount</p>
                  <p className="font-medium text-slate-700 dark:text-slate-200">
                    ₹{parseFloat(grievance.challan.fineAmount).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Status</p>
                  <StatusBadge status={grievance.challan.status} />
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Due Date</p>
                  <p className="font-medium text-slate-700 dark:text-slate-200">
                    {format(new Date(grievance.challan.dueDate), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {grievance.description && (
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Description
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">{grievance.description}</p>
            </div>
          )}

          {grievance.officerNote && (
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800">
              <h3 className="text-sm font-semibold text-primary-700 dark:text-primary-300 mb-2">
                Officer&apos;s Note
              </h3>
              <p className="text-sm text-primary-600 dark:text-primary-400">
                {grievance.officerNote}
              </p>
            </div>
          )}

          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
              Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-primary-100 dark:bg-primary-900/40 rounded-lg mt-0.5">
                  <FileText className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Grievance Filed
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {format(new Date(grievance.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
              {grievance.reviewedAt && (
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-warning-100 dark:bg-warning-900/40 rounded-lg mt-0.5">
                    <User className="h-3.5 w-3.5 text-warning-600 dark:text-warning-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Reviewed by Officer
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {format(new Date(grievance.reviewedAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
