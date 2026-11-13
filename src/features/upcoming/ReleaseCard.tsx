import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { UpcomingRelease } from './types';
import { formatDateDisplay, isDateInPast } from './utils';
import { site } from '../../config/site';

interface ReleaseCardProps {
  release: UpcomingRelease;
}

export function ReleaseCard({ release }: ReleaseCardProps) {
  const date = release.release_date || release.first_air_date;
  if (!date) return null;

  const isPast = isDateInPast(date);
  const detailPath = release.media_type === 'movie' ? `/movie/${release.id}` : `/tv/${release.id}`;

  return (
    <Link
      to={detailPath}
      className={`group flex gap-3 sm:gap-4 p-3 rounded-xl sm:rounded-2xl bg-[var(--color-surface)] shadow-sm hover:shadow-md hover:bg-[var(--color-surface-raised)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
        isPast ? 'opacity-60 grayscale-[0.5]' : ''
      }`}
    >
      {/* Poster */}
      <div className="flex-shrink-0 w-16 h-24 sm:w-20 sm:h-28 rounded-lg sm:rounded-xl overflow-hidden bg-[var(--color-surface-raised)]">
        {release.poster_path ? (
          <img
            src={release.poster_path}
            alt={release.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] sm:text-[12px] text-[var(--color-text-faint)]">
            No image
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 py-0.5">
        <h3 className="text-[13px] sm:text-[14px] font-semibold text-[var(--color-text)] truncate leading-tight">
          {release.title}
        </h3>

        <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 mt-1.5 text-[11px] sm:text-[12px] text-[var(--color-text-muted)]">
          <span>{formatDateDisplay(date, site.region.default)}</span>
          {release.vote_average > 0 && (
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[var(--color-rating)] text-[var(--color-rating)]" strokeWidth={0} />
              {release.vote_average.toFixed(1)}
            </span>
          )}
        </div>

        {release.overview && (
          <p className="text-[11px] sm:text-[12px] text-[var(--color-text-muted)] mt-2 line-clamp-2 leading-relaxed">
            {release.overview}
          </p>
        )}
      </div>
    </Link>
  );
}