'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { markHelpful } from '@/lib/api';

export function HelpfulButton({
  reviewId,
  initial,
}: {
  reviewId: number;
  initial: number;
}) {
  const { data: session } = useSession();
  const [count, setCount] = useState(initial);
  const [voted, setVoted] = useState(false);
  const [busy, setBusy] = useState(false);

  async function vote() {
    if (!session?.apiToken || voted) return;
    setBusy(true);
    try {
      const { helpful } = await markHelpful(reviewId, session.apiToken);
      setCount(helpful);
      setVoted(true);
    } catch {
      // Already voted from another session; reflect that rather than erroring.
      setVoted(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2 flex items-center gap-3">
      {count > 0 && (
        <span className="text-[12px] text-[var(--color-text-secondary)]">
          {count} {count === 1 ? 'person' : 'people'} found this helpful
        </span>
      )}
      {session && (
        <button
          onClick={vote}
          disabled={busy || voted}
          className="btn-secondary !py-1 !text-[12px] disabled:opacity-60"
        >
          {voted ? 'Thank you' : 'Helpful'}
        </button>
      )}
    </div>
  );
}
