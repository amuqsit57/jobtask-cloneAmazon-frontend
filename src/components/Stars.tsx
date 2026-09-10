import { cn } from '@/lib/utils';

/**
 * Amazon's star rating: solid orange stars with partial fill for fractional
 * ratings, done by clipping a filled row over an empty one so half-stars are
 * exact rather than rounded to the nearest half.
 */
export function Stars({
  rating,
  size = 14,
  className,
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));

  return (
    <span
      className={cn('relative inline-block leading-none align-middle', className)}
      style={{ width: size * 5, height: size }}
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
      role="img"
    >
      <span className="absolute inset-0 flex">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={size} filled={false} />
        ))}
      </span>
      <span
        className="absolute inset-0 flex overflow-hidden"
        style={{ width: `${pct}%` }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={size} filled />
        ))}
      </span>
    </span>
  );
}

function Star({ size, filled }: { size: number; filled: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="shrink-0"
      fill={filled ? '#FFA41C' : '#E3E6E6'}
      aria-hidden="true"
    >
      <path d="M12 .587l3.668 7.431 8.332 1.151-6.064 5.828 1.48 8.279L12 19.771l-7.416 3.505 1.48-8.279L0 9.169l8.332-1.151z" />
    </svg>
  );
}
