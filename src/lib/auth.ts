import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { API_BASE } from './api';

/**
 * NextAuth owns the browser session; the Express API owns identity and data.
 *
 * Signing in posts the credentials to the API, which verifies them and returns a
 * JWT. That JWT is carried inside the NextAuth session so every subsequent API
 * call from the client is authenticated by the backend rather than by Next.js.
 * One source of truth for auth, two layers that each do what they are good at.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/signin',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        mode: { label: 'Mode', type: 'text' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        const name = credentials?.name as string | undefined;
        const mode = (credentials?.mode as string) || 'login';

        if (!email || !password) return null;

        const endpoint = mode === 'register' ? '/auth/register' : '/auth/login';

        const res = await fetch(`${API_BASE}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          // Surfaced to the sign-in page so the user sees the real reason
          // ("Email or password is incorrect") rather than a generic failure.
          throw new Error(body?.error || 'Sign in failed');
        }

        const data = await res.json();
        return {
          id: String(data.user.id),
          email: data.user.email,
          name: data.user.name,
          apiToken: data.token,
          role: data.user.role ?? 'customer',
          storeName: data.user.storeName ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as {
          apiToken?: string;
          role?: 'customer' | 'seller' | 'admin';
          storeName?: string | null;
        };
        token.apiToken = u.apiToken;
        token.userId = user.id;
        token.role = u.role ?? 'customer';
        token.storeName = u.storeName ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      session.apiToken = token.apiToken as string;
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role =
          (token.role as 'customer' | 'seller' | 'admin') ?? 'customer';
        session.user.storeName = (token.storeName as string | null) ?? null;
      }
      return session;
    },
  },
});
