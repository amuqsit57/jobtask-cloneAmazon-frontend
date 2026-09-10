'use client';

import { useState } from 'react';

/**
 * Variant selection is presentational here: the seeded catalog has one SKU per
 * product, so choosing a colour or size changes the displayed selection but not
 * the price or the item added to the cart. Wiring separate SKUs through the cart
 * was deliberately cut for the time budget - see README.
 */
export function VariantPicker({
  variants,
}: {
  variants: Record<string, { value: string; priceDelta: number }[]>;
}) {
  const [chosen, setChosen] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      Object.entries(variants).map(([name, opts]) => [name, opts[0]?.value])
    )
  );

  return (
    <div className="space-y-3">
      {Object.entries(variants).map(([name, options]) => (
        <div key={name}>
          <p className="mb-1 text-[14px]">
            <span className="font-bold">{name}:</span>{' '}
            <span>{chosen[name]}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {options.map((o) => (
              <button
                key={o.value}
                onClick={() => setChosen((c) => ({ ...c, [name]: o.value }))}
                className={`rounded-lg border px-3 py-1.5 text-[13px] transition ${
                  chosen[name] === o.value
                    ? 'border-[#e77600] bg-[#f0f8ff] shadow-[0_0_3px_2px_rgba(228,121,17,.5)]'
                    : 'border-[#d5d9d9] bg-white hover:border-gray-500'
                }`}
              >
                {o.value}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
