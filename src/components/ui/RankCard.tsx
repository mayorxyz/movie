import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

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
      aria-label={`Rank ${rank}, ${title}${year ? `, ${year}` : ''}`}
      className="group relative block flex-shrink-0 w-[300px] sm:w-[400px] md:w-[500px] aspect-[16/10] rounded-[20px] overflow-hidden bg-[var(--color-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
    >
      {backdropPath ? (
        <img
          src={backdropPath}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      ) : (
        <div className="w-full h-full bg-[var(--color-surface-raised)]" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

      {/* Outlined rank numeral */}
      <span
        aria-hidden="true"
        className="absolute bottom-2 left-4 text-[88px] md:text-[112px] leading-none font-bold text-transparent select-none"
        style={{ WebkitTextStroke: '2px var(--color-accent)' }}
      >
        {rank}
      </span>

      <div className="absolute bottom-5 right-5 left-[40%] text-right">
        <h3 className="text-[18px] md:text-[20px] font-semibold text-white line-clamp-2 mb-2">{title}</h3>
        <div className="flex items-center justify-end gap-2">
          {voteAverage > 0 && (
            <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[12px] font-medium tabular-nums bg-black/55 backdrop-blur-sm text-white">
              <Star className="w-3.5 h-3.5 fill-[var(--color-rating)] text-[var(--color-rating)]" strokeWidth={0} />
              {voteAverage.toFixed(1)}
            </span>
          )}
          {year && (
            <span className="inline-flex items-center h-7 px-3 rounded-full text-[12px] font-medium tabular-nums bg-black/55 backdrop-blur-sm text-[var(--color-text-muted)]">
              {year}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}