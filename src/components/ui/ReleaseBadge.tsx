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
      <span className={`px-3 py-1 text-xs font-medium rounded-full bg-[var(--color-accent)]/15 border border-[var(--color-accent)] text-[var(--color-accent)] ${className}`}>
        {label}
      </span>
    );
  }
  return null;
}
