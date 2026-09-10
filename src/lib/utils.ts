import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "Wednesday, 12 March" - the format Amazon uses for delivery promises. */
export function formatDeliveryDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatOrderDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Amazon always shows a concrete delivery date rather than "3-5 days".
 * Free shipping lands further out than the paid/Prime option.
 */
export function deliveryEstimate(fast = true) {
  const d = new Date();
  d.setDate(d.getDate() + (fast ? 2 : 6));
  return d;
}

export const formatPrice = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    cents / 100
  );
