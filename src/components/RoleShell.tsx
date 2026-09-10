'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Shared chrome for the seller and admin areas.
 *
 * Amazon runs Seller Central on its own domain with its own navigation, so these
 * areas deliberately drop the storefront's orange styling for a darker, denser
 * console look - it should feel like a different tool, not a shop page.
 *
 * Access is enforced by the API on every request; this guard only decides what to
 * render, so a tampered client cannot reach data it is not entitled to.
 */
export function RoleShell({
  role,
  title,
  nav,
  children,
}: {
  role: 'seller' | 'admin';
  title: string;
  nav: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const userRole = session?.user?.role;
  const allowed = userRole === role || userRole === 'admin';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/signin?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  if (status === 'loading') {
    return <div className="p-10 text-center text-white">Loading…</div>;
  }

  if (!allowed) {
    return (
      <div className="mx-auto max-w-lg p-10 text-center">
        <div className="rounded-lg bg-white p-8">
          <h1 className="mb-2 text-[21px] font-bold">Not your area</h1>
          <p className="mb-4 text-[14px] text-[var(--color-text-secondary)]">
            This console is for {role} accounts. You are signed in as{' '}
            <span className="font-bold">{userRole ?? 'a guest'}</span>.
          </p>
          <Link href="/" className="btn-amazon">
            Back to the store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      <div className="bg-[#232F3E] text-white">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-4 px-4 py-3">
          <Link href="/" className="text-[19px] font-bold tracking-tight">
            amazon
          </Link>
          <span className="rounded bg-[#febd69] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#131921]">
            {role === 'seller' ? 'Seller Central' : 'Admin Console'}
          </span>
          <span className="text-[13px] text-white/70">
            {session?.user?.storeName ?? session?.user?.name}
          </span>
          <Link href="/" className="ml-auto text-[13px] text-white/80 hover:underline">
            ← Back to store
          </Link>
        </div>

        <nav className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-4 no-scrollbar">
          {nav.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`whitespace-nowrap border-b-[3px] px-3 py-2 text-[14px] ${
                  active
                    ? 'border-[#febd69] font-bold'
                    : 'border-transparent text-white/80 hover:border-white/40'
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <main className="mx-auto max-w-[1400px] px-4 py-6">
        <h1 className="mb-4 text-[24px] font-bold">{title}</h1>
        {children}
      </main>
    </div>
  );
}

export const SELLER_NAV = [
  { href: '/seller', label: 'Dashboard' },
  { href: '/seller/products', label: 'Products' },
  { href: '/seller/products/new', label: 'Add a product' },
  { href: '/seller/orders', label: 'Orders' },
  { href: '/seller/inventory', label: 'Inventory' },
];

export const ADMIN_NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/moderation', label: 'Moderation' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/audit', label: 'Audit log' },
];

/** A small stat tile, used across both consoles. */
export function Stat({
  label,
  value,
  sub,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: 'default' | 'warn' | 'good';
}) {
  const toneClass =
    tone === 'warn'
      ? 'text-[#b12704]'
      : tone === 'good'
        ? 'text-[#067d62]'
        : 'text-[#0f1111]';
  return (
    <div className="rounded-lg border border-[#d5d9d9] bg-white p-4">
      <p className="text-[12px] uppercase tracking-wide text-[var(--color-text-secondary)]">
        {label}
      </p>
      <p className={`text-[26px] font-bold leading-tight ${toneClass}`}>{value}</p>
      {sub && (
        <p className="text-[12px] text-[var(--color-text-secondary)]">{sub}</p>
      )}
    </div>
  );
}

/**
 * A dependency-free sales chart. A charting library would be more capable but
 * this is 30 bars - the whole point is showing the trend at a glance.
 */
export function SalesChart({
  data,
  label = 'Revenue, last 30 days',
}: {
  data: { day: string; revenue: number }[];
  label?: string;
}) {
  const max = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="rounded-lg border border-[#d5d9d9] bg-white p-4">
      <p className="mb-3 text-[14px] font-bold">{label}</p>
      <div className="flex h-40 items-end gap-[3px]">
        {data.map((d) => (
          <div
            key={d.day}
            className="group relative flex-1 rounded-t bg-[#232F3E]/80 transition hover:bg-[#febd69]"
            style={{ height: `${Math.max((d.revenue / max) * 100, 1.5)}%` }}
          >
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[#0f1111] px-2 py-1 text-[11px] text-white group-hover:block">
              {d.day}: ${(d.revenue / 100).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-[var(--color-text-secondary)]">
        <span>{data[0]?.day}</span>
        <span>{data[data.length - 1]?.day}</span>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, string> = {
    active: 'bg-[#067d62] text-white',
    pending: 'bg-[#f0ad4e] text-[#0f1111]',
    rejected: 'bg-[#b12704] text-white',
    archived: 'bg-gray-400 text-white',
    unshipped: 'bg-[#f0ad4e] text-[#0f1111]',
    shipped: 'bg-[#007185] text-white',
    delivered: 'bg-[#067d62] text-white',
    cancelled: 'bg-gray-400 text-white',
  };
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold uppercase ${
        map[status ?? ''] ?? 'bg-gray-200'
      }`}
    >
      {status}
    </span>
  );
}
