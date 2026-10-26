import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock,
  CreditCard,
  Loader2,
  Receipt,
  RefreshCw,
  Search,
  Smartphone,
  Sparkles,
  Wallet,
} from 'lucide-react';
import clsx from 'clsx';
import { paymentAPI } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Spinner from '../../components/Spinner';

const METHOD_META = {
  UPI: { label: 'UPI', icon: Smartphone },
  CREDIT_CARD: { label: 'Credit Card', icon: CreditCard },
  DEBIT_CARD: { label: 'Debit Card', icon: Wallet },
};

const inr = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const FILTERS = ['ALL', 'SUCCESS', 'PENDING', 'FAILED'];

function ReceiptRow({ payment }) {
  const [open, setOpen] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && payment.status === 'SUCCESS' && !receipt && !loading) {
      setLoading(true);
      setError('');
      try {
        const { data } = await paymentAPI.getReceipt(payment.id);
        setReceipt(data.receipt);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load the receipt');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <tr className="border-b border-white/50 transition-colors hover:bg-white/40 dark:border-white/5 dark:hover:bg-white/5">
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-slate-900/5 text-slate-500 transition-colors hover:bg-slate-900/10 dark:bg-white/10 dark:text-slate-300"
              aria-label={open ? 'Hide receipt' : 'Show receipt'}
            >
              <ChevronDown className={clsx('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
            </button>
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                {payment.reference}
              </p>
              <p className="text-[0.68rem] text-slate-500 dark:text-slate-400">
                {format(new Date(payment.createdAt), 'dd MMM yyyy, h:mm a')}
              </p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <p className="max-w-[12rem] truncate text-xs font-medium text-slate-800 dark:text-slate-100">
            {payment.citizen?.fullName || '—'}
          </p>
          <p className="max-w-[12rem] truncate text-[0.68rem] text-slate-500 dark:text-slate-400">
            {payment.citizen?.email || ''}
          </p>
        </td>
        <td className="px-4 py-3 font-mono text-[0.72rem] text-slate-700 dark:text-slate-300">
          {payment.challan?.challanNumber || '—'}
        </td>
        <td className="px-4 py-3 text-xs text-slate-700 dark:text-slate-300">
          {METHOD_META[payment.method]?.label || payment.method}
        </td>
        <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white">
          {inr(payment.amount)}
        </td>
        <td className="px-4 py-3">
          <StatusBadge status={payment.status} />
        </td>
        <td className="px-4 py-3 text-[0.7rem] text-slate-500 dark:text-slate-400">
          {payment.completedAt ? format(new Date(payment.completedAt), 'dd MMM, h:mm a') : '—'}
        </td>
      </tr>

      {open && (
        <tr className="border-b border-white/50 dark:border-white/5">
          <td colSpan={7} className="px-4 pb-4">
            {payment.status !== 'SUCCESS' ? (
              <p className="glass-soft px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
                No receipt is issued for {payment.status.toLowerCase()} payments.
                {payment.failureReason
                  ? ` Reason: ${payment.failureReason.replaceAll('_', ' ').toLowerCase()}.`
                  : ''}
              </p>
            ) : loading ? (
              <p className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading receipt…
              </p>
            ) : error ? (
              <p className="px-3 py-2 text-xs text-danger-600 dark:text-danger-400">{error}</p>
            ) : (
              receipt && (
                <div className="glass-soft grid grid-cols-1 gap-2 p-3 text-xs sm:grid-cols-3">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Receipt no.</p>
                    <p className="font-mono font-semibold text-slate-800 dark:text-slate-100">
                      {receipt.receiptNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Vehicle</p>
                    <p className="font-medium text-slate-800 dark:text-slate-100">
                      {receipt.vehicleRegistrationNumber || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Paid at</p>
                    <p className="font-medium text-slate-800 dark:text-slate-100">
                      {receipt.paidAt ? format(new Date(receipt.paidAt), 'dd MMM yyyy, h:mm a') : '—'}
                    </p>
                  </div>
                  <p className="sm:col-span-3 rounded-lg bg-amber-400/15 px-2 py-1.5 text-center text-[0.62rem] font-bold uppercase tracking-[0.12em] text-amber-700 dark:text-amber-300">
                    {receipt.demoLabel}
                  </p>
                </div>
              )
            )}
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await paymentAPI.listAll({ limit: 100 });
        if (!cancelled) setPayments(data.payments || []);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Could not load transactions');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const stats = useMemo(() => {
    const successful = payments.filter((p) => p.status === 'SUCCESS');
    return {
      collected: successful.reduce((sum, p) => sum + Number(p.amount), 0),
      successful: successful.length,
      pending: payments.filter((p) => p.status === 'PENDING').length,
      failed: payments.filter((p) => p.status === 'FAILED').length,
    };
  }, [payments]);

  const filtered = payments
    .filter((p) => filter === 'ALL' || p.status === filter)
    .filter((p) => {
      if (!search) return true;
      const needle = search.toLowerCase();
      return (
        p.reference?.toLowerCase().includes(needle) ||
        p.challan?.challanNumber?.toLowerCase().includes(needle) ||
        p.citizen?.email?.toLowerCase().includes(needle) ||
        p.citizen?.fullName?.toLowerCase().includes(needle)
      );
    });

  return (
    <div className="pay-scene pb-10">
      <div className="pay-aurora" aria-hidden="true" />

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            to="/admin"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Transactions
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Every demo payment attempt across all citizens, with receipts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="demo-chip">
            <Sparkles className="h-3 w-3" /> Demo only
          </span>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="glass-cta-ghost text-sm"
            disabled={loading}
          >
            <RefreshCw className={clsx('h-4 w-4', loading && 'animate-spin')} /> Refresh
          </button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Amount collected', value: inr(stats.collected), icon: Receipt, tone: 'from-indigo-500 to-cyan-500' },
          { label: 'Successful', value: stats.successful, icon: CheckCircle2, tone: 'from-emerald-500 to-teal-500' },
          { label: 'Pending', value: stats.pending, icon: Clock, tone: 'from-amber-400 to-orange-500' },
          { label: 'Failed', value: stats.failed, icon: CircleAlert, tone: 'from-rose-500 to-red-500' },
        ].map((tile) => (
          <div key={tile.label} className="glass p-4">
            <span
              className={clsx(
                'mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white',
                tile.tone
              )}
            >
              <tile.icon className="h-4 w-4" />
            </span>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              {tile.label}
            </p>
            <p className="mt-0.5 text-xl font-bold text-slate-900 dark:text-white">{tile.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="glass-input pl-9 text-sm"
            placeholder="Search reference, challan or citizen…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={clsx(
                'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
                filter === f
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-[0_10px_22px_-14px_rgba(79,70,229,0.9)]'
                  : 'bg-white/60 text-slate-600 hover:bg-white/90 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-700/60'
              )}
            >
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="glass flex items-start gap-3 p-5">
          <CircleAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-danger-500" />
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100">
              Could not load transactions
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{error}</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass p-2">
          <EmptyState
            icon={Receipt}
            title={payments.length ? 'Nothing matches this filter' : 'No transactions yet'}
            description={
              payments.length
                ? 'Try a different status or search term.'
                : 'Citizen payments will appear here as soon as one is attempted.'
            }
          />
        </div>
      ) : (
        <div className="glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/60 dark:border-white/10">
                  {['Reference', 'Citizen', 'Challan', 'Method', 'Amount', 'Status', 'Settled'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((payment) => (
                  <ReceiptRow key={payment.id} payment={payment} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
        {filtered.length} of {payments.length} transactions
      </p>
    </div>
  );
}
