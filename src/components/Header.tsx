'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { MapPin, Search, ShoppingCart, Menu, ChevronDown } from 'lucide-react';
import { useCart } from '@/store/cart';
import { getSuggestions, listCategories } from '@/lib/api';
import type { Category } from '@/lib/types';

const DEPARTMENTS = [
  'All Departments',
  'Electronics',
  'Computers',
  'Home & Kitchen',
  'Books',
  'Fashion',
  'Beauty & Personal Care',
  'Toys & Games',
  'Sports & Outdoors',
];

export function Header() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: session } = useSession();
  const cart = useCart((s) => s.cart);

  const [q, setQ] = useState(params.get('q') ?? '');
  const [dept, setDept] = useState('All Departments');
  const [suggestions, setSuggestions] = useState<{ title: string; slug: string }[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listCategories()
      .then((r) => setCategories(r.categories))
      .catch(() => {});
  }, []);

  // Debounced suggestions, so typing does not fire a request per keystroke.
  useEffect(() => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(() => {
      getSuggestions(q)
        .then((r) => setSuggestions(r.suggestions))
        .catch(() => setSuggestions([]));
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setShowSuggest(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setShowSuggest(false);
    const sp = new URLSearchParams();
    if (q.trim()) sp.set('q', q.trim());
    if (dept !== 'All Departments') {
      const cat = categories.find((c) => c.name === dept);
      if (cat) sp.set('category', cat.slug);
    }
    router.push(`/s?${sp}`);
  }

  const name = session?.user?.name?.split(' ')[0];

  return (
    <header className="sticky top-0 z-50">
      {/* --- main bar --- */}
      <div className="flex items-center gap-1 bg-[var(--color-nav)] px-2 py-1.5 text-white">
        <Link href="/" className="nav-item shrink-0" aria-label="Amazon home">
          <AmazonLogo />
        </Link>

        <Link href="/" className="nav-item hidden shrink-0 lg:flex">
          <span className="flex items-end gap-0.5">
            <MapPin size={16} className="mb-0.5" />
            <span className="leading-tight">
              <span className="block text-[11px] text-gray-300">Deliver to</span>
              <span className="block text-[13px] font-bold">Seattle 98109</span>
            </span>
          </span>
        </Link>

        {/* --- search --- */}
        <div ref={boxRef} className="relative flex-1">
          <form onSubmit={submit} className="flex h-10 overflow-hidden rounded-[4px]">
            <select
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              aria-label="Search department"
              className="hidden shrink-0 cursor-pointer border-r border-[#cdcdcd] bg-[#e6e6e6] px-2 text-[12px] text-[#0f1111] outline-none hover:bg-[#dadada] sm:block"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>

            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setShowSuggest(true);
              }}
              onFocus={() => setShowSuggest(true)}
              placeholder="Search Amazon"
              aria-label="Search Amazon"
              className="min-w-0 flex-1 px-3 text-[15px] text-black outline-none"
            />

            <button
              type="submit"
              aria-label="Go"
              className="flex w-11 shrink-0 items-center justify-center bg-[#febd69] text-[#131921] hover:bg-[#f3a847]"
            >
              <Search size={22} />
            </button>
          </form>

          {showSuggest && suggestions.length > 0 && (
            <ul className="absolute inset-x-0 top-full z-50 border border-[#d5d9d9] bg-white text-[14px] text-black shadow-lg">
              {suggestions.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/product/${s.slug}`}
                    onClick={() => setShowSuggest(false)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-[#f7fafa]"
                  >
                    <Search size={14} className="shrink-0 text-gray-500" />
                    <span className="line-clamp-1">{s.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* --- account --- */}
        <div className="group relative hidden shrink-0 md:block">
          <button className="nav-item text-left">
            <span className="text-[11px] leading-tight">
              Hello, {name ?? 'sign in'}
            </span>
            <span className="flex items-center text-[13px] font-bold leading-tight">
              Account &amp; Lists <ChevronDown size={12} className="ml-0.5" />
            </span>
          </button>

          <div className="invisible absolute right-0 top-full w-56 border border-[#d5d9d9] bg-white p-3 text-[13px] text-black opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
            {session ? (
              <>
                <p className="mb-2 border-b pb-2 font-bold">
                  Hello, {session.user?.name}
                </p>
                <Link href="/orders" className="block py-1 link-amazon">
                  Your Orders
                </Link>
                <Link href="/wishlist" className="block py-1 link-amazon">
                  Your Lists
                </Link>
                <Link href="/returns" className="block py-1 link-amazon">
                  Your Returns
                </Link>
                <Link href="/prime" className="block py-1 link-amazon">
                  Your Prime Membership
                </Link>
                <Link href="/cart" className="block py-1 link-amazon">
                  Your Cart
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="mt-2 w-full border-t pt-2 text-left link-amazon"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/signin" className="btn-amazon mb-2 w-full">
                  Sign in
                </Link>
                <p className="text-center text-[12px]">
                  New customer?{' '}
                  <Link href="/signin?mode=register" className="link-amazon">
                    Start here.
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>

        <Link href="/orders" className="nav-item hidden shrink-0 lg:flex">
          <span className="text-[11px] leading-tight">Returns</span>
          <span className="text-[13px] font-bold leading-tight">&amp; Orders</span>
        </Link>

        <Link
          href="/cart"
          className="nav-item shrink-0 flex-row items-end"
          aria-label={`Cart, ${cart.count} items`}
        >
          {/* The count sits over the cart's basket. Centring on a fixed anchor
              keeps double-digit counts from drifting off the icon. */}
          <span className="relative block">
            <ShoppingCart size={30} strokeWidth={1.75} />
            <span className="absolute left-1/2 top-[-2px] min-w-[14px] -translate-x-1/2 text-center text-[14px] font-bold leading-none text-[var(--color-amazon-orange)]">
              {cart.count}
            </span>
          </span>
          <span className="ml-0.5 hidden text-[13px] font-bold sm:inline">Cart</span>
        </Link>
      </div>

      {/* --- sub nav --- */}
      <nav className="flex items-center gap-1 overflow-x-auto bg-[var(--color-nav-light)] px-2 py-1 text-[13px] text-white no-scrollbar">
        <button
          onClick={() => setMenuOpen(true)}
          className="nav-item flex-row items-center gap-1 whitespace-nowrap font-bold"
        >
          <Menu size={18} /> All
        </button>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/s?category=${c.slug}`}
            className="nav-item whitespace-nowrap"
          >
            {c.name}
          </Link>
        ))}
      </nav>

      {/* --- slide-out "All" menu --- */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="h-full w-[85vw] max-w-sm overflow-y-auto bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[var(--color-nav-light)] px-6 py-3 text-[18px] font-bold text-white">
              Hello, {name ?? 'sign in'}
            </div>
            <div className="p-4">
              <h3 className="mb-2 text-[16px] font-bold">Shop by Department</h3>
              <ul>
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/s?category=${c.slug}`}
                      onClick={() => setMenuOpen(false)}
                      className="block border-b border-gray-100 py-2.5 text-[14px] hover:bg-[#f7fafa]"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function AmazonLogo() {
  return (
    <span className="flex items-end px-1 pt-1.5">
      <span className="text-[21px] font-bold leading-none tracking-tight">
        amazon
      </span>
      <svg width="18" height="10" viewBox="0 0 40 20" className="-ml-4 mb-0.5">
        <path
          d="M2 12 Q20 22 38 10"
          stroke="#FF9900"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path d="M36 6 L39 10 L34 12 Z" fill="#FF9900" />
      </svg>
    </span>
  );
}
