import Link from 'next/link';
import { listProducts, listCategories } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { SearchFilters } from '@/components/SearchFilters';
import { SortSelect } from '@/components/SortSelect';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);

  const [{ products, pagination }, { categories }] = await Promise.all([
    listProducts({
      q: sp.q,
      category: sp.category,
      minPrice: sp.minPrice,
      maxPrice: sp.maxPrice,
      minRating: sp.minRating,
      prime: sp.prime === 'true',
      sort: sp.sort ?? 'featured',
      page,
      limit: 24,
    }).catch(() => ({
      products: [],
      pagination: { page: 1, perPage: 24, total: 0, totalPages: 0 },
    })),
    listCategories().catch(() => ({ categories: [] })),
  ]);

  const activeCategory = categories.find((c) => c.slug === sp.category);
  const heading = sp.q
    ? `"${sp.q}"`
    : activeCategory?.name ?? 'All results';

  const buildHref = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...sp, ...patch })) {
      if (v) next.set(k, v);
    }
    return `/s?${next}`;
  };

  return (
    <div className="bg-white">
      <div className="mx-auto flex max-w-[1500px] gap-4 px-3 py-4 lg:px-6">
        <SearchFilters categories={categories} current={sp} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-200 pb-3">
            <p className="text-[14px] text-[var(--color-text-secondary)]">
              {pagination.total === 0 ? (
                'No results'
              ) : (
                <>
                  {(pagination.page - 1) * pagination.perPage + 1}-
                  {Math.min(pagination.page * pagination.perPage, pagination.total)} of{' '}
                  {pagination.total.toLocaleString()} results for{' '}
                </>
              )}
              <span className="font-bold text-[var(--color-price)]">{heading}</span>
            </p>
            <SortSelect current={sp.sort ?? 'featured'} />
          </div>

          {products.length === 0 ? (
            <div className="py-16 text-center">
              <h2 className="mb-2 text-[21px] font-bold">
                No results for {heading}
              </h2>
              <p className="mb-4 text-[14px] text-[var(--color-text-secondary)]">
                Try checking your spelling or use more general terms.
              </p>
              <Link href="/s" className="btn-amazon">
                Browse all products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-px bg-gray-100 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <nav className="mt-6 flex justify-center gap-1">
              {page > 1 && (
                <Link
                  href={buildHref({ page: String(page - 1) })}
                  className="btn-secondary"
                >
                  Previous
                </Link>
              )}
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                (n) => (
                  <Link
                    key={n}
                    href={buildHref({ page: String(n) })}
                    className={`btn-secondary min-w-10 ${
                      n === page ? 'bg-[#e6e6e6] font-bold' : ''
                    }`}
                  >
                    {n}
                  </Link>
                )
              )}
              {page < pagination.totalPages && (
                <Link
                  href={buildHref({ page: String(page + 1) })}
                  className="btn-secondary"
                >
                  Next
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
