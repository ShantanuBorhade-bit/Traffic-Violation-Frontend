import clsx from 'clsx';

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-16 text-center', className)}>
      {Icon && (
        <div className="p-4 bg-slate-100 rounded-2xl mb-4">
          <Icon className="h-10 w-10 text-slate-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
