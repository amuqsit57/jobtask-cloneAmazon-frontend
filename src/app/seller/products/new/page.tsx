'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { RoleShell, SELLER_NAV } from '@/components/RoleShell';
import { createSellerProduct, listCategories } from '@/lib/api';
import type { Category } from '@/lib/types';

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
];

export default function NewProduct() {
  const router = useRouter();
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    title: '', brand: '', description: '', price: '', listPrice: '', stock: '10',
    categoryId: '', image: SAMPLE_IMAGES[0],
  });
  const [bullets, setBullets] = useState(['', '', '']);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    listCategories().then((r) => setCategories(r.categories)).catch(() => {});
  }, []);

  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.apiToken) return;
    setBusy(true);
    setError(null);
    try {
      const { message } = await createSellerProduct(
        {
          title: form.title,
          brand: form.brand || undefined,
          description: form.description || undefined,
          bullets: bullets.filter((b) => b.trim()),
          categoryId: form.categoryId ? Number(form.categoryId) : null,
          price: Number(form.price),
          listPrice: form.listPrice ? Number(form.listPrice) : null,
          stock: Number(form.stock),
          images: [form.image],
        },
        session.apiToken
      );
      setDone(message);
      setTimeout(() => router.push('/seller/products'), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the listing');
      setBusy(false);
    }
  }

  return (
    <RoleShell role="seller" title="Add a product" nav={SELLER_NAV}>
      {done ? (
        <div className="rounded-lg border border-[#067d62] bg-white p-6 text-center">
          <p className="mb-1 text-[18px] font-bold text-[#067d62]">Listing created</p>
          <p className="text-[14px]">{done}</p>
        </div>
      ) : (
        <form onSubmit={submit} className="max-w-3xl rounded-lg border border-[#d5d9d9] bg-white p-6">
          <p className="mb-4 rounded border border-dashed border-gray-300 bg-[#f7fafa] p-3 text-[13px]">
            New listings are reviewed before they go live. Until an admin approves
            it, the product will not appear in customer search.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Product title" value={form.title}
                onChange={(v) => set('title', v)} required
                placeholder="Be descriptive — this is what customers search" />
            </div>
            <Field label="Brand" value={form.brand} onChange={(v) => set('brand', v)} />
            <label className="block">
              <span className="mb-1 block text-[13px] font-bold">Category</span>
              <select value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}
                className="input-amazon">
                <option value="">Choose a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>

            <Field label="Price (USD)" value={form.price} onChange={(v) => set('price', v)}
              required type="number" placeholder="49.99" />
            <Field label="List price (optional)" value={form.listPrice}
              onChange={(v) => set('listPrice', v)} type="number" placeholder="79.99" />
            <Field label="Stock" value={form.stock} onChange={(v) => set('stock', v)}
              required type="number" />

            <label className="block">
              <span className="mb-1 block text-[13px] font-bold">Image</span>
              <select value={form.image} onChange={(e) => set('image', e.target.value)}
                className="input-amazon">
                {SAMPLE_IMAGES.map((u, i) => (
                  <option key={u} value={u}>Sample image {i + 1}</option>
                ))}
              </select>
            </label>

            <div className="sm:col-span-2">
              <label className="block">
                <span className="mb-1 block text-[13px] font-bold">Description</span>
                <textarea value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  rows={3} className="input-amazon resize-y" />
              </label>
            </div>

            <div className="sm:col-span-2">
              <span className="mb-1 block text-[13px] font-bold">
                About this item (bullet points)
              </span>
              {bullets.map((b, i) => (
                <input
                  key={i}
                  value={b}
                  onChange={(e) => {
                    const next = [...bullets];
                    next[i] = e.target.value;
                    setBullets(next);
                  }}
                  placeholder={`Bullet ${i + 1}`}
                  className="input-amazon mb-2"
                />
              ))}
            </div>
          </div>

          {error && (
            <p className="mt-3 rounded border border-[#c40000] bg-[#fff5f5] p-2 text-[13px] text-[#c40000]">
              {error}
            </p>
          )}

          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={busy} className="btn-amazon">
              {busy ? 'Submitting…' : 'Submit for review'}
            </button>
            <button type="button" onClick={() => router.push('/seller/products')}
              className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}
    </RoleShell>
  );
}

function Field({
  label, value, onChange, required, type = 'text', placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void;
  required?: boolean; type?: string; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] font-bold">{label}</span>
      <input type={type} value={value} required={required} placeholder={placeholder}
        step={type === 'number' ? 'any' : undefined}
        onChange={(e) => onChange(e.target.value)} className="input-amazon" />
    </label>
  );
}
