'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { RoleShell, ADMIN_NAV, StatusBadge } from '@/components/RoleShell';
import { getAdminProducts, moderateProduct } from '@/lib/api';
import type { Product } from '@/lib/types';

const TABS = ['pending', 'active', 'rejected', 'archived'] as const;

export default function AdminModeration() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<(typeof TABS)[number]>('pending');
  const [products, setProducts] = useState<Product[] | null>(null);
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState<number | null>(null);

  const load = () => {
    if (!session?.apiToken) return;
    setProducts(null);
    getAdminProducts(session.apiToken, tab)
      .then((r) => setProducts(r.products))
      .catch(() => setProducts([]));
  };
  useEffect(load, [session, tab]);

  async function decide(
    id: number,
    decision: 'approve' | 'reject' | 'archive',
    why?: string
  ) {
    if (!session?.apiToken) return;
    setBusy(id);
    try {
      await moderateProduct(id, decision, why, session.apiToken);
      setRejecting(null);
      setReason('');
      load();
    } finally {
      setBusy(null);
    }
  }

  return (
    <RoleShell role="admin" title="Listing moderation" nav={ADMIN_NAV}>
      <p className="mb-3 text-[13px] text-[var(--color-text-secondary)]">
        New seller listings stay out of customer search until they are approved
        here. Every decision is recorded in the audit log.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={tab === t ? 'btn-amazon' : 'btn-secondary'}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {!products ? (
        <p className="text-[14px]">Loading…</p>
      ) : products.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center text-[15px]">
          Nothing {tab}.
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <article
              key={p.id}
              className="rounded-lg border border-[#d5d9d9] bg-white p-4"
            >
              <div className="flex gap-4">
                <div className="relative h-24 w-24 shrink-0">
                  {p.image && (
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      sizes="96px"
                      className="object-contain"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <StatusBadge status={p.status} />
                    <span className="text-[12px] text-[var(--color-text-secondary)]">
                      {p.storeName ?? 'Unknown store'} · {p.sellerEmail}
                    </span>
                  </div>

                  <Link
                    href={`/product/${p.slug}`}
                    className="line-clamp-2 text-[15px] font-bold link-amazon"
                  >
                    {p.title}
                  </Link>

                  <p className="mt-1 text-[13px]">
                    {p.priceFormatted}
                    {p.categoryName && ` · ${p.categoryName}`} · {p.stock} in stock
                  </p>

                  {p.description && (
                    <p className="mt-1 line-clamp-2 text-[13px] text-[var(--color-text-secondary)]">
                      {p.description}
                    </p>
                  )}

                  {p.rejectionReason && (
                    <p className="mt-1 text-[12px] text-[#b12704]">
                      Rejected: {p.rejectionReason}
                    </p>
                  )}

                  {rejecting === p.id && (
                    <div className="mt-3">
                      <input
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Why is this being rejected? The seller sees this."
                        className="input-amazon mb-2"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => decide(p.id, 'reject', reason)}
                          disabled={!reason.trim() || busy === p.id}
                          className="btn-amazon"
                        >
                          Confirm rejection
                        </button>
                        <button
                          onClick={() => setRejecting(null)}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {rejecting !== p.id && (
                  <div className="flex w-40 shrink-0 flex-col gap-2">
                    {p.status !== 'active' && (
                      <button
                        onClick={() => decide(p.id, 'approve')}
                        disabled={busy === p.id}
                        className="btn-amazon"
                      >
                        {busy === p.id ? 'Working…' : 'Approve'}
                      </button>
                    )}
                    {p.status !== 'rejected' && (
                      <button
                        onClick={() => setRejecting(p.id)}
                        className="btn-secondary"
                      >
                        Reject
                      </button>
                    )}
                    {p.status !== 'archived' && (
                      <button
                        onClick={() => decide(p.id, 'archive')}
                        disabled={busy === p.id}
                        className="btn-secondary"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </RoleShell>
  );
}
