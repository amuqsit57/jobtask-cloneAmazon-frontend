'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { AlertCircle } from 'lucide-react';

function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState(
    params.get('mode') === 'register' ? 'register' : 'login'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const callbackUrl = params.get('callbackUrl') ?? '/';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const res = await signIn('credentials', {
      email,
      password,
      name,
      mode,
      redirect: false,
    });

    setBusy(false);

    if (res?.error) {
      // NextAuth wraps thrown provider errors; surface something readable.
      setError(
        mode === 'register'
          ? 'Could not create that account. The email may already be registered.'
          : 'Email or password is incorrect. Please try again.'
      );
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[350px] px-4 py-6">
      <Link href="/" className="mb-4 flex justify-center">
        <span className="flex items-end">
          <span className="text-[30px] font-bold leading-none tracking-tight text-[#131921]">
            amazon
          </span>
          <svg width="26" height="14" viewBox="0 0 40 20" className="-ml-6 mb-1">
            <path
              d="M2 12 Q20 22 38 10"
              stroke="#FF9900"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </Link>

      <div className="rounded-lg border border-[#d5d9d9] bg-white p-5">
        <h1 className="mb-3 text-[28px] font-normal">
          {mode === 'register' ? 'Create account' : 'Sign in'}
        </h1>

        {error && (
          <div className="mb-3 flex gap-2 rounded border border-[#c40000] bg-[#fff5f5] p-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-[#c40000]" />
            <div>
              <p className="text-[13px] font-bold text-[#c40000]">
                There was a problem
              </p>
              <p className="text-[13px]">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={submit}>
          {mode === 'register' && (
            <label className="mb-3 block">
              <span className="mb-1 block text-[13px] font-bold">Your name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First and last name"
                className="input-amazon"
                autoComplete="name"
              />
            </label>
          )}

          <label className="mb-3 block">
            <span className="mb-1 block text-[13px] font-bold">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-amazon"
              autoComplete="email"
            />
          </label>

          <label className="mb-4 block">
            <span className="mb-1 block text-[13px] font-bold">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'At least 6 characters' : ''}
              className="input-amazon"
              autoComplete={
                mode === 'register' ? 'new-password' : 'current-password'
              }
            />
          </label>

          <button type="submit" disabled={busy} className="btn-amazon w-full">
            {busy
              ? 'Please wait...'
              : mode === 'register'
                ? 'Create your Amazon account'
                : 'Continue'}
          </button>
        </form>

        <p className="mt-4 text-[12px] leading-4">
          By continuing, you agree to the Conditions of Use and Privacy Notice of
          this rebuild. This is a portfolio project, not the real Amazon.
        </p>
      </div>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-gray-300" />
        <span className="text-[12px] text-[var(--color-text-secondary)]">
          {mode === 'register' ? 'Already a customer?' : 'New to Amazon?'}
        </span>
        <span className="h-px flex-1 bg-gray-300" />
      </div>

      <button
        onClick={() => {
          setMode(mode === 'register' ? 'login' : 'register');
          setError(null);
        }}
        className="btn-secondary w-full"
      >
        {mode === 'register'
          ? 'Sign in to your account'
          : 'Create your Amazon account'}
      </button>

      {mode === 'login' && (
        <div className="mt-5 rounded border border-dashed border-gray-300 bg-white p-3 text-[12px]">
          <p className="mb-1 font-bold">Demo account</p>
          <p>
            Email: <code>demo@example.com</code>
          </p>
          <p>
            Password: <code>Password123!</code>
          </p>
          <button
            onClick={() => {
              setEmail('demo@example.com');
              setPassword('Password123!');
            }}
            className="mt-2 link-amazon"
          >
            Fill these in
          </button>
        </div>
      )}
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="bg-white">
      <Suspense fallback={<div className="h-96" />}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
