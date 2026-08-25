import clsx from 'clsx';

const STATUS_STYLES = {
  RECEIVED: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
  VERIFIED: 'bg-success-100 dark:bg-success-900/40 text-success-700 dark:text-success-300',
  MANUAL_REVIEW: 'bg-warning-100 dark:bg-warning-900/40 text-warning-700 dark:text-warning-300',
  REJECTED: 'bg-danger-100 dark:bg-danger-900/40 text-danger-700 dark:text-danger-300',
  VEHICLE_NOT_FOUND: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
  DUPLICATE_REVIEW: 'bg-warning-100 dark:bg-warning-900/40 text-warning-700 dark:text-warning-300',
  CHALLAN_GENERATED: 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300',
  ISSUED: 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300',
  PENDING_PAYMENT: 'bg-warning-100 dark:bg-warning-900/40 text-warning-700 dark:text-warning-300',
  PAID: 'bg-success-100 dark:bg-success-900/40 text-success-700 dark:text-success-300',
  CANCELLED: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
  CLOSED: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
  DISPUTED: 'bg-danger-100 dark:bg-danger-900/40 text-danger-700 dark:text-danger-300',
  PENDING: 'bg-warning-100 dark:bg-warning-900/40 text-warning-700 dark:text-warning-300',
  UNDER_REVIEW: 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300',
  APPROVED: 'bg-success-100 dark:bg-success-900/40 text-success-700 dark:text-success-300',
  FALSE_DETECTION: 'bg-danger-100 dark:bg-danger-900/40 text-danger-700 dark:text-danger-300',
  VEHICLE_NOT_MINE: 'bg-danger-100 dark:bg-danger-900/40 text-danger-700 dark:text-danger-300',
  NOT_MYSELF_DRIVING: 'bg-warning-100 dark:bg-warning-900/40 text-warning-700 dark:text-warning-300',
  CHALLAN_ALREADY_PAID: 'bg-success-100 dark:bg-success-900/40 text-success-700 dark:text-success-300',
  OTHER: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
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
        STATUS_STYLES[status] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
        className
      )}
    >
      {LABELS[status] || status}
    </span>
  );
}
