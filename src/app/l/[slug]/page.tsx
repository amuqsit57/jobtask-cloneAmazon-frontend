import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getSharedWishlist } from '@/lib/api';
import { Stars } from '@/components/Stars';

export const dynamic = 'force-dynamic';

export default async function SharedListPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let wishlist;
  try {
    ({ wishlist } = await getSharedWishlist(slug));
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-5">
      <div className="bg-white p-6">
        <div className="mb-4 border-b border-gray-200 pb-4">
          <h1 className="text-[28px] font-normal">{wishlist.name}</h1>
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            A shared list from {wishlist.ownerName} · {wishlist.items.length}{' '}
            {wishlist.items.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {wishlist.items.length === 0 ? (
          <p className="py-8 text-center text-[14px]">This list is empty.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {wishlist.items.map((p) => (
              <li key={p.id} className="flex gap-4 py-4">
                <Link href={`/product/${p.slug}`} className="relative h-28 w-28 shrink-0">
                  {p.image && (
                    <Image src={p.image} alt={p.title} fill sizes="112px"
                      className="object-contain" />
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
                </div>
                <Link href={`/product/${p.slug}`} className="btn-amazon h-fit shrink-0">
                  View item
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
