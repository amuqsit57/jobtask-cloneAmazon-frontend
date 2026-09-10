export type PriceParts = { whole: string; frac: string };

export interface Product {
  id: number;
  slug: string;
  title: string;
  brand: string | null;
  description: string | null;
  bullets: string[];
  categoryId: number | null;
  categorySlug: string | null;
  categoryName: string | null;
  price: number;
  priceFormatted: string;
  priceParts: PriceParts;
  listPrice: number | null;
  listPriceFormatted: string | null;
  discountPercent: number | null;
  stock: number;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  isPrime: boolean;
  isBestSeller: boolean;
  freeReturns: boolean;
  image: string | null;
  images: string[];
  variants: Record<string, { value: string; priceDelta: number }[]>;
  reviews?: Review[];
  ratingDistribution?: Record<string, number>;
  related?: Product[];
}

export interface Review {
  id: number;
  author: string;
  rating: number;
  title: string | null;
  body: string | null;
  verified: boolean;
  helpful: number;
  createdAt: string;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  image: string | null;
  productCount: number;
}

export interface CartItem {
  id: number;
  productId: number;
  slug: string;
  title: string;
  brand: string | null;
  image: string | null;
  price: number;
  priceFormatted: string;
  quantity: number;
  stock: number;
  inStock: boolean;
  isPrime: boolean;
  lineTotal: number;
  lineTotalFormatted: string;
}

export interface Cart {
  items: CartItem[];
  savedForLater: CartItem[];
  count: number;
  subtotal: number;
  subtotalFormatted: string;
  freeShippingEligible: boolean;
  freeShippingRemaining: number;
  freeShippingRemainingFormatted: string;
}

export interface OrderItem {
  id: number;
  productId: number | null;
  slug: string | null;
  title: string;
  image: string | null;
  unitPrice: number;
  unitPriceFormatted: string;
  quantity: number;
  lineTotal: number;
  lineTotalFormatted: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: string;
  subtotal: number;
  subtotalFormatted: string;
  shipping: number;
  shippingFormatted: string;
  tax: number;
  taxFormatted: string;
  total: number;
  totalFormatted: string;
  shipTo: Address;
  paymentLast4: string | null;
  placedAt: string;
  deliveryEstimate: string | null;
  items: OrderItem[];
}

export interface Address {
  id?: number;
  full_name: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  phone?: string | null;
  is_default?: boolean;
}

export interface Pagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}
