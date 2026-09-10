'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Lock, ChevronDown } from 'lucide-react';
import { useCart } from '@/store/cart';
import { WishlistButton } from './WishlistButton';
import { deliveryEstimate, formatDeliveryDate } from '@/lib/utils';
import type { Product } from '@/lib/types';

export function BuyBox({ product }: { product: Product }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);

  const fast = deliveryEstimate(true);
  const free = deliveryEstimate(false);

  async function handleAdd(thenGo?: string) {
    setBusy(true);
    try {
      await add(product.id, qty);
      if (thenGo) router.push(thenGo);
      else {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className="h-fit rounded-lg border border-[var(--color-border-grey)] p-4">
      <p className="mb-1 flex items-baseline">
        <span className="text-[13px]">$</span>
        <span className="text-[28px] font-medium">{product.priceParts.whole}</span>
        <span className="text-[13px]">{product.priceParts.frac}</span>
      </p>

      <p className="mb-2 text-[14px]">
        FREE Returns{' '}
        <span className="text-[var(--color-text-secondary)]">
          {product.freeReturns ? '' : '(not eligible)'}
        </span>
      </p>

      <p className="mb-1 text-[14px]">
        FREE delivery{' '}
        <span className="font-bold">{formatDeliveryDate(free)}</span>
      </p>
      <p className="mb-3 text-[14px]">
        Or fastest delivery{' '}
        <span className="font-bold">{formatDeliveryDate(fast)}</span>
      </p>

      {product.inStock ? (
        <p className="mb-3 text-[18px] text-[var(--color-success)]">In Stock</p>
      ) : (
        <p className="mb-3 text-[18px] text-[var(--color-price)]">
          Currently unavailable
        </p>
      )}

      {product.inStock && product.stock < 20 && (
        <p className="mb-3 text-[14px] text-[var(--color-price)]">
          Only {product.stock} left in stock - order soon.
        </p>
      )}

      <label className="mb-3 flex items-center gap-2 text-[13px]">
        <span>Quantity:</span>
        <span className="relative">
          <select
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="cursor-pointer appearance-none rounded-lg border border-[#d5d9d9] bg-[#f0f2f2] py-1 pl-3 pr-7 shadow-sm outline-none hover:bg-[#e3e6e6]"
          >
            {Array.from({ length: Math.min(product.stock || 1, 10) }, (_, i) => i + 1).map(
              (n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              )
            )}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
          />
        </span>
      </label>

      <button
        onClick={() => handleAdd()}
        disabled={busy || !product.inStock}
        className="btn-amazon mb-2 w-full"
      >
        {added ? 'Added to Cart' : busy ? 'Adding...' : 'Add to Cart'}
      </button>

      <button
        onClick={() => handleAdd('/checkout')}
        disabled={busy || !product.inStock}
        className="btn-amazon-orange mb-3 w-full"
      >
        Buy Now
      </button>

      <p className="mb-3 flex items-center gap-1 text-[12px] text-[var(--color-text-secondary)]">
        <Lock size={12} /> Secure transaction
      </p>

      <WishlistButton productId={product.id} />

      <dl className="mt-3 space-y-1 border-t border-gray-200 pt-3 text-[12px]">
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-[var(--color-text-secondary)]">Ships from</dt>
          <dd>Amazon.com</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-[var(--color-text-secondary)]">Sold by</dt>
          <dd>{product.brand ?? 'Amazon.com'}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-[var(--color-text-secondary)]">Returns</dt>
          <dd>30-day refund/replacement</dd>
        </div>
      </dl>
    </aside>
  );
}
