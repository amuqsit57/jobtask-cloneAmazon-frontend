'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { RoleShell, ADMIN_NAV } from '@/components/RoleShell';
import { getAdminOrders } from '@/lib/api';
import { formatOrderDate } from '@/lib/utils';
import type { AdminOrder } from '@/lib/types';

export default function AdminOrders() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);

  useEffect(() => {
    if (!session?.apiToken) return;
    getAdminOrders(session.apiToken)
      .then((r) => setOrders(r.orders))
      .catch(() => setOrders([]));
  }, [session]);

  return (
    <RoleShell role="admin" title="All orders" nav={ADMIN_NAV}>
      {!orders ? (
        <p className="text-[14px]">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center text-[15px]">
          No orders yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#d5d9d9] bg-white">
          <table className="w-full text-[13px]">
            <thead className="border-b border-[#d5d9d9] bg-[#f7fafa] text-left">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Buyer</th>
                <th className="p-3">Placed</th>
                <th className="p-3 text-right">Lines</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-gray-100 last:border-0">
                  <td className="p-3 font-mono text-[12px]">{o.orderNumber}</td>
                  <td className="p-3">
                    <p>{o.buyerName ?? '—'}</p>
                    <p className="text-[12px] text-[var(--color-text-secondary)]">
                      {o.buyerEmail}
                    </p>
                  </td>
                  <td className="p-3 text-[12px]">{formatOrderDate(o.placedAt)}</td>
                  <td className="p-3 text-right">{o.lineCount}</td>
                  <td className="p-3 text-right font-bold">{o.totalFormatted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </RoleShell>
  );
}
