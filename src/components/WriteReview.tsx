'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { writeReview } from '@/lib/api';

export function WriteReview({ productId }: { productId: number }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!session) {
    return (
      <Link href="/signin" className="btn-secondary w-full">
        Sign in to write a review
      </Link>
    );
  }

  if (done) {
    return (
      <p className="rounded border border-[#067D62] bg-[#f0fdf9] p-3 text-[13px] text-[var(--color-success)]">
        Thanks — your review has been posted.
      </p>
    );
  }

  async function submit() {
    if (!session?.apiToken || rating === 0) return;
    setBusy(true);
    setError(null);
    try {
      await writeReview(productId, { rating, title, body }, session.apiToken);
      setDone(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not post your review');
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-secondary w-full">
        Write a customer review
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--color-border-grey)] p-4">
      <h3 className="mb-2 text-[16px] font-bold">Write a review</h3>

      <div className="mb-3 flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            className="text-[28px] leading-none"
            style={{ color: n <= (hover || rating) ? '#FFA41C' : '#E3E6E6' }}
          >
            ★
          </button>
        ))}
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a headline"
        className="input-amazon mb-2"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder="What did you like or dislike?"
        className="input-amazon mb-2 resize-y"
      />

      {error && <p className="mb-2 text-[13px] text-[#c40000]">{error}</p>}

      <div className="flex gap-2">
        <button onClick={submit} disabled={busy || rating === 0} className="btn-amazon">
          {busy ? 'Posting…' : 'Submit'}
        </button>
        <button onClick={() => setOpen(false)} className="btn-secondary">
          Cancel
        </button>
      </div>
    </div>
  );
}
