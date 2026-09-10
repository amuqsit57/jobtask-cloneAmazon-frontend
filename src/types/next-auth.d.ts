import 'next-auth';

declare module 'next-auth' {
  interface Session {
    apiToken?: string;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: 'customer' | 'seller' | 'admin';
      storeName?: string | null;
    };
  }
  interface User {
    apiToken?: string;
    role?: 'customer' | 'seller' | 'admin';
    storeName?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    apiToken?: string;
    userId?: string;
    role?: 'customer' | 'seller' | 'admin';
    storeName?: string | null;
  }
}
