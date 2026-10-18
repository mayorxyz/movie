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
  const detailPath = release.media_type === 'movie' 
    ? `/movie/${release.id}` 
    : `/tv/${release.id}`;

  return (
    <Link
      to={detailPath}
      className={`flex gap-4 p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-text-muted)] transition-colors group ${
        isPast ? 'opacity-60' : ''
      }`}
    >
      {/* Poster */}
      <div className="flex-shrink-0 w-20 h-28 rounded-lg overflow-hidden bg-[var(--color-surface-raised)]">
        {release.poster_path ? (
          <img
            src={release.poster_path}
            alt={release.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] text-xs">
            No Image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-[var(--color-text)] truncate group-hover:text-[var(--color-accent)] transition-colors">
          {release.title}
        </h3>
        
        <div className="flex items-center gap-2 mt-1 text-xs text-[var(--color-text-muted)]">
          <span>{formatDateDisplay(date, site.region.default)}</span>
          {release.vote_average > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              {release.vote_average.toFixed(1)}
            </span>
          )}
        </div>

        {release.overview && (
          <p className="text-xs text-[var(--color-text-muted)] mt-2 line-clamp-2">
            {release.overview}
          </p>
        )}
      </div>
    </Link>
  );
}
