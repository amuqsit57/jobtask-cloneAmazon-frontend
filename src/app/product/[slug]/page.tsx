import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/api';
import { Stars } from '@/components/Stars';
import { PrimeBadge } from '@/components/PrimeBadge';
import { ProductGallery } from '@/components/ProductGallery';
import { BuyBox } from '@/components/BuyBox';
import { VariantPicker } from '@/components/VariantPicker';
import { ProductRail } from '@/components/ProductRail';
import { QuestionsSection } from '@/components/QuestionsSection';
import { WriteReview } from '@/components/WriteReview';
import { HelpfulButton } from '@/components/HelpfulButton';
import { ApiError } from '@/lib/api';
import { formatOrderDate } from '@/lib/utils';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const { product } = await getProduct(slug);
    return {
      title: `${product.title} : Amazon.com`,
      description: product.description ?? undefined,
    };
  } catch {
    return { title: 'Product : Amazon.com' };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product;
  try {
    ({ product } = await getProduct(slug));
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const dist = product.ratingDistribution ?? {};
  const totalRated = Object.values(dist).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1500px] px-5 py-4 sm:px-8 lg:px-12 xl:px-16">
        <nav className="mb-3 text-[12px] text-[var(--color-text-secondary)]">
          <Link href="/" className="link-amazon">
            Home
          </Link>
          {product.categorySlug && (
            <>
              {' › '}
              <Link href={`/s?category=${product.categorySlug}`} className="link-amazon">
                {product.categoryName}
              </Link>
            </>
          )}
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)_300px] lg:gap-10 xl:gap-12">
          <ProductGallery images={product.images} title={product.title} />

          {/* --- centre column --- */}
          <div className="min-w-0">
            <h1 className="text-[24px] font-normal leading-8">{product.title}</h1>

            {product.brand && (
              <Link
                href={`/s?q=${encodeURIComponent(product.brand)}`}
                className="text-[14px] link-amazon"
              >
                Visit the {product.brand} Store
              </Link>
            )}

            <div className="mt-1 flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
              <Stars rating={product.rating} size={16} />
              <span className="text-[14px] font-medium">{product.rating.toFixed(1)}</span>
              <Link href="#reviews" className="text-[14px] link-amazon">
                {product.reviewCount.toLocaleString()} ratings
              </Link>
              {product.isBestSeller && (
                <span className="bg-[var(--color-deal)] px-1.5 py-0.5 text-[11px] font-bold text-white">
                  Best Seller
                </span>
              )}
            </div>

            <div className="border-b border-gray-200 py-3">
              {product.discountPercent ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-[24px] text-[var(--color-deal)]">
                    -{product.discountPercent}%
                  </span>
                  <span className="flex items-baseline">
                    <span className="text-[13px]">$</span>
                    <span className="text-[28px] font-medium">
                      {product.priceParts.whole}
                    </span>
                    <span className="text-[13px]">{product.priceParts.frac}</span>
                  </span>
                </div>
              ) : (
                <span className="flex items-baseline">
                  <span className="text-[13px]">$</span>
                  <span className="text-[28px] font-medium">
                    {product.priceParts.whole}
                  </span>
                  <span className="text-[13px]">{product.priceParts.frac}</span>
                </span>
              )}

              {product.listPrice && product.listPrice > product.price && (
                <p className="text-[14px] text-[var(--color-text-secondary)]">
                  List Price:{' '}
                  <s>{product.listPriceFormatted}</s>
                </p>
              )}
              {product.isPrime && (
                <div className="mt-1">
                  <PrimeBadge />
                </div>
              )}
            </div>

            {Object.keys(product.variants).length > 0 && (
              <div className="border-b border-gray-200 py-3">
                <VariantPicker variants={product.variants} />
              </div>
            )}

            {product.bullets.length > 0 && (
              <div className="py-3">
                <h2 className="mb-2 text-[16px] font-bold">About this item</h2>
                <ul className="max-w-2xl list-disc space-y-2 pl-5 text-[14px] leading-6">
                  {product.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <BuyBox product={product} />
        </div>

        {/* --- description --- */}
        {product.description && (
          <section className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="mb-3 text-[21px] font-bold">Product description</h2>
            <p className="max-w-3xl text-[14px] leading-6">{product.description}</p>
          </section>
        )}

        {/* --- reviews --- */}
        <section id="reviews" className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="mb-4 text-[21px] font-bold">Customer reviews</h2>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-12">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Stars rating={product.rating} size={20} />
                <span className="text-[18px]">
                  {product.rating.toFixed(1)} out of 5
                </span>
              </div>
              <p className="mb-3 text-[14px] text-[var(--color-text-secondary)]">
                {product.reviewCount.toLocaleString()} global ratings
              </p>

              {[5, 4, 3, 2, 1].map((star) => {
                const pct = Math.round(((dist[star] ?? 0) / totalRated) * 100);
                return (
                  <div key={star} className="flex items-center gap-2 py-0.5 text-[14px]">
                    <span className="w-12 shrink-0 link-amazon">{star} star</span>
                    <div className="h-5 flex-1 border border-[#d5d9d9] bg-[#f0f2f2]">
                      <div
                        className="h-full bg-[#FFA41C]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-9 shrink-0 text-right link-amazon">{pct}%</span>
                  </div>
                );
              })}

              <div className="mt-4 border-t border-gray-200 pt-4">
                <p className="mb-2 text-[14px]">Review this product</p>
                <WriteReview productId={product.id} />
              </div>
            </div>

            <div className="space-y-6">
              {(product.reviews ?? []).map((r) => (
                <article key={r.id} className="border-b border-gray-100 pb-5">
                  <div className="mb-1 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-[12px] font-bold text-white">
                      {r.author.charAt(0)}
                    </div>
                    <span className="text-[13px]">{r.author}</span>
                  </div>
                  <div className="mb-1 flex items-center gap-2">
                    <Stars rating={r.rating} />
                    <span className="text-[14px] font-bold">{r.title}</span>
                  </div>
                  <p className="mb-1 text-[12px] text-[var(--color-text-secondary)]">
                    Reviewed on {formatOrderDate(r.createdAt)}
                    {r.verified && (
                      <span className="ml-2 font-bold text-[#C45500]">
                        Verified Purchase
                      </span>
                    )}
                  </p>
                  <p className="text-[14px] leading-5">{r.body}</p>
                  <HelpfulButton reviewId={r.id} initial={r.helpful} />
                </article>
              ))}
            </div>
          </div>
        </section>

        <QuestionsSection
          productId={product.id}
          initial={product.questions ?? []}
        />

        {product.related && product.related.length > 0 && (
          <div className="mt-8">
            <ProductRail
              title="Products related to this item"
              products={product.related}
            />
          </div>
        )}
      </div>
    </div>
  );
}
