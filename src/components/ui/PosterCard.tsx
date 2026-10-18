import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Eye, Play, Download } from 'lucide-react';
import { RatingRing } from './RatingRing';
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

export function PosterCard({ id, title, posterPath, voteAverage, releaseDate, mediaType, statusLabel }: PosterCardProps) {
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
      className="poster-card block group relative"
      aria-label={`${title}${year ? `, ${year}` : ''}`}
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[var(--color-surface)]">
        {posterPath ? (
          <img
            src={posterPath}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
            <span className="text-sm">No Image</span>
          </div>
        )}

        {/* Status label */}
        {statusLabel && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 text-xs font-medium rounded bg-black/60 text-[var(--color-text)]">
              {statusLabel}
            </span>
          </div>
        )}

        {/* Rating */}
        <div className="absolute top-2 right-2">
          <RatingRing rating={voteAverage} size="sm" />
        </div>

        {/* Hover overlay with action buttons */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 flex items-end justify-center pb-4">
          <div className="flex gap-2">
            {/* Bookmark */}
            <button
              onClick={handleBookmarkToggle}
              className={`p-2 rounded-full transition-colors ${
                inWatchlist
                  ? 'bg-[var(--color-accent)] text-[var(--color-base)]'
                  : 'bg-black/60 text-[var(--color-text)] hover:bg-black/80'
              }`}
              aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              {inWatchlist ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>

            {/* Mark watched */}
            {isFeatureEnabled('markWatched') && (
              <button
                onClick={handleWatchedToggle}
                className={`p-2 rounded-full transition-colors ${
                  watched
                    ? 'bg-[var(--color-success)] text-white'
                    : 'bg-black/60 text-[var(--color-text)] hover:bg-black/80'
                }`}
                aria-label={watched ? 'Mark as unwatched' : 'Mark as watched'}
              >
                <Eye className="w-4 h-4" />
              </button>
            )}

            {/* Play (disabled) */}
            <button
              disabled
              className="p-2 rounded-full bg-black/60 text-[var(--color-text-muted)] cursor-not-allowed opacity-50 tooltip-coming-soon"
              aria-label="Play (coming soon)"
            >
              <Play className="w-4 h-4" />
            </button>

            {/* Download (disabled) */}
            {isFeatureEnabled('downloadButton') && (
              <button
                disabled
                className="p-2 rounded-full bg-black/60 text-[var(--color-text-muted)] cursor-not-allowed opacity-50 tooltip-coming-soon"
                aria-label="Download (coming soon)"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Title and year */}
      <div className="mt-2 px-1">
        <h3 className="text-sm font-medium text-[var(--color-text)] truncate group-hover:text-[var(--color-accent)] transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          {year && <p className="text-xs text-[var(--color-text-muted)]">{year}</p>}
          {watched && <span className="text-xs text-[var(--color-success)]">✓ Watched</span>}
        </div>
      </div>
    </Link>
  );
}
