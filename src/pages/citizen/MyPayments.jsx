import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  History,
  Loader2,
  Receipt,
  RefreshCw,
  Smartphone,
  Sparkles,
  Wallet,
  CircleAlert,
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

const FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'SUCCESS', label: 'Successful' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Failed' },
];

function PaymentCard({ payment }) {
  const [expanded, setExpanded] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [receiptError, setReceiptError] = useState('');
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  const meta = METHOD_META[payment.method] || { label: payment.method, icon: Wallet };
  const Icon = meta.icon;

  const toggle = async () => {
    const next = !expanded;
    setExpanded(next);
    if (next && payment.status === 'SUCCESS' && !receipt && !loadingReceipt) {
      setLoadingReceipt(true);
      setReceiptError('');
      try {
        const { data } = await paymentAPI.getReceipt(payment.id);
        setReceipt(data.receipt);
      } catch (err) {
        setReceiptError(err.response?.data?.message || 'Could not load the receipt');
      } finally {
        setLoadingReceipt(false);
      }
    }
  };

  return (
    <div className="glass overflow-hidden">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-white/40 dark:hover:bg-white/5"
      >
        <span
          className={clsx(
            'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl',
            payment.status === 'SUCCESS'
              ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'
              : payment.status === 'FAILED'
                ? 'bg-gradient-to-br from-rose-500 to-red-500 text-white'
                : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
          )}
        >
          <Icon className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[0.78rem] font-semibold text-slate-900 dark:text-white">
              {payment.reference}
            </span>
            <StatusBadge status={payment.status} />
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-600 dark:text-slate-400">
            {meta.label} · {format(new Date(payment.createdAt), 'dd MMM yyyy, h:mm a')}
            {payment.challan?.challanNumber ? ` · ${payment.challan.challanNumber}` : ''}
          </p>
        </div>

        <div className="flex-shrink-0 text-right">
          <p className="text-base font-bold text-slate-900 dark:text-white">{inr(payment.amount)}</p>
          {payment.completedAt && (
            <p className="text-[0.68rem] text-slate-500 dark:text-slate-400">
              {format(new Date(payment.completedAt), 'dd MMM')}
            </p>
          )}
        </div>

        <ChevronDown
          className={clsx(
            'h-4 w-4 flex-shrink-0 text-slate-400 transition-transform',
            expanded && 'rotate-180'
          )}
        />
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-white/60 px-4 py-4 dark:border-white/10">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">Challan</dt>
              <dd className="font-mono text-xs font-medium text-slate-800 dark:text-slate-100">
                {payment.challan?.challanNumber || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">Method</dt>
              <dd className="font-medium text-slate-800 dark:text-slate-100">{meta.label}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">Created</dt>
              <dd className="font-medium text-slate-800 dark:text-slate-100">
                {format(new Date(payment.createdAt), 'dd MMM yyyy, h:mm a')}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">Completed</dt>
              <dd className="font-medium text-slate-800 dark:text-slate-100">
                {payment.completedAt ? format(new Date(payment.completedAt), 'dd MMM yyyy, h:mm a') : '—'}
              </dd>
            </div>
          </dl>

          {payment.failureReason && (
            <p className="flex items-start gap-2 rounded-xl bg-danger-50/80 px-3 py-2 text-xs text-danger-700 dark:bg-danger-900/30 dark:text-danger-300">
              <CircleAlert className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              Reason: {payment.failureReason.replaceAll('_', ' ').toLowerCase()}
            </p>
          )}

          {payment.status === 'SUCCESS' && (
            <div className="glass-soft p-3">
              <p className="mb-2 flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                <Receipt className="h-3.5 w-3.5" /> Receipt
              </p>
              {loadingReceipt && (
                <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
                </p>
              )}
              {receiptError && <p className="text-xs text-danger-600 dark:text-danger-400">{receiptError}</p>}
              {receipt && (
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500 dark:text-slate-400">Receipt no.</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">
                      {receipt.receiptNumber}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500 dark:text-slate-400">Paid at</span>
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {receipt.paidAt ? format(new Date(receipt.paidAt), 'dd MMM yyyy, h:mm a') : '—'}
                    </span>
                  </div>
                  <p className="mt-2 rounded-lg bg-amber-400/15 px-2 py-1.5 text-center text-[0.62rem] font-bold uppercase tracking-[0.12em] text-amber-700 dark:text-amber-300">
                    {receipt.demoLabel}
                  </p>
                </div>
              )}
            </div>
          )}

          {payment.status !== 'SUCCESS' && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No receipt is issued for {payment.status.toLowerCase()} payments.
              {payment.status === 'PENDING' && ' This attempt can still be completed from the challan.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await paymentAPI.getMyPayments({ limit: 50 });
        if (!cancelled) setPayments(data.payments || []);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.code === 'DEMO_DISABLED'
              ? 'Demo payments are disabled on this server.'
              : err.response?.data?.message || 'Could not load your payments'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const stats = useMemo(() => {
    const paid = payments.filter((p) => p.status === 'SUCCESS');
    return {
      paidAmount: paid.reduce((sum, p) => sum + Number(p.amount), 0),
      paidCount: paid.length,
      pending: payments.filter((p) => p.status === 'PENDING').length,
      failed: payments.filter((p) => p.status === 'FAILED').length,
      total: payments.length,
    };
  }, [payments]);

  const filtered = payments.filter((p) => filter === 'ALL' || p.status === filter);

  return (
    <div className="pay-scene pb-10">
      <div className="pay-aurora" aria-hidden="true" />

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            to="/citizen"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Payments
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Every demo transaction you attempted, with its receipt.
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
          { label: 'Total paid', value: inr(stats.paidAmount), icon: CheckCircle2, tone: 'from-emerald-500 to-teal-500' },
          { label: 'Successful', value: stats.paidCount, icon: Receipt, tone: 'from-indigo-500 to-cyan-500' },
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

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={clsx(
              'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
              filter === f.value
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-[0_10px_22px_-14px_rgba(79,70,229,0.9)]'
                : 'bg-white/60 text-slate-600 hover:bg-white/90 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-700/60'
            )}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
          {filtered.length} of {stats.total} attempts
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="glass flex items-start gap-3 p-5">
          <CircleAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-danger-500" />
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100">Could not load payments</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{error}</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass p-2">
          <EmptyState
            icon={History}
            title={stats.total ? 'Nothing matches this filter' : 'No payments yet'}
            description={
              stats.total
                ? 'Try a different status filter.'
                : 'Open a pending challan and pay it to see the transaction here.'
            }
          />
          {!stats.total && (
            <div className="pb-6 text-center">
              <Link to="/citizen/challans" className="glass-cta text-sm">
                View my challans
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((payment) => (
            <PaymentCard key={payment.id} payment={payment} />
          ))}
        </div>
      )}
    </div>
  );
}
