import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Calendar,
  Car,
  CheckCircle2,
  CircleAlert,
  Clock,
  Copy,
  CreditCard,
  History,
  IndianRupee,
  Loader2,
  Lock,
  QrCode,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wallet,
} from 'lucide-react';
import clsx from 'clsx';
import { citizenChallanAPI, paymentAPI } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import DemoQr from '../../components/payment/DemoQr';
import Spinner from '../../components/Spinner';

const VIOLATION_LABELS = {
  NO_HELMET: 'No Helmet',
  NO_SEATBELT: 'No Seatbelt',
  RED_LIGHT_JUMP: 'Red Light Jump',
  SPEEDING: 'Speeding',
  WRONG_SIDE: 'Wrong Side Driving',
  ILLEGAL_PARKING: 'Illegal Parking',
  LANE_VIOLATION: 'Lane Violation',
  MORE_THAN_2_PEOPLE_ON_BIKE: 'More Than 2 on Bike',
  MOBILE_PHONE_USAGE: 'Mobile Phone Usage',
};

const METHOD_META = {
  UPI: {
    label: 'UPI',
    hint: 'Pay by demo UPI ID or illustrative QR',
    icon: Smartphone,
  },
  CREDIT_CARD: {
    label: 'Credit Card',
    hint: 'Dummy card checkout, nothing is charged',
    icon: CreditCard,
  },
  DEBIT_CARD: {
    label: 'Debit Card',
    hint: 'Same demo flow as credit card',
    icon: Wallet,
  },
};

const OUTCOMES = [
  { value: 'SUCCESS', label: 'Success', hint: 'Challan is marked paid' },
  { value: 'FAILED', label: 'Failed', hint: 'Challan stays unpaid' },
  { value: 'PENDING', label: 'Pending', hint: 'Waiting for confirmation' },
];

const PAYABLE_STATUSES = ['ISSUED', 'PENDING_PAYMENT'];

const inr = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const newIdempotencyKey = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `pay-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const luhnValid = (digits) => {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
};

const mapPaymentError = (err) => {
  const body = err.response?.data;
  const code = body?.code;
  const messages = {
    ALREADY_PAID: 'This challan has already been paid.',
    CHALLAN_NOT_PAYABLE: 'This challan can no longer be paid.',
    CHALLAN_NOT_FOUND: 'This challan could not be found.',
    PAYMENT_NOT_FOUND: 'This payment could not be found.',
    FORBIDDEN: 'You can only pay challans issued against your own vehicle.',
    DEMO_DISABLED:
      'Demo payments are switched off on the server. Set DEMO_PAYMENTS_ENABLED=true to use the demo checkout.',
    CONCURRENCY_CONFLICT: 'Another attempt is in progress. Please try again.',
    IDEMPOTENCY_MISMATCH: 'This checkout session expired. Please start again.',
    RECEIPT_NOT_AVAILABLE: 'A receipt is only available for successful payments.',
  };
  return messages[code] || body?.message || 'Something went wrong. Please try again.';
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ── small building blocks ───────────────────────────────────────────────── */

function DemoNotice() {
  return (
    <div className="glass-soft flex items-start gap-2.5 p-3">
      <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <span className="font-semibold text-slate-800 dark:text-slate-100">Demo checkout.</span>{' '}
        No money moves, no card or UPI details are sent anywhere, and no bank or government
        treasury is contacted.
      </p>
    </div>
  );
}

function Stepper({ step }) {
  const steps = ['Method', 'Pay', 'Receipt'];
  const activeIndex = step === 'method' ? 0 : step === 'details' || step === 'processing' ? 1 : 2;

  return (
    <div className="mb-5 flex items-center gap-2">
      {steps.map((label, index) => (
        <div key={label} className="flex flex-1 items-center gap-2">
          <div
            className={clsx(
              'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold transition-colors',
              index <= activeIndex
                ? 'bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-[0_6px_16px_-8px_rgba(79,70,229,0.9)]'
                : 'bg-slate-200/80 text-slate-500 dark:bg-slate-700/60 dark:text-slate-400'
            )}
          >
            {index < activeIndex ? <CheckCircle2 className="h-3.5 w-3.5" /> : index + 1}
          </div>
          <span
            className={clsx(
              'text-xs font-medium',
              index <= activeIndex
                ? 'text-slate-700 dark:text-slate-200'
                : 'text-slate-400 dark:text-slate-500'
            )}
          >
            {label}
          </span>
          {index < steps.length - 1 && (
            <div
              className={clsx(
                'h-px flex-1 rounded-full',
                index < activeIndex
                  ? 'bg-gradient-to-r from-indigo-400 to-cyan-400'
                  : 'bg-slate-200 dark:bg-slate-700'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function SummaryCard({ challan }) {
  return (
    <div className="glass p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Amount payable
          </p>
          <p className="mt-1 flex items-baseline gap-1 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            {inr(challan.fineAmount)}
          </p>
        </div>
        <StatusBadge status={challan.status} />
      </div>

      <div className="mt-5 space-y-3 border-t border-white/60 pt-4 text-sm dark:border-white/10">
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500 dark:text-slate-400">Challan</span>
          <span className="font-mono text-[0.8rem] font-semibold text-slate-800 dark:text-slate-100">
            {challan.challanNumber}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500 dark:text-slate-400">Violation</span>
          <span className="font-medium text-slate-800 dark:text-slate-100">
            {VIOLATION_LABELS[challan.violation?.violationType] || 'Traffic violation'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Car className="h-3.5 w-3.5" /> Vehicle
          </span>
          <span className="font-mono text-[0.8rem] font-medium text-slate-800 dark:text-slate-100">
            {challan.vehicle?.registrationNumber || '—'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Calendar className="h-3.5 w-3.5" /> Due by
          </span>
          <span className="font-medium text-slate-800 dark:text-slate-100">
            {format(new Date(challan.dueDate), 'dd MMM yyyy')}
          </span>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-cyan-400/10 p-3.5 text-xs leading-relaxed text-slate-600 ring-1 ring-inset ring-white/50 dark:text-slate-300 dark:ring-white/10">
        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
          <ShieldCheck className="h-3.5 w-3.5" /> Server-side amount
        </span>
        <p className="mt-1">
          The payable amount is read from the challan on the server — it is never taken from the
          browser.
        </p>
      </div>
    </div>
  );
}

/* ── result screen ───────────────────────────────────────────────────────── */

function ReceiptPanel({ receipt }) {
  const rows = [
    ['Receipt no.', receipt.receiptNumber],
    ['Transaction ref.', receipt.reference],
    ['Challan', receipt.challanNumber],
    ['Vehicle', receipt.vehicleRegistrationNumber],
    ['Method', METHOD_META[receipt.method]?.label || receipt.method],
    ['Paid at', receipt.paidAt ? format(new Date(receipt.paidAt), 'dd MMM yyyy, h:mm a') : '—'],
  ];

  return (
    <div className="glass-soft p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
          <Receipt className="h-3.5 w-3.5" /> Receipt
        </p>
        <span className="demo-chip">Demo</span>
      </div>

      <dl className="space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4">
            <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
            <dd className="max-w-[60%] break-words text-right font-medium text-slate-800 dark:text-slate-100">
              {value || '—'}
            </dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 border-t border-white/60 pt-2 dark:border-white/10">
          <dt className="text-slate-500 dark:text-slate-400">Amount</dt>
          <dd className="text-lg font-bold text-slate-900 dark:text-white">{inr(receipt.amount)}</dd>
        </div>
      </dl>

      <p className="mt-3 rounded-xl bg-amber-400/15 px-3 py-2 text-center text-[0.7rem] font-bold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">
        {receipt.demoLabel}
      </p>
    </div>
  );
}

export default function PaymentCheckout() {
  const { challanId } = useParams();

  const [challan, setChallan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [step, setStep] = useState('method');
  const [method, setMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('');
  const [outcome, setOutcome] = useState('SUCCESS');

  const [payment, setPayment] = useState(null);
  const [checkout, setCheckout] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [resultStatus, setResultStatus] = useState(null);
  const [serverNote, setServerNote] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Dummy card fields — held in memory only and never included in any request.
  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [cardErrors, setCardErrors] = useState({});

  const idempotencyKey = useRef(newIdempotencyKey());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await citizenChallanAPI.getById(challanId);
        if (!cancelled) setChallan(data.challan || data);
      } catch (err) {
        if (!cancelled) setLoadError(mapPaymentError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [challanId]);

  const payable = challan ? PAYABLE_STATUSES.includes(challan.status) : false;
  const isCard = method !== 'UPI';
  const cardPreviewNumber = useMemo(
    () => card.number.replace(/\s/g, '').padEnd(16, '•').replace(/(.{4})/g, '$1 ').trim(),
    [card.number]
  );

  const validateCard = () => {
    const errors = {};
    if (card.name.trim().length < 3) errors.name = 'Enter the name printed on the card';
    const digits = card.number.replace(/\s/g, '');
    if (digits.length !== 16 || !/^\d+$/.test(digits) || !luhnValid(digits)) {
      errors.number = 'Use any 16-digit demo number (e.g. 4111 1111 1111 1111)';
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) {
      errors.expiry = 'MM/YY';
    } else {
      const [mm, yy] = card.expiry.split('/');
      const expiryDate = new Date(2000 + Number(yy), Number(mm), 1);
      if (expiryDate <= new Date()) errors.expiry = 'Already expired';
    }
    if (!/^\d{3,4}$/.test(card.cvv)) errors.cvv = '3 or 4 digits';
    return errors;
  };

  const startCheckout = async () => {
    setBusy(true);
    setError('');
    try {
      const payload = { challanId, method, idempotencyKey: idempotencyKey.current };
      if (method === 'UPI' && upiId.trim()) payload.upiId = upiId.trim();

      const { data } = await paymentAPI.create(payload);
      setPayment(data.payment);
      setCheckout(data.checkout);
      setStep('details');
    } catch (err) {
      setError(mapPaymentError(err));
    } finally {
      setBusy(false);
    }
  };

  const runSimulation = async (forcedOutcome = outcome, { delay = 900 } = {}) => {
    setError('');
    setServerNote('');
    setStep('processing');
    try {
      await sleep(delay);
      const { data } = await paymentAPI.simulate(payment.id, forcedOutcome);
      setPayment(data.payment);
      setReceipt(data.receipt);
      setResultStatus(data.outcome);
      // Keep the summary card in step with the server: only a SUCCESS settles the challan.
      if (data.outcome === 'SUCCESS') {
        setChallan((current) =>
          current ? { ...current, status: 'PAID', paidAt: data.payment.completedAt } : current
        );
      }
      if (data.outcome !== forcedOutcome) {
        setServerNote(`Server applied its configured outcome: ${data.outcome}.`);
      }
      setStep('result');
    } catch (err) {
      const body = err.response?.data;
      if (body?.payment) {
        setPayment(body.payment);
        setReceipt(null);
        setResultStatus(body.payment.status);
      } else {
        setResultStatus(null);
      }
      setError(mapPaymentError(err));
      setStep('result');
    }
  };

  const handlePay = async () => {
    if (isCard) {
      const errors = validateCard();
      setCardErrors(errors);
      if (Object.keys(errors).length) return;
    }
    await runSimulation(outcome);
  };

  const restart = () => {
    idempotencyKey.current = newIdempotencyKey();
    setPayment(null);
    setCheckout(null);
    setReceipt(null);
    setResultStatus(null);
    setError('');
    setServerNote('');
    setStep('method');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="pay-scene pb-10">
      <div className="pay-aurora" aria-hidden="true" />

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            to="/citizen/challans"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" /> My Challans
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Pay Challan
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Simulated UPI or card checkout for your traffic challan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="demo-chip">
            <Sparkles className="h-3 w-3" /> No real money
          </span>
          <Link to="/citizen/payments" className="glass-cta-ghost text-sm">
            <History className="h-4 w-4" /> History
          </Link>
        </div>
      </div>

      {loadError && (
        <div className="glass mb-5 flex items-start gap-3 p-4">
          <CircleAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-danger-500" />
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100">
              Could not load this challan
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{loadError}</p>
          </div>
        </div>
      )}

      {!loadError && challan && !payable && step === 'method' && (
        <div className="glass mb-5 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <BadgeCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-500" />
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                This challan is not payable
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Its current status is <span className="font-medium">{challan.status}</span>. Only
                issued or pending-payment challans can be paid.
              </p>
            </div>
          </div>
          <Link to="/citizen/challans" className="glass-cta-ghost text-sm">
            Back to challans
          </Link>
        </div>
      )}

      {challan && (payable || step !== 'method') && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="space-y-5">
            <SummaryCard challan={challan} />
            <DemoNotice />
          </div>

          <div className="glass p-5 sm:p-6">
            <Stepper step={step} />

            {/* ── Step 1: choose method ── */}
            {step === 'method' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Choose a payment method
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    All three methods run the same simulated flow.
                  </p>
                </div>

                <div className="grid gap-3">
                  {Object.entries(METHOD_META).map(([value, meta]) => {
                    const Icon = meta.icon;
                    const selected = method === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        data-selected={selected}
                        onClick={() => setMethod(value)}
                        className="glass-tile flex items-center gap-3"
                      >
                        <span
                          className={clsx(
                            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl',
                            selected
                              ? 'bg-gradient-to-br from-indigo-500 to-cyan-500 text-white'
                              : 'bg-slate-900/5 text-slate-600 dark:bg-white/10 dark:text-slate-300'
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                            {meta.label}
                          </span>
                          <span className="block text-xs text-slate-500 dark:text-slate-400">
                            {meta.hint}
                          </span>
                        </span>
                        <span
                          className={clsx(
                            'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2',
                            selected
                              ? 'border-transparent bg-gradient-to-br from-indigo-500 to-cyan-500'
                              : 'border-slate-300 dark:border-slate-600'
                          )}
                        >
                          {selected && <CheckCircle2 className="h-3 w-3 text-white" />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {method === 'UPI' && (
                  <div>
                    <label className="input-label" htmlFor="upi-id">
                      Demo UPI ID <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <input
                      id="upi-id"
                      className="glass-input font-mono text-sm"
                      placeholder="demo.user@okhdfc"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      autoComplete="off"
                    />
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                      Only shown back to you masked. It is never stored.
                    </p>
                  </div>
                )}

                {error && (
                  <p className="flex items-start gap-2 rounded-xl bg-danger-50/80 px-3 py-2 text-sm text-danger-700 dark:bg-danger-900/30 dark:text-danger-300">
                    <CircleAlert className="mt-0.5 h-4 w-4 flex-shrink-0" /> {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={startCheckout}
                  disabled={busy}
                  className="glass-cta w-full"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  {busy ? 'Preparing checkout…' : 'Continue to pay'}
                  {!busy && <ArrowRight className="h-4 w-4" />}
                </button>
              </div>
            )}

            {/* ── Step 2: method details ── */}
            {step === 'details' && payment && (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {METHOD_META[method].label} checkout
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Reference <span className="font-mono">{payment.reference}</span>
                    </p>
                  </div>
                  <StatusBadge status={payment.status} />
                </div>

                {method === 'UPI' ? (
                  <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                    <DemoQr payload={checkout?.upi?.qrPayload || payment.reference} size={168} />
                    <div className="min-w-0 flex-1 space-y-2 text-sm">
                      <p className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-100">
                        <QrCode className="h-4 w-4" /> Scan to pay (illustrative)
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {checkout?.upi?.note ||
                          'Illustrative QR only. It is not scannable and cannot initiate a real payment.'}
                      </p>
                      {checkout?.upi?.vpaMasked && (
                        <div className="glass-soft flex items-center justify-between gap-2 px-3 py-2">
                          <span className="text-xs text-slate-500 dark:text-slate-400">UPI ID</span>
                          <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-100">
                            {checkout.upi.vpaMasked}
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => navigator.clipboard?.writeText(payment.reference)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-300"
                      >
                        <Copy className="h-3.5 w-3.5" /> Copy reference
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 p-4 text-white shadow-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white/60">
                          Demo card
                        </span>
                        <CreditCard className="h-4 w-4 text-white/70" />
                      </div>
                      <p className="mt-4 font-mono text-base tracking-[0.18em]">
                        {cardPreviewNumber || '•••• •••• •••• ••••'}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-[0.65rem] uppercase tracking-[0.14em] text-white/70">
                        <span className="truncate">{card.name || 'CARDHOLDER NAME'}</span>
                        <span>{card.expiry || 'MM/YY'}</span>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="input-label" htmlFor="card-name">
                          Name on card
                        </label>
                        <input
                          id="card-name"
                          className="glass-input"
                          placeholder="Asha Rao"
                          value={card.name}
                          onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
                          autoComplete="off"
                        />
                        {cardErrors.name && (
                          <p className="mt-1 text-xs text-danger-600 dark:text-danger-400">{cardErrors.name}</p>
                        )}
                      </div>
                      <div className="sm:col-span-2">
                        <label className="input-label" htmlFor="card-number">
                          Card number
                        </label>
                        <input
                          id="card-number"
                          inputMode="numeric"
                          className="glass-input font-mono"
                          placeholder="4111 1111 1111 1111"
                          value={card.number}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
                            setCard((c) => ({
                              ...c,
                              number: digits.replace(/(.{4})/g, '$1 ').trim(),
                            }));
                          }}
                          autoComplete="off"
                        />
                        {cardErrors.number && (
                          <p className="mt-1 text-xs text-danger-600 dark:text-danger-400">{cardErrors.number}</p>
                        )}
                      </div>
                      <div>
                        <label className="input-label" htmlFor="card-expiry">
                          Expiry
                        </label>
                        <input
                          id="card-expiry"
                          className="glass-input font-mono"
                          placeholder="MM/YY"
                          value={card.expiry}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                            const formatted =
                              digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
                            setCard((c) => ({ ...c, expiry: formatted }));
                          }}
                          autoComplete="off"
                        />
                        {cardErrors.expiry && (
                          <p className="mt-1 text-xs text-danger-600 dark:text-danger-400">{cardErrors.expiry}</p>
                        )}
                      </div>
                      <div>
                        <label className="input-label" htmlFor="card-cvv">
                          CVV
                        </label>
                        <input
                          id="card-cvv"
                          type="password"
                          inputMode="numeric"
                          className="glass-input font-mono"
                          placeholder="•••"
                          value={card.cvv}
                          onChange={(e) =>
                            setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))
                          }
                          autoComplete="off"
                        />
                        {cardErrors.cvv && (
                          <p className="mt-1 text-xs text-danger-600 dark:text-danger-400">{cardErrors.cvv}</p>
                        )}
                      </div>
                    </div>

                    <p className="flex items-start gap-2 rounded-xl bg-slate-900/5 px-3 py-2 text-xs text-slate-600 dark:bg-white/5 dark:text-slate-300">
                      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                      Card details stay in this browser tab. The request only carries the payment
                      method, so nothing sensitive is transmitted or stored.
                    </p>
                  </div>
                )}

                {/* Demo simulator */}
                <div className="glass-soft p-3">
                  <p className="mb-2 flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    <Sparkles className="h-3 w-3" /> Demo simulator
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {OUTCOMES.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setOutcome(option.value)}
                        className={clsx(
                          'rounded-xl px-2 py-2 text-center text-xs font-semibold transition-all',
                          outcome === option.value
                            ? 'bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-[0_10px_24px_-14px_rgba(79,70,229,0.9)]'
                            : 'bg-white/60 text-slate-600 hover:bg-white/90 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-700/60'
                        )}
                      >
                        {option.label}
                        <span className="mt-0.5 block text-[0.6rem] font-normal opacity-80">
                          {option.hint}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[0.68rem] text-slate-500 dark:text-slate-400">
                    The server decides the final status; this only selects which simulated result
                    to demonstrate.
                  </p>
                </div>

                {error && (
                  <p className="flex items-start gap-2 rounded-xl bg-danger-50/80 px-3 py-2 text-sm text-danger-700 dark:bg-danger-900/30 dark:text-danger-300">
                    <CircleAlert className="mt-0.5 h-4 w-4 flex-shrink-0" /> {error}
                  </p>
                )}

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <button type="button" onClick={() => setStep('method')} className="glass-cta-ghost">
                    <ArrowLeft className="h-4 w-4" /> Change method
                  </button>
                  <button type="button" onClick={handlePay} className="glass-cta">
                    <Lock className="h-4 w-4" /> Pay {inr(payment.amount)}
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 3a: processing ── */}
            {step === 'processing' && (
              <div className="pay-scanline flex flex-col items-center justify-center gap-4 rounded-2xl py-16">
                <span className="relative flex h-16 w-16 items-center justify-center">
                  <span className="absolute inset-0 animate-ping rounded-full bg-indigo-400/30" />
                  <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-white">
                    <Loader2 className="h-7 w-7 animate-spin" />
                  </span>
                </span>
                <div className="text-center">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Contacting the demo gateway…
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    The server is settling <span className="font-mono">{payment?.reference}</span>
                  </p>
                </div>
                <span className="demo-chip">
                  <Lock className="h-3 w-3" /> Simulated
                </span>
              </div>
            )}

            {/* ── Step 3b: result ── */}
            {step === 'result' && (
              <div className="space-y-4">
                {resultStatus === 'SUCCESS' && (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-[0_16px_30px_-16px_rgba(16,185,129,0.9)]">
                        <CheckCircle2 className="h-6 w-6" />
                      </span>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                          Payment successful
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Challan {receipt?.challanNumber || challan.challanNumber} is marked paid.
                        </p>
                      </div>
                    </div>

                    {receipt && <ReceiptPanel receipt={receipt} />}

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Link to="/citizen/payments" className="glass-cta flex-1">
                        <History className="h-4 w-4" /> Payment history
                      </Link>
                      <Link to="/citizen/challans" className="glass-cta-ghost flex-1">
                        Back to challans
                      </Link>
                    </div>
                  </>
                )}

                {resultStatus === 'FAILED' && (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 text-white shadow-[0_16px_30px_-16px_rgba(244,63,94,0.9)]">
                        <CircleAlert className="h-6 w-6" />
                      </span>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                          Payment failed
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {error || 'The simulated transaction did not complete.'}
                        </p>
                      </div>
                    </div>

                    <div className="glass-soft space-y-2 p-4 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500 dark:text-slate-400">Reference</span>
                        <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-100">
                          {payment?.reference}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500 dark:text-slate-400">Challan status</span>
                        <StatusBadge status={challan.status === 'PAID' ? 'PAID' : 'PENDING_PAYMENT'} />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        A failed payment never marks a challan paid. Your challan is still payable.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button type="button" onClick={restart} className="glass-cta flex-1">
                        <RefreshCw className="h-4 w-4" /> Try again
                      </button>
                      <Link to="/citizen/challans" className="glass-cta-ghost flex-1">
                        Back to challans
                      </Link>
                    </div>
                  </>
                )}

                {resultStatus === 'PENDING' && (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_16px_30px_-16px_rgba(245,158,11,0.9)]">
                        <Clock className="h-6 w-6" />
                      </span>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                          Payment pending
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          The challan is not marked paid until the transaction succeeds.
                        </p>
                      </div>
                    </div>

                    <div className="glass-soft space-y-2 p-4 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500 dark:text-slate-400">Reference</span>
                        <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-100">
                          {payment?.reference}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500 dark:text-slate-400">Payment status</span>
                        <StatusBadge status="PENDING" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => runSimulation('SUCCESS', { delay: 600 })}
                        className="glass-cta flex-1"
                      >
                        <ArrowRight className="h-4 w-4" /> Complete demo payment
                      </button>
                      <Link to="/citizen/payments" className="glass-cta-ghost flex-1">
                        Payment history
                      </Link>
                    </div>
                  </>
                )}

                {!resultStatus && (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-500 to-slate-700 text-white">
                        <CircleAlert className="h-6 w-6" />
                      </span>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                          Could not complete checkout
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{error}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button type="button" onClick={restart} className="glass-cta flex-1">
                        <RefreshCw className="h-4 w-4" /> Start again
                      </button>
                      <Link to="/citizen/challans" className="glass-cta-ghost flex-1">
                        Back to challans
                      </Link>
                    </div>
                  </>
                )}

                {serverNote && (
                  <p className="text-center text-xs text-slate-500 dark:text-slate-400">{serverNote}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {!challan && !loading && !loadError && (
        <div className="glass p-8 text-center">
          <IndianRupee className="mx-auto mb-3 h-8 w-8 text-slate-400" />
          <p className="font-semibold text-slate-800 dark:text-slate-100">Challan not found</p>
          <Link to="/citizen/challans" className="glass-cta-ghost mt-4 text-sm">
            Back to challans
          </Link>
        </div>
      )}
    </div>
  );
}
