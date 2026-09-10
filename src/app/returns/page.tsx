'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { listReturns } from '@/lib/api';
import { formatOrderDate } from '@/lib/utils';
import type { ReturnRequest } from '@/lib/types';

const STATUS_COPY: Record<string, string> = {
  requested: 'Return requested',
  approved: 'Return approved — refund on its way',
  received: 'Item received',
  refunded: 'Refunded',
};

export default function ReturnsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [returns, setReturns] = useState<ReturnRequest[] | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/signin?callbackUrl=/returns');
  }, [status, router]);

  useEffect(() => {
    if (!session?.apiToken) return;
    listReturns(session.apiToken).then((r) => setReturns(r.returns)).catch(() => setReturns([]));
  }, [session]);

  if (status === 'loading' || returns === null) {
    return <div className="mx-auto max-w-4xl p-10 text-center">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-5">
      <h1 className="mb-4 text-[28px] font-normal">Your Returns</h1>

      {returns.length === 0 ? (
        <div className="bg-white p-8 text-center">
          <p className="mb-3 text-[16px]">You have no returns.</p>
          <Link href="/orders" className="btn-amazon">View your orders</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {returns.map((r) => (
            <article key={r.id} className="rounded-lg border border-[var(--color-border-grey)] bg-white p-5">
              <div className="flex gap-4">
                <div className="relative h-20 w-20 shrink-0">
                  {r.image && (
                    <Image src={r.image} alt={r.title} fill sizes="80px" className="object-contain" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[15px]">{r.title}</p>
                  <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
                    Order # {r.orderNumber} · requested {formatOrderDate(r.createdAt)}
                  </p>
                  <p className="mt-1 text-[13px]">Reason: {r.reason}</p>
                  {r.comments && (
                    <p className="text-[13px] text-[var(--color-text-secondary)]">
                      &ldquo;{r.comments}&rdquo;
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[16px] font-bold text-[var(--color-price)]">
                    {r.refundFormatted}
                  </p>
                  <p className="mt-1 text-[13px] text-[var(--color-success)]">
                    {STATUS_COPY[r.status] ?? r.status}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
