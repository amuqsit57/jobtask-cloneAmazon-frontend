export function PrimeBadge({ label = 'prime' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-[12px]">
      <span className="font-bold italic text-[#00A8E1]">{label}</span>
      <svg width="14" height="7" viewBox="0 0 40 20" aria-hidden="true">
        <path
          d="M2 12 Q20 22 38 10"
          stroke="#00A8E1"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
