'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@/lib/types';

/**
 * The horizontally scrolling product strip Amazon uses down the home page.
 * Scrolling is done natively with snap points rather than a carousel library,
 * so it stays smooth on touch and keeps keyboard/scrollbar behaviour intact.
 */
export function ProductRail({
  title,
  products,
  href,
}: {
  title: string;
  products: Product[];
  href?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.8), behavior: 'smooth' });
  };

  return (
    <section className="relative bg-white p-5">
      <div className="mb-3 flex items-baseline gap-3">
        <h2 className="text-[21px] font-bold leading-6">{title}</h2>
        {href && (
          <Link href={href} className="text-[13px] link-amazon">
            See more
          </Link>
        )}
      </div>

      <div className="group relative">
        <div
          ref={ref}
          className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar"
        >
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className="w-[150px] shrink-0 md:w-[180px]"
            >
              <div className="relative mb-2 h-[150px] w-full md:h-[180px]">
                {p.image && (
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="180px"
                    className="object-contain"
                  />
                )}
              </div>
              {p.discountPercent ? (
                <div className="flex items-center gap-1">
                  <span className="bg-[var(--color-deal)] px-1.5 py-0.5 text-[12px] font-bold text-white">
                    -{p.discountPercent}%
                  </span>
                  <span className="text-[17px] font-medium text-[var(--color-price)]">
                    {p.priceFormatted}
                  </span>
                </div>
              ) : (
                <span className="text-[17px] font-medium">{p.priceFormatted}</span>
              )}
              <p className="line-clamp-2 text-[12px] text-[var(--color-text-secondary)]">
                {p.title}
              </p>
            </Link>
          ))}
        </div>

        <button
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
          className="absolute -left-2 top-1/2 hidden -translate-y-1/2 rounded border border-[var(--color-border-grey)] bg-white/95 p-1 shadow group-hover:block"
        >
          <ChevronLeft size={28} />
        </button>
        <button
          onClick={() => scroll(1)}
          aria-label="Scroll right"
          className="absolute -right-2 top-1/2 hidden -translate-y-1/2 rounded border border-[var(--color-border-grey)] bg-white/95 p-1 shadow group-hover:block"
        >
          <ChevronRight size={28} />
        </button>
      </div>
    </section>
  );
}
