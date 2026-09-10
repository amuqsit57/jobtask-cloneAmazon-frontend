'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/store/cart';
import { PrimeBadge } from '@/components/PrimeBadge';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();
  const { cart, loading, pending, update, remove } = useCart();

  if (loading) {
    return (
      <div className="mx-auto max-w-[1200px] p-6">
        <div className="animate-pulse space-y-3 bg-white p-6">
          <div className="h-8 w-48 bg-gray-200" />
          <div className="h-32 bg-gray-100" />
          <div className="h-32 bg-gray-100" />
        </div>
      </div>
    );
  }

  const empty = cart.items.length === 0;

  return (
    <div className="mx-auto max-w-[1500px] px-3 py-4 lg:px-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="bg-white p-5">
          {empty ? (
            <div className="py-8 text-center">
              <h1 className="mb-2 text-[28px] font-bold">
                Your Amazon Cart is empty
              </h1>
              <p className="mb-4 text-[14px]">
                Check your Saved for later items below or{' '}
                <Link href="/" className="link-amazon">
                  continue shopping
                </Link>
                .
              </p>
              <Link href="/" className="btn-amazon">
                Continue shopping
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between border-b border-gray-200 pb-2">
                <h1 className="text-[28px] font-normal">Shopping Cart</h1>
                <span className="text-[13px] text-[var(--color-text-secondary)]">
                  Price
                </span>
              </div>

              {cart.items.map((item) => (
                <article
                  key={item.id}
                  className={`flex gap-4 border-b border-gray-200 py-4 ${
                    pending.has(item.id) ? 'opacity-50' : ''
                  }`}
                >
                  <Link
                    href={`/product/${item.slug}`}
                    className="relative h-32 w-32 shrink-0"
                  >
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="128px"
                        className="object-contain"
                      />
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${item.slug}`}
                      className="line-clamp-2 text-[18px] leading-6 hover:text-[var(--color-link-hover)]"
                    >
                      {item.title}
                    </Link>

                    <p className="mt-1 text-[12px] text-[var(--color-success)]">
                      {item.inStock ? 'In Stock' : 'Currently unavailable'}
                    </p>
                    {item.isPrime && (
                      <div className="mt-0.5">
                        <PrimeBadge />
                      </div>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px]">
                      <span className="flex items-center gap-1 rounded-lg border border-[#d5d9d9] bg-[#f0f2f2] px-2 py-1 shadow-sm">
                        <button
                          onClick={() =>
                            item.quantity === 1
                              ? remove(item.id)
                              : update(item.id, { quantity: item.quantity - 1 })
                          }
                          aria-label="Decrease quantity"
                          className="px-1.5 font-bold"
                        >
                          {item.quantity === 1 ? '🗑' : '−'}
                        </button>
                        <span className="min-w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() =>
                            update(item.id, { quantity: item.quantity + 1 })
                          }
                          disabled={item.quantity >= item.stock}
                          aria-label="Increase quantity"
                          className="px-1.5 font-bold disabled:opacity-40"
                        >
                          +
                        </button>
                      </span>

                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => remove(item.id)}
                        className="link-amazon"
                      >
                        Delete
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => update(item.id, { savedForLater: true })}
                        className="link-amazon"
                      >
                        Save for later
                      </button>
                    </div>
                  </div>

                  <div className="shrink-0 text-right text-[18px] font-bold">
                    {item.lineTotalFormatted}
                  </div>
                </article>
              ))}

              <p className="pt-3 text-right text-[18px]">
                Subtotal ({cart.count} {cart.count === 1 ? 'item' : 'items'}):{' '}
                <span className="font-bold">{cart.subtotalFormatted}</span>
              </p>
            </>
          )}

          {cart.savedForLater.length > 0 && (
            <section className="mt-8 border-t border-gray-200 pt-4">
              <h2 className="mb-3 text-[21px]">Saved for later</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {cart.savedForLater.map((item) => (
                  <div key={item.id}>
                    <div className="relative mb-2 h-32 w-full">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="150px"
                          className="object-contain"
                        />
                      )}
                    </div>
                    <Link
                      href={`/product/${item.slug}`}
                      className="line-clamp-2 text-[13px] link-amazon"
                    >
                      {item.title}
                    </Link>
                    <p className="my-1 text-[16px] font-bold">
                      {item.priceFormatted}
                    </p>
                    <button
                      onClick={() => update(item.id, { savedForLater: false })}
                      className="btn-secondary w-full"
                    >
                      Move to cart
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* --- summary --- */}
        {!empty && (
          <aside className="h-fit bg-white p-5">
            {cart.freeShippingEligible ? (
              <p className="mb-3 text-[14px]">
                <span className="text-[var(--color-success)]">
                  Your order qualifies for FREE Shipping.
                </span>{' '}
                Choose this option at checkout.
              </p>
            ) : (
              <p className="mb-3 text-[14px]">
                Add{' '}
                <span className="font-bold">
                  {cart.freeShippingRemainingFormatted}
                </span>{' '}
                of eligible items to your order to qualify for FREE Shipping.
              </p>
            )}

            <p className="mb-3 text-[18px]">
              Subtotal ({cart.count} {cart.count === 1 ? 'item' : 'items'}):{' '}
              <span className="font-bold">{cart.subtotalFormatted}</span>
            </p>

            <button
              onClick={() => router.push('/checkout')}
              className="btn-amazon w-full"
            >
              Proceed to checkout
            </button>
          </aside>
        )}
      </div>
    </div>
  );
}
