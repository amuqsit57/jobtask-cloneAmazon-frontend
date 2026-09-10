'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Heart } from 'lucide-react';
import { addToWishlist, getWishlist, removeFromWishlist } from '@/lib/api';

export function WishlistButton({ productId }: { productId: number }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!session?.apiToken) return;
    getWishlist(session.apiToken)
      .then((r) => setSaved(r.wishlist.items.some((i) => i.id === productId)))
      .catch(() => {});
  }, [session, productId]);

  async function toggle() {
    if (!session?.apiToken) {
      router.push('/signin?callbackUrl=' + encodeURIComponent(location.pathname));
      return;
    }
    setBusy(true);
    // Flip immediately - the button should feel instant, and a failure just
    // reverts it rather than leaving the user waiting on a round trip.
    const next = !saved;
    setSaved(next);
    try {
      if (next) await addToWishlist(productId, session.apiToken);
      else await removeFromWishlist(productId, session.apiToken);
    } catch {
      setSaved(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className="btn-secondary w-full"
      aria-pressed={saved}
    >
      <Heart
        size={15}
        className="mr-1.5"
        fill={saved ? '#B12704' : 'none'}
        color={saved ? '#B12704' : 'currentColor'}
      />
      {saved ? 'In your list' : 'Add to List'}
    </button>
  );
}
