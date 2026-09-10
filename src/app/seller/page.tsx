'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { RoleShell, SELLER_NAV, Stat, SalesChart } from '@/components/RoleShell';
import { getSellerStats } from '@/lib/api';
import type { SellerStats } from '@/lib/types';

export default function SellerDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<SellerStats | null>(null);

  useEffect(() => {
    if (!session?.apiToken) return;
    getSellerStats(session.apiToken).then(setStats).catch(() => {});
  }, [session]);

  return (
    <RoleShell role="seller" title="Dashboard" nav={SELLER_NAV}>
      {!stats ? (
        <p className="text-[14px]">Loading your numbers…</p>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Total revenue" value={stats.revenueFormatted}
              sub={`${stats.unitsSold} units sold`} tone="good" />
            <Stat label="Last 30 days" value={stats.revenue30dFormatted} />
            <Stat label="Orders" value={stats.orderCount} />
            <Stat label="Awaiting shipment" value={stats.pendingShipments}
              tone={stats.pendingShipments > 0 ? 'warn' : 'default'}
              sub={stats.pendingShipments > 0 ? 'Needs your attention' : 'All caught up'} />
          </div>

          <SalesChart data={stats.salesByDay} />

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-lg border border-[#d5d9d9] bg-white p-4">
              <h2 className="mb-3 text-[16px] font-bold">Your best sellers</h2>
              {stats.topProducts.length === 0 ? (
                <p className="text-[13px] text-[var(--color-text-secondary)]">
                  No sales yet.
                </p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {stats.topProducts.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 py-2">
                      <div className="relative h-12 w-12 shrink-0">
                        {p.image && (
                          <Image src={p.image} alt={p.title} fill sizes="48px"
                            className="object-contain" />
                        )}
                      </div>
                      <Link href={`/product/${p.slug}`}
                        className="line-clamp-1 min-w-0 flex-1 text-[13px] link-amazon">
                        {p.title}
                      </Link>
                      <span className="shrink-0 text-right text-[13px]">
                        <span className="block font-bold">{p.revenueFormatted}</span>
                        <span className="text-[11px] text-[var(--color-text-secondary)]">
                          {p.units} sold
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-lg border border-[#d5d9d9] bg-white p-4">
              <h2 className="mb-3 text-[16px] font-bold">Low stock</h2>
              {stats.lowStock.length === 0 ? (
                <p className="text-[13px] text-[var(--color-text-secondary)]">
                  Nothing is running low.
                </p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {stats.lowStock.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 py-2">
                      <Link href={`/product/${p.slug}`}
                        className="line-clamp-1 min-w-0 flex-1 text-[13px] link-amazon">
                        {p.title}
                      </Link>
                      <span className={`shrink-0 text-[13px] font-bold ${
                        p.stock < 10 ? 'text-[#b12704]' : ''
                      }`}>
                        {p.stock} left
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/seller/inventory" className="mt-3 inline-block text-[13px] link-amazon">
                Manage inventory →
              </Link>
            </section>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <Stat label="Active listings" value={stats.productsByStatus.active} />
            <Stat label="Pending review" value={stats.productsByStatus.pending}
              tone={stats.productsByStatus.pending > 0 ? 'warn' : 'default'} />
            <Stat label="Rejected" value={stats.productsByStatus.rejected} />
            <Stat label="Archived" value={stats.productsByStatus.archived} />
          </div>
        </div>
      )}
    </RoleShell>
  );
}
