'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { RoleShell, SELLER_NAV, StatusBadge } from '@/components/RoleShell';
import { getSellerOrders, shipSellerOrder } from '@/lib/api';
import { formatOrderDate } from '@/lib/utils';
import type { SellerOrderLine } from '@/lib/types';

export default function SellerOrders() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<SellerOrderLine[] | null>(null);
  const [filter, setFilter] = useState<'all' | 'unshipped'>('all');
  const [busy, setBusy] = useState<number | null>(null);

  const load = () => {
    if (!session?.apiToken) return;
    getSellerOrders(session.apiToken)
      .then((r) => setOrders(r.orders))
      .catch(() => setOrders([]));
  };
  useEffect(load, [session]);

  async function ship(id: number) {
    if (!session?.apiToken) return;
    setBusy(id);
    try {
      await shipSellerOrder(id, undefined, session.apiToken);
      load();
    } finally {
      setBusy(null);
    }
  }

  const shown = (orders ?? []).filter(
    (o) => filter === 'all' || o.fulfillmentStatus === 'unshipped'
  );
  const pending = (orders ?? []).filter(
    (o) => o.fulfillmentStatus === 'unshipped'
  ).length;

  return (
    <RoleShell role="seller" title="Orders" nav={SELLER_NAV}>
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'btn-amazon' : 'btn-secondary'}
        >
          All ({orders?.length ?? 0})
        </button>
        <button
          onClick={() => setFilter('unshipped')}
          className={filter === 'unshipped' ? 'btn-amazon' : 'btn-secondary'}
        >
          Awaiting shipment ({pending})
        </button>
      </div>

      {!orders ? (
        <p className="text-[14px]">Loading your orders…</p>
      ) : shown.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center text-[15px]">
          {filter === 'unshipped'
            ? 'Nothing is waiting to ship.'
            : 'No orders yet. Sales appear here as customers buy your products.'}
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((o) => (
            <article
              key={o.id}
              className="rounded-lg border border-[#d5d9d9] bg-white p-4"
            >
              <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-1 border-b border-gray-100 pb-2 text-[12px] text-[var(--color-text-secondary)]">
                <span>
                  Order{' '}
                  <span className="font-bold text-[var(--color-text-primary)]">
                    {o.orderNumber}
                  </span>
                </span>
                <span>{formatOrderDate(o.placedAt)}</span>
                <span>Buyer: {o.buyerName ?? '—'}</span>
                <span className="ml-auto">
                  <StatusBadge status={o.fulfillmentStatus} />
                </span>
              </div>

              <div className="flex gap-4">
                <div className="relative h-16 w-16 shrink-0">
                  {o.image && (
                    <Image
                      src={o.image}
                      alt={o.title}
                      fill
                      sizes="64px"
                      className="object-contain"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-[14px]">{o.title}</p>
                  <p className="text-[13px] text-[var(--color-text-secondary)]">
                    Qty {o.quantity} · {o.unitPriceFormatted} each
                  </p>
                  {o.trackingNumber && (
                    <p className="text-[12px]">
                      Tracking:{' '}
                      <span className="font-mono">{o.trackingNumber}</span>
                    </p>
                  )}
                  <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">
                    Ship to: {o.shipTo?.full_name}, {o.shipTo?.city}{' '}
                    {o.shipTo?.state} {o.shipTo?.postal_code}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="mb-2 text-[16px] font-bold">
                    {o.lineTotalFormatted}
                  </p>
                  {o.fulfillmentStatus === 'unshipped' && (
                    <button
                      onClick={() => ship(o.id)}
                      disabled={busy === o.id}
                      className="btn-amazon"
                    >
                      {busy === o.id ? 'Shipping…' : 'Confirm shipment'}
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </RoleShell>
  );
}
