'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { RoleShell, ADMIN_NAV, Stat, SalesChart } from '@/components/RoleShell';
import { getAdminStats } from '@/lib/api';
import type { AdminStats } from '@/lib/types';

export default function AdminOverview() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    if (!session?.apiToken) return;
    getAdminStats(session.apiToken).then(setStats).catch(() => {});
  }, [session]);

  return (
    <RoleShell role="admin" title="Platform overview" nav={ADMIN_NAV}>
      {!stats ? (
        <p className="text-[14px]">Loading…</p>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Gross merchandise value"
              value={stats.gmvFormatted}
              sub={`${stats.orderCount} orders`}
              tone="good"
            />
            <Stat
              label="Customers"
              value={stats.users.customers}
              sub={`${stats.users.sellers} sellers, ${stats.users.admins} admins`}
            />
            <Stat label="Live listings" value={stats.products.active} />
            <Stat
              label="Awaiting review"
              value={stats.products.pending}
              tone={stats.products.pending > 0 ? 'warn' : 'default'}
              sub={stats.products.pending > 0 ? 'Needs moderation' : 'Queue is clear'}
            />
          </div>

          <SalesChart data={stats.revenueByDay} label="Platform revenue, last 30 days" />

          <section className="rounded-lg border border-[#d5d9d9] bg-white p-4">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-[16px] font-bold">Sellers</h2>
              <Link href="/admin/users?role=seller" className="text-[13px] link-amazon">
                Manage users →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="border-b border-gray-200 text-left">
                  <tr>
                    <th className="py-2">Store</th>
                    <th className="py-2">Contact</th>
                    <th className="py-2 text-right">Listings</th>
                    <th className="py-2 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.sellers.map((s) => (
                    <tr key={s.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 font-bold">{s.storeName ?? '—'}</td>
                      <td className="py-2 text-[var(--color-text-secondary)]">
                        {s.email}
                      </td>
                      <td className="py-2 text-right">{s.products}</td>
                      <td className="py-2 text-right font-bold">
                        {s.revenueFormatted}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-4">
            <Stat label="Active" value={stats.products.active} />
            <Stat label="Pending" value={stats.products.pending} />
            <Stat label="Rejected" value={stats.products.rejected} />
            <Stat label="Archived" value={stats.products.archived} />
          </div>
        </div>
      )}
    </RoleShell>
  );
}
