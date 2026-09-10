'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Avg. Customer Review' },
  { value: 'newest', label: 'Newest Arrivals' },
];

export function SortSelect({ current }: { current: string }) {
  const router = useRouter();
  const params = useSearchParams();

  function change(value: string) {
    const sp = new URLSearchParams(params.toString());
    sp.set('sort', value);
    sp.delete('page');
    router.push(`/s?${sp}`);
  }

  return (
    <label className="flex items-center gap-2 text-[13px]">
      <span className="text-[var(--color-text-secondary)]">Sort by:</span>
      <select
        value={current}
        onChange={(e) => change(e.target.value)}
        className="cursor-pointer rounded-[3px] border border-[#d5d9d9] bg-[#f0f2f2] px-2 py-1.5 outline-none hover:bg-[#e3e6e6]"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
