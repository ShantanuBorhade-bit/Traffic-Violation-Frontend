import clsx from 'clsx';

const COLOR_MAP = {
  primary: {
    bg: 'bg-primary-50',
    icon: 'text-primary-600',
    value: 'text-primary-900',
  },
  success: {
    bg: 'bg-success-50',
    icon: 'text-success-600',
    value: 'text-success-900',
  },
  warning: {
    bg: 'bg-warning-50',
    icon: 'text-warning-600',
    value: 'text-warning-900',
  },
  danger: {
    bg: 'bg-danger-50',
    icon: 'text-danger-600',
    value: 'text-danger-900',
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
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className={clsx('text-2xl font-bold', colors.value)}>{value}</p>
      </div>
    </div>
  );
}
