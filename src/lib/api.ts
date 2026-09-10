import type {
  Cart,
  Category,
  Coupon,
  Order,
  Pagination,
  PrimeStatus,
  Product,
  Address,
  Question,
  Review,
  ReturnRequest,
  Wishlist,
  SellerStats,
  SellerOrderLine,
  AdminStats,
  AdminUser,
  AdminAction,
  AdminOrder,
} from './types';

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

/**
 * The guest cart is keyed by an id kept in localStorage, so a visitor can fill a
 * cart before they have an account. On sign-in this id is handed to /cart/merge
 * and the guest cart is folded into the user's own.
 */
const SESSION_KEY = 'amzn_cart_session';

export function getCartSession(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `guest-${crypto.randomUUID()}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type FetchOpts = RequestInit & { token?: string | null };

async function request<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const { token, headers, ...rest } = opts;

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(typeof window !== 'undefined'
        ? { 'x-cart-session': getCartSession() }
        : {}),
      ...headers,
    },
    cache: rest.cache ?? 'no-store',
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body?.error || `Request failed (${res.status})`, res.status);
  }
  return body as T;
}

// ---- catalog --------------------------------------------------------------

export interface ProductQuery {
  q?: string;
  category?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  minRating?: string | number;
  prime?: boolean;
  sort?: string;
  page?: string | number;
  limit?: string | number;
}

export function listProducts(params: ProductQuery = {}) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  }
  return request<{ products: Product[]; pagination: Pagination }>(
    `/products?${qs}`
  );
}

export const getProduct = (slug: string) =>
  request<{ product: Product }>(`/products/${slug}`);

export const getFeatured = () =>
  request<{ bestSellers: Product[]; deals: Product[]; topRated: Product[] }>(
    '/products/featured'
  );

export const getSuggestions = (q: string) =>
  request<{ suggestions: { title: string; slug: string }[] }>(
    `/products/suggest?q=${encodeURIComponent(q)}`
  );

export const listCategories = () =>
  request<{ categories: Category[] }>('/categories');

// ---- auth -----------------------------------------------------------------

export const register = (email: string, password: string, name?: string) =>
  request<{ token: string; user: { id: number; email: string; name: string } }>(
    '/auth/register',
    { method: 'POST', body: JSON.stringify({ email, password, name }) }
  );

export const login = (email: string, password: string) =>
  request<{ token: string; user: { id: number; email: string; name: string } }>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ email, password }) }
  );

// ---- cart -----------------------------------------------------------------

export const getCart = (token?: string | null) =>
  request<Cart>('/cart', { token });

export const addToCart = (
  productId: number,
  quantity = 1,
  token?: string | null
) =>
  request<Cart>('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
    token,
  });

export const updateCartItem = (
  id: number,
  patch: { quantity?: number; savedForLater?: boolean },
  token?: string | null
) =>
  request<Cart>(`/cart/items/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
    token,
  });

export const removeCartItem = (id: number, token?: string | null) =>
  request<Cart>(`/cart/items/${id}`, { method: 'DELETE', token });

export const mergeCart = (sessionId: string, token: string) =>
  request<Cart>('/cart/merge', {
    method: 'POST',
    body: JSON.stringify({ sessionId }),
    token,
  });

// ---- orders & addresses ---------------------------------------------------

export const listOrders = (token: string) =>
  request<{ orders: Order[] }>('/orders', { token });

export const getOrder = (orderNumber: string, token: string) =>
  request<{ order: Order }>(`/orders/${orderNumber}`, { token });

export const placeOrder = (
  payload: {
    shipTo: Address;
    paymentLast4?: string;
    couponCode?: string;
    isGift?: boolean;
    giftMessage?: string;
    shippingSpeed?: string;
  },
  token: string
) =>
  request<{ order: Order }>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });

export const listAddresses = (token: string) =>
  request<{ addresses: Address[] }>('/addresses', { token });

export const createAddress = (address: Address, token: string) =>
  request<{ address: Address }>('/addresses', {
    method: 'POST',
    body: JSON.stringify(address),
    token,
  });

// ---- wishlist -------------------------------------------------------------

export const getWishlist = (token: string) =>
  request<{ wishlist: Wishlist }>('/wishlist', { token });

export const addToWishlist = (productId: number, token: string) =>
  request<{ items: Product[] }>('/wishlist/items', {
    method: 'POST',
    body: JSON.stringify({ productId }),
    token,
  });

export const removeFromWishlist = (productId: number, token: string) =>
  request<{ items: Product[] }>(`/wishlist/items/${productId}`, {
    method: 'DELETE',
    token,
  });

export const updateWishlist = (
  patch: { name?: string; isPublic?: boolean },
  token: string
) =>
  request<{ wishlist: Wishlist }>('/wishlist', {
    method: 'PATCH',
    body: JSON.stringify(patch),
    token,
  });

export const getSharedWishlist = (slug: string) =>
  request<{ wishlist: Wishlist }>(`/wishlist/shared/${slug}`);

// ---- questions & answers --------------------------------------------------

export const getQuestions = (productId: number) =>
  request<{ questions: Question[] }>(`/questions/product/${productId}`);

export const askQuestion = (productId: number, body: string, token: string) =>
  request<{ question: Question }>(`/questions/product/${productId}`, {
    method: 'POST',
    body: JSON.stringify({ body }),
    token,
  });

export const answerQuestion = (questionId: number, body: string, token: string) =>
  request<{ answer: { id: number } }>(`/questions/${questionId}/answers`, {
    method: 'POST',
    body: JSON.stringify({ body }),
    token,
  });

// ---- reviews --------------------------------------------------------------

export const writeReview = (
  productId: number,
  payload: { rating: number; title?: string; body?: string },
  token: string
) =>
  request<{ review: Review }>(`/reviews/product/${productId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });

export const markHelpful = (reviewId: number, token: string) =>
  request<{ helpful: number }>(`/reviews/${reviewId}/helpful`, {
    method: 'POST',
    token,
  });

// ---- coupons, prime, returns ----------------------------------------------

export const validateCoupon = (code: string, subtotal: number) =>
  request<{ coupon: Coupon }>('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, subtotal }),
  });

export const getPrime = (token: string) =>
  request<PrimeStatus>('/prime', { token });

export const setPrime = (join: boolean, token: string) =>
  request<{ isPrime: boolean }>('/prime', {
    method: 'POST',
    body: JSON.stringify({ join }),
    token,
  });

export const getReturnReasons = () =>
  request<{ reasons: string[] }>('/returns/reasons');

export const listReturns = (token: string) =>
  request<{ returns: ReturnRequest[] }>('/returns', { token });

export const requestReturn = (
  payload: { orderItemId: number; reason: string; comments?: string },
  token: string
) =>
  request<{ return: ReturnRequest }>('/returns', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });

// ---- seller ---------------------------------------------------------------

export const getSellerStats = (token: string) =>
  request<SellerStats>('/seller/stats', { token });

export const getSellerProducts = (token: string) =>
  request<{ products: Product[] }>('/seller/products', { token });

export const createSellerProduct = (
  payload: {
    title: string; brand?: string; description?: string; bullets?: string[];
    categoryId?: number | null; price: number; listPrice?: number | null;
    stock: number; images?: string[];
  },
  token: string
) =>
  request<{ product: Product; message: string }>('/seller/products', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });

export const updateSellerProduct = (
  id: number,
  patch: Record<string, unknown>,
  token: string
) =>
  request<{ product: Product }>(`/seller/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
    token,
  });

export const archiveSellerProduct = (id: number, token: string) =>
  request<{ archived: boolean }>(`/seller/products/${id}`, {
    method: 'DELETE',
    token,
  });

export const getSellerOrders = (token: string) =>
  request<{ orders: SellerOrderLine[] }>('/seller/orders', { token });

export const shipSellerOrder = (
  itemId: number,
  trackingNumber: string | undefined,
  token: string
) =>
  request<{ item: { id: number; fulfillmentStatus: string; trackingNumber: string } }>(
    `/seller/orders/${itemId}/ship`,
    { method: 'POST', body: JSON.stringify({ trackingNumber }), token }
  );

export const updateSellerStock = (id: number, stock: number, token: string) =>
  request<{ id: number; stock: number }>(`/seller/inventory/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ stock }),
    token,
  });

// ---- admin ----------------------------------------------------------------

export const getAdminStats = (token: string) =>
  request<AdminStats>('/admin/stats', { token });

export const getAdminProducts = (token: string, status?: string) =>
  request<{ products: Product[] }>(
    `/admin/products${status ? `?status=${status}` : ''}`,
    { token }
  );

export const moderateProduct = (
  id: number,
  decision: 'approve' | 'reject' | 'archive',
  reason: string | undefined,
  token: string
) =>
  request<{ product: Product }>(`/admin/products/${id}/moderate`, {
    method: 'POST',
    body: JSON.stringify({ decision, reason }),
    token,
  });

export const getAdminUsers = (token: string, role?: string) =>
  request<{ users: AdminUser[] }>(`/admin/users${role ? `?role=${role}` : ''}`, {
    token,
  });

export const setUserRole = (
  id: number,
  role: string,
  storeName: string | undefined,
  token: string
) =>
  request<{ user: AdminUser }>(`/admin/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role, storeName }),
    token,
  });

export const getAdminOrders = (token: string) =>
  request<{ orders: AdminOrder[] }>('/admin/orders', { token });

export const getAdminActions = (token: string) =>
  request<{ actions: AdminAction[] }>('/admin/actions', { token });
