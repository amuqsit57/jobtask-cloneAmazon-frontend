import Link from 'next/link';
import Image from 'next/image';
import { getFeatured, listCategories } from '@/lib/api';
import { ProductRail } from '@/components/ProductRail';
import { HeroCarousel } from '@/components/HeroCarousel';
import type { Product } from '@/lib/types';

// The catalog changes rarely; revalidate rather than hitting the API per request.
export const revalidate = 60;

export default async function HomePage() {
  // A cold API (free-tier host spinning up) should degrade to an empty shell
  // rather than a 500 page, so the site still renders while the backend wakes.
  const [featured, cats] = await Promise.all([
    getFeatured().catch(() => ({
      bestSellers: [] as Product[],
      deals: [] as Product[],
      topRated: [] as Product[],
    })),
    listCategories().catch(() => ({ categories: [] })),
  ]);

  const cards = cats.categories.slice(0, 8);

  return (
    <>
      <div className="relative">
        <HeroCarousel />

        {/* Amazon overlaps its category cards onto the hero image. */}
        <div className="relative z-10 -mt-32 px-3 md:-mt-56 lg:px-6">
          <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((c) => (
              <div key={c.slug} className="bg-white p-5">
                <h2 className="mb-3 text-[21px] font-bold leading-6">{c.name}</h2>
                <Link href={`/s?category=${c.slug}`} className="group block">
                  <div className="relative mb-3 h-56 w-full overflow-hidden">
                    {c.image && (
                      <Image
                        src={c.image}
                        alt={c.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 340px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <span className="text-[13px] link-amazon">Shop now</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] space-y-4 px-3 py-4 lg:px-6">
        {featured.deals.length > 0 && (
          <ProductRail
            title="Today's Deals"
            products={featured.deals}
            href="/s?sort=price-asc"
          />
        )}
        {featured.bestSellers.length > 0 && (
          <ProductRail title="Best Sellers" products={featured.bestSellers} />
        )}
        {featured.topRated.length > 0 && (
          <ProductRail
            title="Top rated in every category"
            products={featured.topRated}
          />
        )}

        {featured.bestSellers.length === 0 && (
          <div className="bg-white p-8 text-center">
            <h2 className="mb-2 text-[21px] font-bold">Catalog unavailable</h2>
            <p className="text-[14px] text-[var(--color-text-secondary)]">
              The API is not reachable right now. If this is a fresh deploy the
              backend may still be starting up.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
