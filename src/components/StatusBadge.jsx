import clsx from 'clsx';

const STATUS_STYLES = {
  // Violation statuses
  RECEIVED: 'bg-slate-100 text-slate-700',
  VERIFIED: 'bg-success-100 text-success-700',
  MANUAL_REVIEW: 'bg-warning-100 text-warning-700',
  REJECTED: 'bg-danger-100 text-danger-700',
  VEHICLE_NOT_FOUND: 'bg-slate-100 text-slate-500',
  DUPLICATE_REVIEW: 'bg-warning-100 text-warning-700',
  CHALLAN_GENERATED: 'bg-primary-100 text-primary-700',

  // Challan statuses
  ISSUED: 'bg-primary-100 text-primary-700',
  PENDING_PAYMENT: 'bg-warning-100 text-warning-700',
  PAID: 'bg-success-100 text-success-700',
  CANCELLED: 'bg-slate-100 text-slate-500',
  CLOSED: 'bg-slate-100 text-slate-500',
  DISPUTED: 'bg-danger-100 text-danger-700',

  // Grievance statuses
  PENDING: 'bg-warning-100 text-warning-700',
  UNDER_REVIEW: 'bg-primary-100 text-primary-700',
  APPROVED: 'bg-success-100 text-success-700',

  // Grievance reasons
  FALSE_DETECTION: 'bg-danger-100 text-danger-700',
  VEHICLE_NOT_MINE: 'bg-danger-100 text-danger-700',
  NOT_MYSELF_DRIVING: 'bg-warning-100 text-warning-700',
  CHALLAN_ALREADY_PAID: 'bg-success-100 text-success-700',
  OTHER: 'bg-slate-100 text-slate-600',
};

const LABELS = {
  RECEIVED: 'Received',
  VERIFIED: 'Verified',
  MANUAL_REVIEW: 'Manual Review',
  REJECTED: 'Rejected',
  VEHICLE_NOT_FOUND: 'Vehicle Not Found',
  DUPLICATE_REVIEW: 'Duplicate Review',
  CHALLAN_GENERATED: 'Challan Generated',
  ISSUED: 'Issued',
  PENDING_PAYMENT: 'Pending Payment',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
  CLOSED: 'Closed',
  DISPUTED: 'Disputed',
  PENDING: 'Pending',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  FALSE_DETECTION: 'False Detection',
  VEHICLE_NOT_MINE: 'Vehicle Not Mine',
  NOT_MYSELF_DRIVING: 'Not Myself Driving',
  CHALLAN_ALREADY_PAID: 'Already Paid',
  OTHER: 'Other',
};

export default function StatusBadge({ status, className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        STATUS_STYLES[status] || 'bg-slate-100 text-slate-600',
        className
      )}
    >
      {LABELS[status] || status}
    </span>
  );
}
