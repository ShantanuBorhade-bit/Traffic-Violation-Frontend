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
  Camera,
  Image,
  X,
  MapPin,
} from 'lucide-react';

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

export default function OfficerGrievanceDetail() {
  const { id } = useParams();
  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [officerNote, setOfficerNote] = useState('');
  const [imageModal, setImageModal] = useState(null);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await officerGrievanceAPI.getById(id);
        setGrievance(res.data.grievance);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load grievance');
      } finally { setLoading(false); }
    }
    fetch();
  }, [id]);

  const handleStartReview = async () => {
    setActionLoading(true);
    try {
      await officerGrievanceAPI.startReview(id);
      setGrievance(prev => ({ ...prev, status: 'UNDER_REVIEW' }));
    } catch (err) { alert(err.response?.data?.message || 'Failed to start review'); }
    finally { setActionLoading(false); }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await officerGrievanceAPI.approve(id, officerNote);
      setGrievance(prev => ({ ...prev, status: 'APPROVED', officerNote }));
      setShowApproveModal(false); setOfficerNote('');
    } catch (err) { alert(err.response?.data?.message || 'Failed to approve'); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await officerGrievanceAPI.reject(id, officerNote);
      setGrievance(prev => ({ ...prev, status: 'REJECTED', officerNote }));
      setShowRejectModal(false); setOfficerNote('');
    } catch (err) { alert(err.response?.data?.message || 'Failed to reject'); }
    finally { setActionLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return (
    <div className="text-center py-20">
      <p className="text-danger-600 dark:text-danger-400">{error}</p>
      <Link to="/officer/grievances" className="btn-primary mt-4">Back to Grievances</Link>
    </div>
  );

  const isPending = grievance.status === 'PENDING';
  const isUnderReview = grievance.status === 'UNDER_REVIEW';
  const grievanceImages = grievance.evidence || [];
  const violationEvidence = grievance.challan?.violation?.evidence;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <ImageModal src={imageModal} alt="Evidence" onClose={() => setImageModal(null)} />

      <Link to="/officer/grievances" className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> Back to grievances
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={grievance.status} />
            <StatusBadge status={grievance.reason} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Grievance Review</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-mono">ID: {grievance.id}</p>
        </div>
        <div className="flex gap-2">
          {isPending && (
            <button onClick={handleStartReview} disabled={actionLoading} className="btn-primary">
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              Start Review
            </button>
          )}
          {isUnderReview && (
            <>
              <button onClick={() => setShowApproveModal(true)} disabled={actionLoading} className="btn-success">
                <CheckCircle2 className="h-4 w-4" /> Approve
              </button>
              <button onClick={() => setShowRejectModal(true)} disabled={actionLoading} className="btn-danger">
                <XCircle className="h-4 w-4" /> Reject
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left — Evidence images + description */}
        <div className="lg:col-span-3 space-y-6">
          {/* Citizen's grievance evidence */}
          {grievanceImages.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Image className="h-4 w-4 text-slate-400" /> Citizen&apos;s Evidence ({grievanceImages.length})
                </h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {grievanceImages.map((img, i) => (
                    <div key={img.id || i} className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 cursor-pointer group" onClick={() => setImageModal(img.imageUrl)}>
                      <img src={img.imageUrl} alt={`Evidence ${i + 1}`} className="w-full h-48 object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-black/70 text-white text-xs font-medium rounded-lg flex items-center gap-1.5">
                          <Camera className="h-3 w-3" /> View full size
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Original violation evidence */}
          {violationEvidence?.imageUrl && (
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Camera className="h-4 w-4 text-slate-400" /> Original Violation Frame
                </h2>
              </div>
              <div className="p-4">
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 cursor-pointer group" onClick={() => setImageModal(violationEvidence.imageUrl)}>
                  <img src={violationEvidence.imageUrl} alt="Violation evidence" className="w-full h-64 sm:h-80 object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-black/70 text-white text-xs font-medium rounded-lg flex items-center gap-1.5">
                      <Camera className="h-3 w-3" /> View full size
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
                      <Camera className="h-3 w-3" /> {grievance.challan?.violation?.cameraId}
                    </div>
                    {grievance.challan?.violation?.locationText && (
                      <div className="flex items-center gap-1 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
                        <MapPin className="h-3 w-3" /> {grievance.challan.violation.locationText}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {grievance.description && (
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Citizen&apos;s Description</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{grievance.description}</p>
            </div>
          )}

          {/* Officer's Note */}
          {grievance.officerNote && (
            <div className="card p-6 border-l-4 border-primary-500">
              <h3 className="text-sm font-semibold text-primary-700 dark:text-primary-300 mb-2">Officer&apos;s Note</h3>
              <p className="text-sm text-primary-600 dark:text-primary-400">{grievance.officerNote}</p>
            </div>
          )}
        </div>

        {/* Right — Info sidebar */}
        <div className="lg:col-span-2 space-y-4">
          {/* Citizen Info */}
          <div className="card p-5">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Citizen Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500">Name</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">{grievance.citizen?.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500">Email</p>
                <p className="font-medium text-slate-700 dark:text-slate-200 truncate">{grievance.citizen?.email}</p>
              </div>
            </div>
          </div>

          {/* Related Challan */}
          {grievance.challan && (
            <div className="card p-5">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Related Challan</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Challan #</p>
                  <p className="font-medium text-slate-700 dark:text-slate-200 font-mono">{grievance.challan.challanNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Fine</p>
                  <p className="font-bold text-danger-600 dark:text-danger-400">₹{parseFloat(grievance.challan.fineAmount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Status</p>
                  <StatusBadge status={grievance.challan.status} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Vehicle</p>
                  <p className="font-medium text-slate-700 dark:text-slate-200 font-mono">{grievance.challan.vehicle?.registrationNumber || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="card p-5">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-primary-100 dark:bg-primary-900/40 rounded-lg mt-0.5">
                  <FileText className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Grievance Filed</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{format(new Date(grievance.createdAt), 'MMM d, yyyy h:mm a')}</p>
                </div>
              </div>
              {grievance.reviewedAt && (
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-warning-100 dark:bg-warning-900/40 rounded-lg mt-0.5">
                    <User className="h-3.5 w-3.5 text-warning-600 dark:text-warning-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Review Started</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{format(new Date(grievance.reviewedAt), 'MMM d, yyyy h:mm a')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      <Modal isOpen={showApproveModal} onClose={() => { setShowApproveModal(false); setOfficerNote(''); }} title="Approve Grievance">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-success-50 dark:bg-success-900/20 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-success-600 dark:text-success-400" />
            <p className="text-sm text-success-700 dark:text-success-300">This will cancel the associated challan and mark the violation as rejected.</p>
          </div>
          <div>
            <label className="input-label">Officer Note</label>
            <textarea className="input min-h-[80px]" placeholder="Add a note about why this grievance is approved..." value={officerNote} onChange={e => setOfficerNote(e.target.value)} />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => { setShowApproveModal(false); setOfficerNote(''); }} className="btn-secondary">Cancel</button>
            <button onClick={handleApprove} disabled={actionLoading} className="btn-success">
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Confirm Approval
            </button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={showRejectModal} onClose={() => { setShowRejectModal(false); setOfficerNote(''); }} title="Reject Grievance">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-danger-50 dark:bg-danger-900/20 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-danger-600 dark:text-danger-400" />
            <p className="text-sm text-danger-700 dark:text-danger-300">The challan will remain active and the citizen will be notified of the rejection.</p>
          </div>
          <div>
            <label className="input-label">Officer Note (required)</label>
            <textarea className="input min-h-[80px]" placeholder="Explain why this grievance is being rejected..." value={officerNote} onChange={e => setOfficerNote(e.target.value)} />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => { setShowRejectModal(false); setOfficerNote(''); }} className="btn-secondary">Cancel</button>
            <button onClick={handleReject} disabled={actionLoading || !officerNote} className="btn-danger">
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
