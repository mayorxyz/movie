import React from 'react';
import { Link } from 'react-router-dom';
import { RatingRing } from './RatingRing';

interface PosterCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  releaseDate?: string;
  mediaType: 'movie' | 'tv';
}

export function PosterCard({ id, title, posterPath, voteAverage, releaseDate, mediaType }: PosterCardProps) {
  const path = mediaType === 'movie' ? `/movie/${id}` : `/tv/${id}`;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';

  return (
    <Link
      to={path}
      className="poster-card block group"
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
        <div className="absolute top-2 right-2">
          <RatingRing rating={voteAverage} size="sm" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>
      <div className="mt-2 px-1">
        <h3 className="text-sm font-medium text-[var(--color-text)] truncate group-hover:text-[var(--color-accent)] transition-colors">
          {title}
        </h3>
        {year && (
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{year}</p>
        )}
      </div>
    </Link>
  );
}
