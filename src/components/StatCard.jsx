import clsx from 'clsx';

const COLOR_MAP = {
  primary: {
    bg: 'bg-primary-50 dark:bg-primary-900/30',
    icon: 'text-primary-600 dark:text-primary-400',
    value: 'text-primary-900 dark:text-primary-200',
  },
  success: {
    bg: 'bg-success-50 dark:bg-success-900/30',
    icon: 'text-success-600 dark:text-success-400',
    value: 'text-success-900 dark:text-success-200',
  },
  warning: {
    bg: 'bg-warning-50 dark:bg-warning-900/30',
    icon: 'text-warning-600 dark:text-warning-400',
    value: 'text-warning-900 dark:text-warning-200',
  },
  danger: {
    bg: 'bg-danger-50 dark:bg-danger-900/30',
    icon: 'text-danger-600 dark:text-danger-400',
    value: 'text-danger-900 dark:text-danger-200',
  },
};

export default function StatCard({ icon: Icon, label, value, color = 'primary', className }) {
  const colors = COLOR_MAP[color] || COLOR_MAP.primary;

  return (
    <div className={clsx('card p-5 flex items-center gap-4', className)}>
      <div className={clsx('p-3 rounded-xl', colors.bg)}>
        <Icon className={clsx('h-6 w-6', colors.icon)} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className={clsx('text-2xl font-bold', colors.value)}>{value}</p>
      </div>
    </div>
  );
}
