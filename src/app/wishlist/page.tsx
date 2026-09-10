'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Share2, Check } from 'lucide-react';
import { getWishlist, removeFromWishlist, updateWishlist } from '@/lib/api';
import { useCart } from '@/store/cart';
import { Stars } from '@/components/Stars';
import type { Wishlist } from '@/lib/types';

export default function WishlistPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const add = useCart((s) => s.add);
  const [list, setList] = useState<Wishlist | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/signin?callbackUrl=/wishlist');
  }, [status, router]);

  useEffect(() => {
    if (!session?.apiToken) return;
    getWishlist(session.apiToken).then((r) => setList(r.wishlist)).catch(() => {});
  }, [session]);

  async function toggleShare() {
    if (!session?.apiToken || !list) return;
    const { wishlist } = await updateWishlist({ isPublic: !list.isPublic }, session.apiToken);
    setList({ ...list, isPublic: wishlist.isPublic, shareSlug: wishlist.shareSlug });
  }

  async function remove(productId: number) {
    if (!session?.apiToken || !list) return;
    const { items } = await removeFromWishlist(productId, session.apiToken);
    setList({ ...list, items });
  }

  if (status === 'loading' || !list) {
    return <div className="mx-auto max-w-4xl p-10 text-center">Loading…</div>;
  }

  const shareUrl =
    list.shareSlug && typeof window !== 'undefined'
      ? `${location.origin}/l/${list.shareSlug}`
      : '';

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-5">
      <div className="bg-white p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-[28px] font-normal">{list.name}</h1>
            <p className="text-[13px] text-[var(--color-text-secondary)]">
              {list.items.length} {list.items.length === 1 ? 'item' : 'items'} ·{' '}
              {list.isPublic ? 'Public' : 'Private'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleShare} className="btn-secondary">
              <Share2 size={14} className="mr-1.5" />
              {list.isPublic ? 'Make private' : 'Make public'}
            </button>
            {list.isPublic && shareUrl && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="btn-amazon"
              >
                {copied ? <><Check size={14} className="mr-1" /> Copied</> : 'Copy link'}
              </button>
            )}
          </div>
        </div>

        {list.items.length === 0 ? (
          <div className="py-10 text-center">
            <p className="mb-3 text-[16px]">Your list is empty.</p>
            <Link href="/" className="btn-amazon">Browse products</Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {list.items.map((p) => (
              <li key={p.id} className="flex gap-4 py-4">
                <Link href={`/product/${p.slug}`} className="relative h-28 w-28 shrink-0">
                  {p.image && (
                    <Image src={p.image} alt={p.title} fill sizes="112px" className="object-contain" />
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${p.slug}`} className="line-clamp-2 text-[17px] link-amazon">
                    {p.title}
                  </Link>
                  <div className="my-1 flex items-center gap-1">
                    <Stars rating={p.rating} />
                    <span className="text-[12px] text-[var(--color-link)]">
                      {p.reviewCount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[18px] font-bold text-[var(--color-price)]">
                    {p.priceFormatted}
                  </p>
                  <p className="text-[13px] text-[var(--color-success)]">
                    {p.inStock ? 'In Stock' : 'Currently unavailable'}
                  </p>
                </div>
                <div className="flex w-40 shrink-0 flex-col gap-2">
                  <button
                    onClick={() => add(p.id, 1)}
                    disabled={!p.inStock}
                    className="btn-amazon"
                  >
                    Add to Cart
                  </button>
                  <button onClick={() => remove(p.id)} className="btn-secondary">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
