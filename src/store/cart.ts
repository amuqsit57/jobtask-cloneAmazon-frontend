'use client';

import { create } from 'zustand';
import * as api from '@/lib/api';
import type { Cart } from '@/lib/types';

const EMPTY: Cart = {
  items: [],
  savedForLater: [],
  count: 0,
  subtotal: 0,
  subtotalFormatted: '$0.00',
  freeShippingEligible: false,
  freeShippingRemaining: 3500,
  freeShippingRemainingFormatted: '$35.00',
};

interface CartState {
  cart: Cart;
  loading: boolean;
  /** Ids currently mid-request, so a row can show a spinner without freezing the page. */
  pending: Set<number>;
  token: string | null;

  setToken: (token: string | null) => void;
  refresh: () => Promise<void>;
  add: (productId: number, quantity?: number) => Promise<void>;
  update: (id: number, patch: { quantity?: number; savedForLater?: boolean }) => Promise<void>;
  remove: (id: number) => Promise<void>;
  merge: (sessionId: string, token: string) => Promise<void>;
}

export const useCart = create<CartState>((set, get) => ({
  cart: EMPTY,
  loading: true,
  pending: new Set(),
  token: null,

  setToken: (token) => set({ token }),

  refresh: async () => {
    try {
      const cart = await api.getCart(get().token);
      set({ cart, loading: false });
    } catch {
      // A failed cart read should leave the header badge alone rather than
      // blanking a cart the user can still see.
      set({ loading: false });
    }
  },

  add: async (productId, quantity = 1) => {
    const cart = await api.addToCart(productId, quantity, get().token);
    set({ cart });
  },

  update: async (id, patch) => {
    const pending = new Set(get().pending).add(id);
    set({ pending });
    try {
      const cart = await api.updateCartItem(id, patch, get().token);
      set({ cart });
    } finally {
      const next = new Set(get().pending);
      next.delete(id);
      set({ pending: next });
    }
  },

  remove: async (id) => {
    const pending = new Set(get().pending).add(id);
    set({ pending });
    try {
      const cart = await api.removeCartItem(id, get().token);
      set({ cart });
    } finally {
      const next = new Set(get().pending);
      next.delete(id);
      set({ pending: next });
    }
  },

  merge: async (sessionId, token) => {
    try {
      const cart = await api.mergeCart(sessionId, token);
      set({ cart, token });
    } catch {
      // If the merge fails the user still has their account cart; just reload it.
      set({ token });
      await get().refresh();
    }
  },
}));
