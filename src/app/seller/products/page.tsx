'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { RoleShell, SELLER_NAV, StatusBadge } from '@/components/RoleShell';
import { getSellerProducts, archiveSellerProduct, updateSellerProduct } from '@/lib/api';
import type { Product } from '@/lib/types';

export default function SellerProducts() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState({ price: '', stock: '' });
  const [busy, setBusy] = useState(false);

  const load = () => {
    if (!session?.apiToken) return;
    getSellerProducts(session.apiToken).then((r) => setProducts(r.products)).catch(() => {});
  };
  useEffect(load, [session]);

  async function save(id: number) {
    if (!session?.apiToken) return;
    setBusy(true);
    try {
      await updateSellerProduct(
        id,
        {
          price: draft.price ? Number(draft.price) : undefined,
          stock: draft.stock ? Number(draft.stock) : undefined,
        },
        session.apiToken
      );
      setEditing(null);
      load();
    } finally {
      setBusy(false);
    }
  }

  async function archive(id: number) {
    if (!session?.apiToken) return;
    await archiveSellerProduct(id, session.apiToken);
    load();
  }

  return (
    <RoleShell role="seller" title="Your products" nav={SELLER_NAV}>
      <div className="mb-3 flex justify-end">
        <Link href="/seller/products/new" className="btn-amazon">
          Add a product
        </Link>
      </div>

      {!products ? (
        <p className="text-[14px]">Loading…</p>
      ) : products.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center">
          <p className="mb-3 text-[15px]">You have no listings yet.</p>
          <Link href="/seller/products/new" className="btn-amazon">
            Create your first listing
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#d5d9d9] bg-white">
          <table className="w-full text-[13px]">
            <thead className="border-b border-[#d5d9d9] bg-[#f7fafa] text-left">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Price</th>
                <th className="p-3 text-right">Stock</th>
                <th className="p-3 text-right">Sold</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 last:border-0">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 shrink-0">
                        {p.image && (
                          <Image src={p.image} alt={p.title} fill sizes="44px"
                            className="object-contain" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/product/${p.slug}`} className="line-clamp-1 link-amazon">
                          {p.title}
                        </Link>
                        {p.rejectionReason && (
                          <p className="text-[11px] text-[#b12704]">
                            Rejected: {p.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-3"><StatusBadge status={p.status} /></td>
                  <td className="p-3 text-right">
                    {editing === p.id ? (
                      <input
                        value={draft.price}
                        onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                        className="input-amazon w-24 text-right"
                        placeholder={(p.price / 100).toFixed(2)}
                      />
                    ) : (
                      p.priceFormatted
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {editing === p.id ? (
                      <input
                        value={draft.stock}
                        onChange={(e) => setDraft({ ...draft, stock: e.target.value })}
                        className="input-amazon w-20 text-right"
                        placeholder={String(p.stock)}
                      />
                    ) : (
                      <span className={p.stock < 10 ? 'font-bold text-[#b12704]' : ''}>
                        {p.stock}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">{p.unitsSold ?? 0}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      {editing === p.id ? (
                        <>
                          <button onClick={() => save(p.id)} disabled={busy}
                            className="btn-amazon !py-1">Save</button>
                          <button onClick={() => setEditing(null)}
                            className="btn-secondary !py-1">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditing(p.id);
                              setDraft({
                                price: (p.price / 100).toFixed(2),
                                stock: String(p.stock),
                              });
                            }}
                            className="btn-secondary !py-1"
                          >
                            Edit
                          </button>
                          {p.status !== 'archived' && (
                            <button onClick={() => archive(p.id)}
                              className="btn-secondary !py-1">Archive</button>
                          )}
                        </>
                      )}
                    </div>
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
