import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { violationAPI } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Camera,
  MapPin,
  Calendar,
  Clock,
  Brain,
  Target,
  Shield,
  AlertTriangle,
  Hash,
  Gauge,
  Eye,
  EyeOff,
  Copy,
  Check,
  Image,
  Car,
  FileText,
} from 'lucide-react';
import clsx from 'clsx';

const VIOLATION_LABELS = {
  NO_HELMET: 'No Helmet',
  NO_SEATBELT: 'No Seatbelt',
  RED_LIGHT_JUMP: 'Red Light Jump',
  SPEEDING: 'Speeding',
  WRONG_SIDE: 'Wrong Side Driving',
  ILLEGAL_PARKING: 'Illegal Parking',
  LANE_VIOLATION: 'Lane Violation',
  MORE_THAN_2_PEOPLE_ON_BIKE: 'More Than 2 on Bike',
};

const RECOMMENDATION_STYLES = {
  AUTO_VERIFY: 'bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-300 border-success-200 dark:border-success-800',
  OFFICER_REVIEW: 'bg-warning-50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300 border-warning-200 dark:border-warning-800',
  REJECT: 'bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300 border-danger-200 dark:border-danger-800',
};

const RECOMMENDATION_LABELS = {
  AUTO_VERIFY: 'Auto Verify',
  OFFICER_REVIEW: 'Officer Review',
  REJECT: 'Reject',
};

function DetailCard({ icon: Icon, label, children, className }) {
  return (
    <div className={clsx('p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl', className)}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-slate-400" />
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </h3>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value, mono, className }) {
  return (
    <div className={className}>
      <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
      <p
        className={clsx(
          'text-sm font-medium text-slate-700 dark:text-slate-200',
          mono && 'font-mono'
        )}
      >
        {value || '—'}
      </p>
    </div>
  );
}

export default function AdminViolationDetail() {
  const { id } = useParams();
  const [violation, setViolation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRawJson, setShowRawJson] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await violationAPI.getById(id);
        setViolation(res.data.violation);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load violation');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [id]);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(violation?.rawModelPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <Link to="/admin/violations" className="btn-primary mt-4">
          Back to Violations
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        to="/admin/violations"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to violations
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={violation.status} />
            <StatusBadge
              status={violation.recommendation}
              className={
                RECOMMENDATION_STYLES[violation.recommendation] || ''
              }
            />
            {violation.duplicateFlag && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-warning-100 dark:bg-warning-900/40 text-warning-700 dark:text-warning-300 text-xs font-medium rounded-full">
                <AlertTriangle className="h-3 w-3" />
                Duplicate ({Math.round(violation.duplicateConfidence * 100)}%)
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {VIOLATION_LABELS[violation.violationType] || violation.violationType}
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-mono">
            ID: {violation.id}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column — Evidence image + key info */}
        <div className="lg:col-span-3 space-y-6">
          {/* Evidence Image */}
          {violation.evidence?.imageUrl ? (
            <div className="card overflow-hidden">
              <div className="relative">
                <img
                  src={violation.evidence.imageUrl}
                  alt={`Violation evidence - ${violation.violationType}`}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
                    <Camera className="h-3 w-3" />
                    {violation.cameraId}
                  </div>
                  {violation.areaCode && (
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
                      <MapPin className="h-3 w-3" />
                      {violation.areaCode}
                    </div>
                  )}
                </div>
                {violation.evidence.uploadedBy && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-white text-xs">
                      Source: {violation.evidence.uploadedBy.replace(/_/g, ' ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center">
              <Image className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No evidence image available</p>
            </div>
          )}

          {/* Raw ML Payload */}
          <div className="card">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Raw ML Payload
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyJson}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-success-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  {showRawJson ? (
                    <>
                      <EyeOff className="h-3 w-3" />
                      Collapse
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3" />
                      Expand
                    </>
                  )}
                </button>
              </div>
            </div>
            {showRawJson && (
              <div className="p-4">
                <pre className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-lg p-4 overflow-x-auto max-h-96 overflow-y-auto">
                  {JSON.stringify(violation.rawModelPayload, null, 2)}
                </pre>
              </div>
            )}
            {!showRawJson && (
              <div className="px-6 py-3">
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Click "Expand" to view the complete JSON payload from the ML model
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right column — Metadata cards */}
        <div className="lg:col-span-2 space-y-4">
          {/* Detection Info */}
          <DetailCard icon={Shield} label="Detection Info">
            <div className="grid grid-cols-2 gap-3">
              <InfoRow
                label="Violation Type"
                value={VIOLATION_LABELS[violation.violationType]}
              />
              <InfoRow
                label="Status"
                value={
                  <StatusBadge status={violation.status} className="mt-0.5" />
                }
              />
              <InfoRow
                label="Detected Plate"
                value={violation.detectedPlate}
                mono
              />
              <InfoRow
                label="Normalized Plate"
                value={violation.normalizedPlate}
                mono
              />
              <InfoRow
                label="OCR Confidence"
                value={`${Math.round(violation.ocrConfidence * 100)}%`}
              />
              <InfoRow
                label="Recommendation"
                value={RECOMMENDATION_LABELS[violation.recommendation]}
              />
            </div>
          </DetailCard>

          {/* Location & Camera */}
          <DetailCard icon={Camera} label="Location & Camera">
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="Camera ID" value={violation.cameraId} mono />
              <InfoRow label="Area Code" value={violation.areaCode} mono />
              <InfoRow
                label="Location"
                value={violation.locationText}
                className="col-span-2"
              />
              {violation.latitude && violation.longitude && (
                <InfoRow
                  label="Coordinates"
                  value={`${violation.latitude}, ${violation.longitude}`}
                  mono
                  className="col-span-2"
                />
              )}
            </div>
          </DetailCard>

          {/* Timing */}
          <DetailCard icon={Clock} label="Timing">
            <div className="grid grid-cols-2 gap-3">
              <InfoRow
                label="Detected At"
                value={
                  violation.detectedAt
                    ? format(new Date(violation.detectedAt), 'MMM d, yyyy h:mm a')
                    : null
                }
              />
              {violation.frameNumber != null && (
                <InfoRow label="Frame #" value={violation.frameNumber} />
              )}
              {violation.videoTimestampSec != null && (
                <InfoRow
                  label="Video Timestamp"
                  value={`${violation.videoTimestampSec.toFixed(1)}s`}
                />
              )}
              <InfoRow
                label="Created"
                value={format(new Date(violation.createdAt), 'MMM d, yyyy h:mm a')}
              />
            </div>
          </DetailCard>

          {/* Model Info */}
          <DetailCard icon={Gauge} label="Model Info">
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="Model Version" value={violation.modelVersion} mono />
              <InfoRow label="Event ID" value={violation.modelEventId} mono />
            </div>
          </DetailCard>

          {/* Duplicate Detection */}
          <DetailCard icon={AlertTriangle} label="Duplicate Detection">
            <div className="grid grid-cols-2 gap-3">
              <InfoRow
                label="Flagged"
                value={violation.duplicateFlag ? 'Yes' : 'No'}
              />
              <InfoRow
                label="Confidence"
                value={`${Math.round(violation.duplicateConfidence * 100)}%`}
              />
            </div>
          </DetailCard>

          {/* Related Vehicle */}
          {violation.vehicle && (
            <DetailCard icon={Car} label="Registered Vehicle">
              <div className="space-y-2">
                <InfoRow
                  label="Registration"
                  value={violation.vehicle.registrationNumber}
                  mono
                />
                {violation.vehicle.owner && (
                  <InfoRow
                    label="Owner"
                    value={violation.vehicle.owner.fullName}
                  />
                )}
              </div>
            </DetailCard>
          )}

          {/* Related Challan */}
          {violation.challan && (
            <DetailCard icon={FileText} label="Generated Challan">
              <div className="grid grid-cols-2 gap-3">
                <InfoRow
                  label="Challan #"
                  value={violation.challan.challanNumber}
                  mono
                />
                <InfoRow
                  label="Fine"
                  value={`₹${parseFloat(violation.challan.fineAmount).toLocaleString()}`}
                />
                <InfoRow label="Status" value={violation.challan.status} />
                <InfoRow
                  label="Due Date"
                  value={format(new Date(violation.challan.dueDate), 'MMM d, yyyy')}
                />
              </div>
            </DetailCard>
          )}
        </div>
      </div>
    </div>
  );
}
