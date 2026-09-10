'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getReturnReasons, requestReturn } from '@/lib/api';

export function ReturnDialog({
  orderItemId,
  title,
}: {
  orderItemId: number;
  title: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [reasons, setReasons] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open && reasons.length === 0) {
      getReturnReasons().then((r) => {
        setReasons(r.reasons);
        setReason(r.reasons[0]);
      }).catch(() => {});
    }
  }, [open, reasons.length]);

  async function submit() {
    if (!session?.apiToken) return;
    setBusy(true);
    setError(null);
    try {
      await requestReturn({ orderItemId, reason, comments }, session.apiToken);
      setDone(true);
      setTimeout(() => router.push('/returns'), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start the return');
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p className="text-[13px] text-[var(--color-success)]">
        Return approved — taking you to your returns…
      </p>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-secondary w-full">
        Return or replace item
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--color-border-grey)] p-3">
      <p className="mb-2 line-clamp-1 text-[13px] font-bold">{title}</p>

      <label className="mb-2 block">
        <span className="mb-1 block text-[12px] font-bold">Reason for return</span>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="input-amazon"
        >
          {reasons.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </label>

      <textarea
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        rows={2}
        placeholder="Comments (optional)"
        className="input-amazon mb-2 resize-y"
      />

      {error && <p className="mb-2 text-[12px] text-[#c40000]">{error}</p>}

      <div className="flex gap-2">
        <button onClick={submit} disabled={busy || !reason} className="btn-amazon">
          {busy ? 'Submitting…' : 'Submit return'}
        </button>
        <button onClick={() => setOpen(false)} className="btn-secondary">
          Cancel
        </button>
      </div>
    </div>
  );
}
