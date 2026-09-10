'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Check } from 'lucide-react';
import { getPrime, setPrime } from '@/lib/api';
import type { PrimeStatus } from '@/lib/types';

export default function PrimePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [prime, setState] = useState<PrimeStatus | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/signin?callbackUrl=/prime');
  }, [status, router]);

  useEffect(() => {
    if (!session?.apiToken) return;
    getPrime(session.apiToken).then(setState).catch(() => {});
  }, [session]);

  async function toggle() {
    if (!session?.apiToken || !prime) return;
    setBusy(true);
    try {
      const { isPrime } = await setPrime(!prime.isPrime, session.apiToken);
      setState({ ...prime, isPrime });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (status === 'loading' || !prime) {
    return <div className="mx-auto max-w-4xl p-10 text-center">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6">
      <div className="rounded-lg bg-gradient-to-b from-[#232F3E] to-[#37475A] p-8 text-center text-white">
        <p className="mb-1 text-[32px] font-bold italic text-[#00A8E1]">prime</p>
        <h1 className="mb-2 text-[28px] font-bold">
          {prime.isPrime ? 'You are a Prime member' : 'Try Prime'}
        </h1>
        <p className="mb-5 text-[15px] text-white/85">
          {prime.isPrime
            ? 'Enjoy fast, free delivery and everything else Prime includes.'
            : `Fast, free delivery and more for ${prime.priceFormatted}/month.`}
        </p>
        <button onClick={toggle} disabled={busy} className="btn-amazon">
          {busy
            ? 'Please wait…'
            : prime.isPrime
              ? 'Cancel membership'
              : 'Start your membership'}
        </button>
      </div>

      <div className="mt-6 bg-white p-6">
        <h2 className="mb-4 text-[21px] font-bold">What is included</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {prime.benefits.map((b) => (
            <li key={b} className="flex gap-2 text-[14px]">
              <Check size={18} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {prime.isPrime && prime.since && (
          <p className="mt-5 border-t border-gray-200 pt-4 text-[13px] text-[var(--color-text-secondary)]">
            Member since {new Date(prime.since).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        )}
      </div>
    </div>
  );
}
