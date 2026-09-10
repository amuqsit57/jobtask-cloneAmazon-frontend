'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Stars } from './Stars';
import { PrimeBadge } from './PrimeBadge';
import { useCart } from '@/store/cart';
import { deliveryEstimate } from '@/lib/utils';
import type { Product } from '@/lib/types';

export function ProductCard({
  product,
  showDelivery = true,
}: {
  product: Product;
  showDelivery?: boolean;
}) {
  const add = useCart((s) => s.add);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleAdd() {
    setAdding(true);
    try {
      await add(product.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="flex flex-col bg-white p-4">
      <Link href={`/product/${product.slug}`} className="group">
        <div className="relative mx-auto mb-3 h-44 w-full">
          {product.image && (
            <Image
              src={product.image}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 45vw, 240px"
              className="object-contain transition-transform group-hover:scale-[1.03]"
            />
          )}
        </div>
      </Link>

      {product.isBestSeller && (
        <span className="mb-1 w-fit bg-[#CC0C39] px-1.5 py-0.5 text-[11px] font-bold text-white">
          Best Seller
        </span>
      )}

      <Link
        href={`/product/${product.slug}`}
        className="mb-1 line-clamp-2 text-[14px] leading-5 text-[var(--color-text-primary)] hover:text-[var(--color-link-hover)]"
      >
        {product.title}
      </Link>

      <div className="mb-1 flex items-center gap-1">
        <Stars rating={product.rating} />
        <span className="text-[12px] text-[var(--color-link)]">
          {product.reviewCount.toLocaleString()}
        </span>
      </div>

      <div className="mb-1 flex items-baseline gap-1">
        <span className="text-[12px] text-[var(--color-text-primary)]">$</span>
        <span className="text-[21px] font-medium leading-none text-[var(--color-text-primary)]">
          {product.priceParts.whole}
        </span>
        <span className="text-[12px] text-[var(--color-text-primary)]">
          {product.priceParts.frac}
        </span>
        {product.listPrice && product.listPrice > product.price && (
          <span className="ml-1 text-[12px] text-[var(--color-text-secondary)]">
            List: <s>{product.listPriceFormatted}</s>
          </span>
        )}
      </div>

      {product.isPrime && <PrimeBadge />}

      {showDelivery && (
        <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">
          FREE delivery{' '}
          <span className="font-bold text-[var(--color-text-primary)]">
            {deliveryEstimate(product.isPrime).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </p>
      )}

      {!product.inStock && (
        <p className="mt-1 text-[13px] text-[var(--color-price)]">
          Currently unavailable
        </p>
      )}

      <button
        onClick={handleAdd}
        disabled={adding || !product.inStock}
        className="btn-amazon mt-3 w-full"
      >
        {added ? 'Added to Cart' : adding ? 'Adding...' : 'Add to cart'}
      </button>
    </div>
  );
}
