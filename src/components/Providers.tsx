'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { useCart } from '@/store/cart';
import { getCartSession } from '@/lib/api';

/**
 * Keeps the cart store in sync with the session.
 *
 * On sign-in the guest cart is merged into the user's cart exactly once - the
 * ref guard matters because the session object identity changes on re-render and
 * would otherwise re-fire the merge.
 */
function CartSync() {
  const { data: session, status } = useSession();
  const refresh = useCart((s) => s.refresh);
  const merge = useCart((s) => s.merge);
  const setToken = useCart((s) => s.setToken);
  const mergedFor = useRef<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    const token = session?.apiToken ?? null;

    if (token && mergedFor.current !== token) {
      mergedFor.current = token;
      const guest = getCartSession();
      merge(guest, token);
      return;
    }

    if (!token) {
      mergedFor.current = null;
      setToken(null);
    }
    refresh();
  }, [session, status, refresh, merge, setToken]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartSync />
      {children}
    </SessionProvider>
  );
}
