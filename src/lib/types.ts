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
  questions?: Question[];
  wishlistItemId?: number;
  status?: 'active' | 'pending' | 'rejected' | 'archived';
  rejectionReason?: string | null;
  unitsSold?: number;
  sellerId?: number | null;
  storeName?: string | null;
  storeSlug?: string | null;
  sellerEmail?: string | null;
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
  discount: number;
  discountFormatted: string;
  couponCode: string | null;
  isGift: boolean;
  giftMessage: string | null;
  shippingSpeed: string;
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

export interface Question {
  id: number;
  author: string;
  body: string;
  votes: number;
  createdAt: string;
  answers: { id: number; author: string; body: string; votes: number }[];
}

export interface Wishlist {
  id?: number;
  name: string;
  isPublic: boolean;
  shareSlug?: string;
  ownerName?: string;
  items: Product[];
}

export interface Coupon {
  code: string;
  description: string;
  discount: number;
  discountFormatted: string;
}

export interface ReturnRequest {
  id: number;
  orderNumber: string;
  title: string;
  image: string | null;
  reason: string;
  comments: string | null;
  status: string;
  refund: number;
  refundFormatted: string;
  createdAt: string;
}

export interface PrimeStatus {
  isPrime: boolean;
  since: string | null;
  priceFormatted: string;
  benefits: string[];
}

export type Role = 'customer' | 'seller' | 'admin';

export interface SellerStats {
  revenue: number;
  revenueFormatted: string;
  revenue30d: number;
  revenue30dFormatted: string;
  unitsSold: number;
  orderCount: number;
  pendingShipments: number;
  productsByStatus: { active: number; pending: number; rejected: number; archived: number };
  lowStock: { id: number; slug: string; title: string; stock: number }[];
  salesByDay: { day: string; revenue: number }[];
  topProducts: {
    id: number; slug: string; title: string; stock: number; image: string | null;
    units: number; revenue: number; revenueFormatted: string;
  }[];
}

export interface SellerOrderLine {
  id: number;
  orderNumber: string;
  placedAt: string;
  buyerName: string | null;
  shipTo: Address;
  productId: number | null;
  slug: string | null;
  title: string;
  image: string | null;
  quantity: number;
  unitPrice: number;
  unitPriceFormatted: string;
  lineTotal: number;
  lineTotalFormatted: string;
  fulfillmentStatus: 'unshipped' | 'shipped' | 'delivered' | 'cancelled';
  shippedAt: string | null;
  trackingNumber: string | null;
}

export interface AdminStats {
  gmv: number;
  gmvFormatted: string;
  orderCount: number;
  users: { customers: number; sellers: number; admins: number };
  products: { active: number; pending: number; rejected: number; archived: number };
  revenueByDay: { day: string; revenue: number }[];
  sellers: {
    id: number; storeName: string | null; email: string;
    products: number; revenue: number; revenueFormatted: string;
  }[];
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: Role;
  storeName: string | null;
  isPrime: boolean;
  createdAt: string;
  orderCount: number;
  lifetimeSpend: number;
  lifetimeSpendFormatted: string;
}

export interface AdminAction {
  id: number;
  adminName: string | null;
  action: string;
  targetType: string;
  targetId: number | null;
  note: string | null;
  createdAt: string;
}

export interface AdminOrder {
  id: number;
  orderNumber: string;
  buyerEmail: string | null;
  buyerName: string | null;
  placedAt: string;
  status: string;
  lineCount: number;
  total: number;
  totalFormatted: string;
}
