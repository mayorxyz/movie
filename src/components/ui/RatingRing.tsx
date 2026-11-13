import { useEffect, useId, useState } from 'react';

interface RatingRingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showPercent?: boolean;
}

const config = {
  sm: { star: 18, text: 'text-[12px]', gap: 'gap-1' },
  md: { star: 24, text: 'text-[14px]', gap: 'gap-1.5' },
  lg: { star: 34, text: 'text-[18px]', gap: 'gap-2' },
};

const STAR = 'M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96L12 2.5z';

export function RatingRing({ rating, size = 'md', showPercent = false }: RatingRingProps) {
  const safe = Number.isFinite(rating) ? rating : 0;
  const percentage = Math.min(100, Math.max(0, (safe / 10) * 100));
  const unrated = safe <= 0;
  const { star, text, gap } = config[size];
  const clipId = `star-${useId().replace(/:/g, '')}`;

  // Gold fill grows from 0 to the rating on mount
  const [fill, setFill] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setFill(percentage));
    return () => cancelAnimationFrame(id);
  }, [percentage]);

  const label = unrated ? 'Not rated' : `Rating: ${safe.toFixed(1)} out of 10`;
  const value = unrated ? 'NR' : showPercent ? `${Math.round(percentage)}%` : safe.toFixed(1);

  return (
    <div className={`inline-flex items-center ${gap}`} role="img" aria-label={label}>
      <svg width={star} height={star} viewBox="0 0 24 24" aria-hidden="true">
        <defs>
          <clipPath id={clipId}>
            <rect
              x="0"
              y="0"
              height="24"
              style={{ width: `${(24 * fill) / 100}px`, transition: 'width 700ms ease-out' }}
            />
          </clipPath>
        </defs>
        <path d={STAR} fill="var(--color-border)" strokeLinejoin="round" />
        {!unrated && (
          <path
            d={STAR}
            fill="var(--color-rating)"
            stroke="var(--color-rating)"
            strokeWidth="1"
            strokeLinejoin="round"
            clipPath={`url(#${clipId})`}
          />
        )}
      </svg>
      <span
        className={`font-semibold tabular-nums ${text} ${
          unrated ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'
        }`}
      >
        {value}
      </span>
    </div>
  );
}