import { today, getReleaseDate } from '../../lib/releaseFilters';

interface ReleaseBadgeProps {
  releaseDate?: string | null;
  firstAirDate?: string | null;
  mediaType?: 'movie' | 'tv';
  className?: string;
}

/** Direct-URL badge for unreleased titles: "Coming {date}" or "Release date unknown". */
export function ReleaseBadge({ releaseDate, firstAirDate, className = '' }: ReleaseBadgeProps) {
  const todayStr = today();
  const date = getReleaseDate({ id: 0, release_date: releaseDate ?? null, first_air_date: firstAirDate ?? null });
  if (!date || date.trim() === '' || date > todayStr) {
    const label = date && date.trim() !== '' ? `Coming ${date}` : 'Release date unknown';
    return (
      <span
        className={`inline-flex items-center h-7 px-3 rounded-full text-[12px] font-medium bg-[var(--color-accent)]/15 text-[var(--color-accent)] ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] mr-2" />
        {label}
      </span>
    );
  }
  return null;
}