'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Stars } from './Stars';
import type { Category } from '@/lib/types';

const PRICE_BANDS = [
  { label: 'Under $25', min: undefined, max: '25' },
  { label: '$25 to $50', min: '25', max: '50' },
  { label: '$50 to $100', min: '50', max: '100' },
  { label: '$100 to $200', min: '100', max: '200' },
  { label: '$200 & Above', min: '200', max: undefined },
];

export function SearchFilters({
  categories,
  current,
}: {
  categories: Category[];
  current: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const params = useSearchParams();

  function apply(patch: Record<string, string | undefined>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v == null) sp.delete(k);
      else sp.set(k, v);
    }
    sp.delete('page');
    router.push(`/s?${sp}`);
  }

  const hasFilters =
    current.category || current.minPrice || current.maxPrice ||
    current.minRating || current.prime;

  return (
    <aside className="hidden w-52 shrink-0 lg:block">
      {hasFilters && (
        <button
          onClick={() => {
            const sp = new URLSearchParams();
            if (current.q) sp.set('q', current.q);
            router.push(`/s?${sp}`);
          }}
          className="mb-3 text-[13px] link-amazon"
        >
          Clear all filters
        </button>
      )}

      <section className="mb-4">
        <h3 className="mb-1 text-[16px] font-bold">Department</h3>
        <ul className="space-y-1">
          {categories.map((c) => (
            <li key={c.slug}>
              <button
                onClick={() =>
                  apply({ category: current.category === c.slug ? undefined : c.slug })
                }
                className={`text-left text-[14px] hover:text-[var(--color-link-hover)] hover:underline ${
                  current.category === c.slug
                    ? 'font-bold text-[var(--color-text-primary)]'
                    : 'text-[var(--color-text-primary)]'
                }`}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-4">
        <h3 className="mb-1 text-[16px] font-bold">Customer Reviews</h3>
        {[4, 3, 2].map((r) => (
          <button
            key={r}
            onClick={() =>
              apply({ minRating: current.minRating === String(r) ? undefined : String(r) })
            }
            className={`flex items-center gap-1 py-0.5 text-[14px] hover:underline ${
              current.minRating === String(r) ? 'font-bold' : ''
            }`}
          >
            <Stars rating={r} /> <span>&amp; Up</span>
          </button>
        ))}
      </section>

      <section className="mb-4">
        <h3 className="mb-1 text-[16px] font-bold">Price</h3>
        <ul className="space-y-1">
          {PRICE_BANDS.map((b) => {
            const active =
              current.minPrice === b.min && current.maxPrice === b.max;
            return (
              <li key={b.label}>
                <button
                  onClick={() =>
                    apply(
                      active
                        ? { minPrice: undefined, maxPrice: undefined }
                        : { minPrice: b.min, maxPrice: b.max }
                    )
                  }
                  className={`text-[14px] hover:text-[var(--color-link-hover)] hover:underline ${
                    active ? 'font-bold' : ''
                  }`}
                >
                  {b.label}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h3 className="mb-1 text-[16px] font-bold">Prime</h3>
        <label className="flex cursor-pointer items-center gap-2 text-[14px]">
          <input
            type="checkbox"
            checked={current.prime === 'true'}
            onChange={(e) => apply({ prime: e.target.checked ? 'true' : undefined })}
            className="h-4 w-4 cursor-pointer"
          />
          <span className="font-bold italic text-[#00A8E1]">prime</span>
        </label>
      </section>
    </aside>
  );
}
