import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Eye, Star } from 'lucide-react';
import { isFeatureEnabled } from '../../config/features';
import { useWatchlistStore } from '../../store/watchlist';
import { useWatchedStore } from '../../store/watched';

interface PosterCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  releaseDate?: string;
  mediaType: 'movie' | 'tv';
  statusLabel?: string;
}

const circleBtn =
  'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 inline-flex items-center justify-center rounded-full bg-black/60 border border-white/15 text-white backdrop-blur-sm hover:bg-black/80 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]';

const pill =
  'inline-flex items-center gap-1 h-5 md:h-6 px-1.5 sm:px-2 md:px-2.5 rounded-full text-[10px] sm:text-[11px] md:text-[12px] font-medium tabular-nums bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]';

export function PosterCard({
  id,
  title,
  posterPath,
  voteAverage,
  releaseDate,
  mediaType,
  statusLabel,
}: PosterCardProps) {
  const path = mediaType === 'movie' ? `/movie/${id}` : `/tv/${id}`;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';

  const { addItem, removeItem, isInWatchlist } = useWatchlistStore();
  const { markWatched, unmarkWatched, isWatched } = useWatchedStore();

  const inWatchlist = isInWatchlist(id, mediaType);
  const watched = isWatched(id, mediaType);

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWatchlist) {
      removeItem(id, mediaType);
    } else {
      addItem({
        id,
        mediaType,
        title,
        posterPath: posterPath || undefined,
        voteAverage,
        releaseDate: releaseDate || '',
        addedAt: Date.now(),
      });
    }
  };

  const handleWatchedToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (watched) {
      unmarkWatched(id, mediaType);
    } else {
      markWatched(id, mediaType);
    }
  };

  return (
    <Link
      to={path}
      className="group block w-full min-w-0 rounded-[14px] md:rounded-[18px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
      aria-label={`${title}${year ? `, ${year}` : ''}`}
    >
      <div className="relative aspect-[2/3] w-full rounded-[14px] md:rounded-[18px] overflow-hidden bg-[var(--color-surface)]">
        {posterPath ? (
          <img
            src={posterPath}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--color-text-faint)]">
            <span className="text-[11px] md:text-[12px]">No image</span>
          </div>
        )}

        {/* Actions, top-right */}
        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 md:top-2.5 md:right-2.5 flex flex-col gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={handleBookmarkToggle}
            className={circleBtn}
            aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            aria-pressed={inWatchlist}
          >
            {inWatchlist ? (
              <BookmarkCheck className="w-3.5 h-3.5 md:w-4 md:h-4 text-[var(--color-accent)]" strokeWidth={1.75} />
            ) : (
              <Bookmark className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={1.75} />
            )}
          </button>
          {isFeatureEnabled('markWatched') && (
            <button
              type="button"
              onClick={handleWatchedToggle}
              className={circleBtn}
              aria-label={watched ? 'Mark as unwatched' : 'Mark as watched'}
              aria-pressed={watched}
            >
              <Eye
                className={`w-3.5 h-3.5 md:w-4 md:h-4 ${watched ? 'text-[var(--color-accent)]' : ''}`}
                strokeWidth={1.75}
              />
            </button>
          )}
        </div>
      </div>

      {/* Caption */}
      <div className="mt-2 px-0.5 min-w-0">
        <h3 className="text-[13px] md:text-[14px] font-semibold leading-snug text-[var(--color-text)] truncate">
          {title}
        </h3>
        <div className="flex items-center gap-1 sm:gap-1.5 mt-1 min-w-0 overflow-hidden">
          {voteAverage > 0 && (
            <span className={`${pill} shrink-0`}>
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-[var(--color-rating)] text-[var(--color-rating)]" strokeWidth={0} />
              <span className="text-[var(--color-text)]">{voteAverage.toFixed(1)}</span>
            </span>
          )}
          {year && <span className={`${pill} shrink-0`}>{year}</span>}
          {statusLabel && <span className={`${pill} min-w-0 truncate`}>{statusLabel}</span>}
        </div>
      </div>
    </Link>
  );
}