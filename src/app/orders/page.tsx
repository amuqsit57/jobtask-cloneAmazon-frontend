'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { listOrders } from '@/lib/api';
import { formatOrderDate } from '@/lib/utils';
import type { Order } from '@/lib/types';

export default function OrdersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/signin?callbackUrl=/orders');
  }, [status, router]);

  useEffect(() => {
    if (!session?.apiToken) return;
    listOrders(session.apiToken)
      .then((r) => setOrders(r.orders))
      .catch(() => setOrders([]));
  }, [session]);

  if (status === 'loading' || orders === null) {
    return <div className="mx-auto max-w-4xl p-10 text-center">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-5">
      <h1 className="mb-4 text-[28px] font-normal">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white p-8 text-center">
          <p className="mb-3 text-[16px]">You have not placed any orders yet.</p>
          <Link href="/" className="btn-amazon">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <article
              key={o.id}
              className="rounded-lg border border-[var(--color-border-grey)] bg-white"
            >
              <header className="flex flex-wrap gap-6 rounded-t-lg border-b border-[var(--color-border-grey)] bg-[#F0F2F2] px-5 py-3 text-[12px]">
                <div>
                  <p className="uppercase text-[var(--color-text-secondary)]">
                    Order placed
                  </p>
                  <p>{formatOrderDate(o.placedAt)}</p>
                </div>
                <div>
                  <p className="uppercase text-[var(--color-text-secondary)]">Total</p>
                  <p>{o.totalFormatted}</p>
                </div>
                <div>
                  <p className="uppercase text-[var(--color-text-secondary)]">
                    Ship to
                  </p>
                  <p>{o.shipTo?.full_name}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="uppercase text-[var(--color-text-secondary)]">
                    Order # {o.orderNumber}
                  </p>
                  <Link href={`/orders/${o.orderNumber}`} className="link-amazon">
                    View order details
                  </Link>
                </div>
              </header>

              <div className="p-5">
                <p className="mb-3 text-[18px] font-bold">
                  {o.deliveryEstimate
                    ? `Arriving ${formatOrderDate(o.deliveryEstimate)}`
                    : 'Delivery scheduled'}
                </p>
                <div className="space-y-4">
                  {o.items.map((i) => (
                    <div key={i.id} className="flex gap-4">
                      <div className="relative h-20 w-20 shrink-0">
                        {i.image && (
                          <Image src={i.image} alt={i.title} fill sizes="80px"
                            className="object-contain" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        {i.slug ? (
                          <Link href={`/product/${i.slug}`}
                            className="line-clamp-2 text-[14px] link-amazon">
                            {i.title}
                          </Link>
                        ) : (
                          <p className="line-clamp-2 text-[14px]">{i.title}</p>
                        )}
                        <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
                          Qty: {i.quantity} · {i.unitPriceFormatted} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
