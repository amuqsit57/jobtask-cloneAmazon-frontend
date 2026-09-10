'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { RoleShell, SELLER_NAV } from '@/components/RoleShell';
import { getSellerProducts, updateSellerStock } from '@/lib/api';
import type { Product } from '@/lib/types';

export default function SellerInventory() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [saved, setSaved] = useState<number | null>(null);

  useEffect(() => {
    if (!session?.apiToken) return;
    getSellerProducts(session.apiToken)
      .then((r) => {
        setProducts(r.products);
        setDrafts(
          Object.fromEntries(r.products.map((p) => [p.id, String(p.stock)]))
        );
      })
      .catch(() => setProducts([]));
  }, [session]);

  async function save(id: number) {
    if (!session?.apiToken) return;
    const stock = Number(drafts[id]);
    if (!Number.isInteger(stock) || stock < 0) return;
    await updateSellerStock(id, stock, session.apiToken);
    setProducts((ps) => ps?.map((p) => (p.id === id ? { ...p, stock } : p)) ?? null);
    setSaved(id);
    setTimeout(() => setSaved(null), 1500);
  }

  const live = (products ?? []).filter((p) => p.status !== 'archived');

  return (
    <RoleShell role="seller" title="Inventory" nav={SELLER_NAV}>
      <p className="mb-3 text-[13px] text-[var(--color-text-secondary)]">
        Stock falls automatically as orders are placed and rises again when a
        customer returns an item.
      </p>

      {!products ? (
        <p className="text-[14px]">Loading…</p>
      ) : live.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center text-[15px]">
          You have no active listings.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#d5d9d9] bg-white">
          <table className="w-full text-[13px]">
            <thead className="border-b border-[#d5d9d9] bg-[#f7fafa] text-left">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3 text-right">In stock</th>
                <th className="p-3 text-right">Set to</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {live.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 last:border-0">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0">
                        {p.image && (
                          <Image
                            src={p.image}
                            alt={p.title}
                            fill
                            sizes="40px"
                            className="object-contain"
                          />
                        )}
                      </div>
                      <span className="line-clamp-1">{p.title}</span>
                    </div>
                  </td>
                  <td
                    className={`p-3 text-right font-bold ${
                      p.stock < 10
                        ? 'text-[#b12704]'
                        : p.stock < 25
                          ? 'text-[#c45500]'
                          : ''
                    }`}
                  >
                    {p.stock}
                  </td>
                  <td className="p-3 text-right">
                    <input
                      value={drafts[p.id] ?? ''}
                      onChange={(e) =>
                        setDrafts({ ...drafts, [p.id]: e.target.value })
                      }
                      className="input-amazon w-24 text-right"
                      inputMode="numeric"
                    />
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => save(p.id)}
                      className="btn-secondary !py-1"
                    >
                      {saved === p.id ? 'Saved' : 'Update'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </RoleShell>
  );
}
