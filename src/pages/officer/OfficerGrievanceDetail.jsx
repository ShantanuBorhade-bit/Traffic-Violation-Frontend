import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { officerGrievanceAPI } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Clock,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

export default function OfficerGrievanceDetail() {
  const { id } = useParams();
  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [officerNote, setOfficerNote] = useState('');

  useEffect(() => {
    async function fetch() {
      try {
        const res = await officerGrievanceAPI.getById(id);
        setGrievance(res.data.grievance);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load grievance');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [id]);

  const handleStartReview = async () => {
    setActionLoading(true);
    try {
      await officerGrievanceAPI.startReview(id);
      setGrievance((prev) => ({ ...prev, status: 'UNDER_REVIEW' }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start review');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await officerGrievanceAPI.approve(id, officerNote);
      setGrievance((prev) => ({ ...prev, status: 'APPROVED', officerNote }));
      setShowApproveModal(false);
      setOfficerNote('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await officerGrievanceAPI.reject(id, officerNote);
      setGrievance((prev) => ({ ...prev, status: 'REJECTED', officerNote }));
      setShowRejectModal(false);
      setOfficerNote('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

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
        <Link to="/officer/grievances" className="btn-primary mt-4">
          Back to Grievances
        </Link>
      </div>
    );
  }

  const isPending = grievance.status === 'PENDING';
  const isUnderReview = grievance.status === 'UNDER_REVIEW';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/officer/grievances"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to grievances
      </Link>

      <div className="card p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={grievance.status} />
              <StatusBadge status={grievance.reason} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Grievance Review</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">ID: {grievance.id}</p>
          </div>
          <div className="flex gap-2">
            {isPending && (
              <button onClick={handleStartReview} disabled={actionLoading} className="btn-primary">
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                Start Review
              </button>
            )}
            {isUnderReview && (
              <>
                <button
                  onClick={() => setShowApproveModal(true)}
                  disabled={actionLoading}
                  className="btn-success"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  className="btn-danger"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Citizen Information
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-500 dark:text-slate-400">Name</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">
                  {grievance.citizen?.fullName}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Email</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">
                  {grievance.citizen?.email}
                </p>
              </div>
            </div>
          </div>

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
                  <p className="text-slate-500 dark:text-slate-400">Vehicle</p>
                  <p className="font-medium text-slate-700 dark:text-slate-200">
                    {grievance.challan.vehicle?.registrationNumber || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {grievance.description && (
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Citizen&apos;s Description
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
                      Review Started
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

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setOfficerNote('');
        }}
        title="Approve Grievance"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-success-50 dark:bg-success-900/20 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-success-600 dark:text-success-400" />
            <p className="text-sm text-success-700 dark:text-success-300">
              This will cancel the associated challan and mark the violation as rejected.
            </p>
          </div>
          <div>
            <label className="input-label">Officer Note</label>
            <textarea
              className="input min-h-[80px]"
              placeholder="Add a note about why this grievance is approved..."
              value={officerNote}
              onChange={(e) => setOfficerNote(e.target.value)}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setShowApproveModal(false);
                setOfficerNote('');
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button onClick={handleApprove} disabled={actionLoading} className="btn-success">
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Confirm Approval
            </button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setOfficerNote('');
        }}
        title="Reject Grievance"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-danger-50 dark:bg-danger-900/20 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-danger-600 dark:text-danger-400" />
            <p className="text-sm text-danger-700 dark:text-danger-300">
              The challan will remain active and the citizen will be notified of the rejection.
            </p>
          </div>
          <div>
            <label className="input-label">Officer Note (required)</label>
            <textarea
              className="input min-h-[80px]"
              placeholder="Explain why this grievance is being rejected..."
              value={officerNote}
              onChange={(e) => setOfficerNote(e.target.value)}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setShowRejectModal(false);
                setOfficerNote('');
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={actionLoading || !officerNote}
              className="btn-danger"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
