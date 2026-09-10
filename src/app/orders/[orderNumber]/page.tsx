'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { CheckCircle2 } from 'lucide-react';
import { getOrder } from '@/lib/api';
import { formatOrderDate } from '@/lib/utils';
import type { Order } from '@/lib/types';

function OrderDetail() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const router = useRouter();
  const params = useSearchParams();
  const { data: session, status } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [missing, setMissing] = useState(false);

  const justPlaced = params.get('placed') === '1';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/signin?callbackUrl=/orders/${orderNumber}`);
    }
  }, [status, router, orderNumber]);

  useEffect(() => {
    if (!session?.apiToken) return;
    getOrder(orderNumber, session.apiToken)
      .then((r) => setOrder(r.order))
      .catch(() => setMissing(true));
  }, [session, orderNumber]);

  if (missing) {
    return (
      <div className="mx-auto max-w-2xl bg-white p-10 text-center">
        <h1 className="mb-2 text-[24px] font-bold">Order not found</h1>
        <Link href="/orders" className="link-amazon">
          Back to your orders
        </Link>
      </div>
    );
  }

  if (status === 'loading' || !order) {
    return <div className="mx-auto max-w-4xl p-10 text-center">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-5">
      {justPlaced && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-[#067D62] bg-white p-5">
          <CheckCircle2 className="mt-0.5 shrink-0 text-[var(--color-success)]" />
          <div>
            <h1 className="text-[21px] font-bold text-[var(--color-success)]">
              Order placed, thank you!
            </h1>
            <p className="text-[14px]">
              Confirmation will be sent to your email.
              {order.deliveryEstimate && (
                <>
                  {' '}
                  Arriving{' '}
                  <span className="font-bold">
                    {formatOrderDate(order.deliveryEstimate)}
                  </span>
                  .
                </>
              )}
            </p>
          </div>
        </div>
      )}

      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-[24px] font-normal">Order Details</h2>
        <Link href="/orders" className="text-[13px] link-amazon">
          Back to Your Orders
        </Link>
      </div>

      <div className="rounded-lg border border-[var(--color-border-grey)] bg-white">
        <header className="border-b border-[var(--color-border-grey)] px-5 py-3 text-[13px]">
          <p>
            Ordered on {formatOrderDate(order.placedAt)} · Order #{' '}
            {order.orderNumber}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-3">
          <div>
            <h3 className="mb-1 text-[14px] font-bold">Shipping Address</h3>
            <address className="text-[13px] not-italic leading-5">
              {order.shipTo?.full_name}
              <br />
              {order.shipTo?.line1}
              {order.shipTo?.line2 && (
                <>
                  <br />
                  {order.shipTo.line2}
                </>
              )}
              <br />
              {order.shipTo?.city}, {order.shipTo?.state}{' '}
              {order.shipTo?.postal_code}
            </address>
          </div>

          <div>
            <h3 className="mb-1 text-[14px] font-bold">Payment Method</h3>
            <p className="text-[13px]">
              Card ending in {order.paymentLast4 ?? '••••'}
            </p>
          </div>

          <div>
            <h3 className="mb-1 text-[14px] font-bold">Order Summary</h3>
            <dl className="space-y-0.5 text-[13px]">
              <div className="flex justify-between">
                <dt>Item(s) Subtotal:</dt>
                <dd>{order.subtotalFormatted}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Shipping:</dt>
                <dd>
                  {order.shipping === 0 ? 'FREE' : order.shippingFormatted}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Estimated tax:</dt>
                <dd>{order.taxFormatted}</dd>
              </div>
              <div className="mt-1 flex justify-between border-t border-gray-200 pt-1 font-bold text-[var(--color-price)]">
                <dt>Grand Total:</dt>
                <dd>{order.totalFormatted}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="border-t border-[var(--color-border-grey)] p-5">
          <p className="mb-3 text-[18px] font-bold">
            {order.deliveryEstimate
              ? `Arriving ${formatOrderDate(order.deliveryEstimate)}`
              : 'Delivery scheduled'}
          </p>
          <div className="space-y-4">
            {order.items.map((i) => (
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
                    Qty: {i.quantity}
                  </p>
                  <p className="text-[13px] font-bold text-[var(--color-price)]">
                    {i.lineTotalFormatted}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading…</div>}>
      <OrderDetail />
    </Suspense>
  );
}
