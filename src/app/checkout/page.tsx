'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Lock } from 'lucide-react';
import { useCart } from '@/store/cart';
import { placeOrder } from '@/lib/api';
import { formatPrice, formatDeliveryDate, deliveryEstimate } from '@/lib/utils';
import type { Address } from '@/lib/types';

const TAX_RATE = 0.0725;
const FREE_SHIPPING_THRESHOLD = 3500;
const SHIPPING_FLAT = 599;

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { cart, loading, refresh } = useCart();

  const [address, setAddress] = useState<Address>({
    full_name: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    phone: '',
  });
  const [card, setCard] = useState('4242 4242 4242 4242');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Checkout requires an account; bounce to sign-in and come back here.
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/checkout');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.name && !address.full_name) {
      setAddress((a) => ({ ...a, full_name: session.user!.name! }));
    }
  }, [session, address.full_name]);

  if (status === 'loading' || loading) {
    return <div className="mx-auto max-w-4xl p-10 text-center">Loading…</div>;
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl bg-white p-10 text-center">
        <h1 className="mb-2 text-[24px] font-bold">Your cart is empty</h1>
        <p className="mb-4 text-[14px]">
          Add something to your cart before checking out.
        </p>
        <Link href="/" className="btn-amazon">
          Continue shopping
        </Link>
      </div>
    );
  }

  const subtotal = cart.subtotal;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + shipping + tax;

  const addressComplete =
    address.full_name && address.line1 && address.city &&
    address.state && address.postal_code;

  async function submit() {
    if (!session?.apiToken) return;
    setPlacing(true);
    setError(null);
    try {
      const { order } = await placeOrder(
        { shipTo: address, paymentLast4: card.replace(/\s/g, '').slice(-4) },
        session.apiToken
      );
      await refresh();
      router.push(`/orders/${order.orderNumber}?placed=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not place the order');
      setPlacing(false);
    }
  }

  return (
    <div className="bg-white">
      <div className="border-b border-gray-200 py-3 text-center">
        <Link href="/" className="text-[25px] font-bold tracking-tight">
          amazon
        </Link>
        <h1 className="text-[24px] font-normal">Checkout</h1>
      </div>

      <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          {/* --- 1. address --- */}
          <Section
            n={1}
            title="Shipping address"
            open={step === 1}
            done={step > 1}
            summary={
              step > 1
                ? `${address.full_name}, ${address.line1}, ${address.city} ${address.state}`
                : undefined
            }
            onEdit={() => setStep(1)}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full name" value={address.full_name}
                onChange={(v) => setAddress({ ...address, full_name: v })} />
              <Field label="Phone number" value={address.phone ?? ''}
                onChange={(v) => setAddress({ ...address, phone: v })} />
              <div className="sm:col-span-2">
                <Field label="Address" value={address.line1}
                  onChange={(v) => setAddress({ ...address, line1: v })} />
              </div>
              <div className="sm:col-span-2">
                <Field label="Apt, suite, unit (optional)" value={address.line2 ?? ''}
                  onChange={(v) => setAddress({ ...address, line2: v })} />
              </div>
              <Field label="City" value={address.city}
                onChange={(v) => setAddress({ ...address, city: v })} />
              <Field label="State" value={address.state}
                onChange={(v) => setAddress({ ...address, state: v })} />
              <Field label="ZIP Code" value={address.postal_code}
                onChange={(v) => setAddress({ ...address, postal_code: v })} />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!addressComplete}
              className="btn-amazon mt-4"
            >
              Use this address
            </button>
          </Section>

          {/* --- 2. payment --- */}
          <Section
            n={2}
            title="Payment method"
            open={step === 2}
            done={step > 2}
            summary={step > 2 ? `Card ending in ${card.replace(/\s/g, '').slice(-4)}` : undefined}
            onEdit={() => setStep(2)}
          >
            <p className="mb-3 rounded border border-dashed border-gray-300 bg-[#f7fafa] p-3 text-[13px]">
              This is a demo checkout. No payment is processed and no card details
              are stored — only the last four digits, to render the order page.
            </p>
            <Field
              label="Card number"
              value={card}
              onChange={setCard}
            />
            <button onClick={() => setStep(3)} className="btn-amazon mt-4">
              Use this payment method
            </button>
          </Section>

          {/* --- 3. review --- */}
          <Section n={3} title="Review items and shipping" open={step === 3}>
            <p className="mb-3 text-[16px] font-bold text-[var(--color-success)]">
              Delivery: {formatDeliveryDate(deliveryEstimate(shipping === 0))}
            </p>
            <div className="space-y-3">
              {cart.items.map((i) => (
                <div key={i.id} className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0">
                    {i.image && (
                      <Image src={i.image} alt={i.title} fill sizes="64px"
                        className="object-contain" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[13px]">{i.title}</p>
                    <p className="text-[13px] font-bold text-[var(--color-price)]">
                      {i.priceFormatted} × {i.quantity}
                    </p>
                  </div>
                  <p className="text-[13px] font-bold">{i.lineTotalFormatted}</p>
                </div>
              ))}
            </div>

            {error && (
              <p className="mt-3 rounded border border-[#c40000] bg-[#fff5f5] p-2 text-[13px] text-[#c40000]">
                {error}
              </p>
            )}

            <button
              onClick={submit}
              disabled={placing}
              className="btn-amazon mt-4 w-full sm:w-auto"
            >
              {placing ? 'Placing order…' : 'Place your order'}
            </button>
          </Section>
        </div>

        {/* --- summary --- */}
        <aside className="h-fit rounded-lg border border-[var(--color-border-grey)] p-4">
          <button
            onClick={submit}
            disabled={placing || step < 3}
            className="btn-amazon mb-3 w-full"
          >
            {placing ? 'Placing order…' : 'Place your order'}
          </button>
          <p className="mb-3 flex items-center justify-center gap-1 text-[12px] text-[var(--color-text-secondary)]">
            <Lock size={12} /> Secure transaction
          </p>

          <h2 className="mb-2 border-t border-gray-200 pt-3 text-[18px] font-bold">
            Order Summary
          </h2>
          <dl className="space-y-1 text-[14px]">
            <Row label={`Items (${cart.count}):`} value={formatPrice(subtotal)} />
            <Row
              label="Shipping & handling:"
              value={shipping === 0 ? 'FREE' : formatPrice(shipping)}
            />
            <Row label="Estimated tax:" value={formatPrice(tax)} />
            <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 text-[18px] font-bold text-[var(--color-price)]">
              <dt>Order total:</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] font-bold">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-amazon"
      />
    </label>
  );
}

function Section({
  n,
  title,
  open,
  done,
  summary,
  onEdit,
  children,
}: {
  n: number;
  title: string;
  open: boolean;
  done?: boolean;
  summary?: string;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-4 rounded-lg border border-[var(--color-border-grey)] p-4">
      <div className="flex items-baseline gap-2">
        <h2 className="text-[18px] font-bold">
          {n}. {title}
        </h2>
        {done && summary && (
          <>
            <span className="flex-1 truncate text-[13px]">{summary}</span>
            <button onClick={onEdit} className="text-[13px] link-amazon">
              Change
            </button>
          </>
        )}
      </div>
      {open && <div className="mt-3">{children}</div>}
    </section>
  );
}
