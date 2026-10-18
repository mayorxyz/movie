import React from 'react';
import { Link } from 'react-router-dom';

interface RankCardProps {
  id: number;
  rank: number;
  title: string;
  backdropPath: string | null;
  voteAverage: number;
  releaseDate?: string;
  mediaType: 'movie' | 'tv';
}

export function RankCard({ id, rank, title, backdropPath, voteAverage, releaseDate, mediaType }: RankCardProps) {
  const path = mediaType === 'movie' ? `/movie/${id}` : `/tv/${id}`;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';

  return (
    <Link
      to={path}
      className="poster-card block group relative flex-shrink-0 w-[400px] md:w-[500px] aspect-[16/10] rounded-lg overflow-hidden bg-[var(--color-surface)]"
      aria-label={`${title}${year ? `, ${year}` : ''}`}
    >
      {/* Backdrop image */}
      {backdropPath ? (
        <img
          src={backdropPath}
          alt=""
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          aria-hidden="true"
        />
      ) : (
        <div className="w-full h-full bg-[var(--color-surface-raised)]" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Rank numeral */}
      <div className="absolute bottom-4 left-4">
        <span className="text-6xl md:text-7xl font-[var(--font-display)] font-bold text-[var(--color-accent)] opacity-90 drop-shadow-lg">
          {rank}
        </span>
      </div>

      {/* Content */}
      <div className="absolute bottom-4 right-4 text-right">
        <h3 className="text-lg md:text-xl font-semibold text-[var(--color-text)] mb-1 line-clamp-2">
          {title}
        </h3>
        <div className="flex items-center justify-end gap-3 text-sm text-[var(--color-text-muted)]">
          <span className="font-medium text-[var(--color-accent)]">★ {voteAverage.toFixed(1)}</span>
          {year && <span>{year}</span>}
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
    </Link>
  );
}
