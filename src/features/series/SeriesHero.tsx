import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { RatingRing } from '../../components/ui/RatingRing';
import { site } from '../../config/site';
import type { TvSeries } from '../../types';

interface SeriesHeroProps {
  series: TvSeries;
}

export function SeriesHero({ series }: SeriesHeroProps) {
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);

  // Calculate year range
  const startYear = series.first_air_date ? new Date(series.first_air_date).getFullYear() : '';
  const endYear = series.last_air_date 
    ? new Date(series.last_air_date).getFullYear()
    : series.status === 'Ended' || series.status === 'Canceled'
    ? startYear
    : 'Present';
  
  const yearRange = startYear && endYear 
    ? startYear === endYear 
      ? `${startYear}`
      : `${startYear} – ${endYear}`
    : '';

  // Get content rating for region
  const region = site.region.default;
  const contentRating = (series as any).content_ratings?.results?.find(
    (r: any) => r.iso_3166_1 === region
  )?.rating || (series as any).content_ratings?.results?.find(
    (r: any) => r.iso_3166_1 === site.region.fallback
  )?.rating || '';

  // Get network logo
  const network = (series as any).networks?.[0];

  const isLongSynopsis = series.overview && series.overview.length > 200;

  return (
    <>
      {/* Backdrop */}
      <div className="relative h-[60vh] min-h-[400px] max-h-[600px]">
        <div className="absolute inset-0 vignette">
          {series.backdrop_path && (
            <img
              src={series.backdrop_path}
              alt=""
              className="w-full h-full object-cover"
              aria-hidden="true"
            />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-base)] via-[var(--color-base)]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-base)]/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative -mt-48 md:-mt-56 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 w-48 md:w-64 mx-auto md:mx-0">
            {series.poster_path && (
              <img
                src={series.poster_path}
                alt={series.name}
                className="w-full rounded-lg shadow-2xl border border-[var(--color-border)]"
              />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-[var(--font-display)] font-bold text-[var(--color-text)] tracking-tight">
              {series.name}
            </h1>

            {yearRange && (
              <p className="text-sm md:text-base text-[var(--color-text-muted)] mt-2">
                {yearRange}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-4">
              {/* Rating */}
              <RatingRing rating={series.vote_average} size="md" />

              {/* Status badge */}
              {series.status && (
                <span className="px-3 py-1 text-xs font-medium rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)]">
                  {series.status}
                </span>
              )}

              {/* Content rating */}
              {contentRating && (
                <span className="px-2 py-1 text-xs font-medium rounded border border-[var(--color-border)] text-[var(--color-text-muted)]">
                  {contentRating}
                </span>
              )}

              {/* Network logo */}
              {network?.logo_path && (
                <div className="h-6 flex items-center">
                  <img
                    src={network.logo_path}
                    alt={network.name}
                    className="h-full object-contain opacity-80"
                  />
                </div>
              )}
            </div>

            {/* Genres */}
            {series.genres && series.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {series.genres.map(genre => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 text-xs font-medium rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)]"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Tagline */}
            {series.tagline && (
              <p className="text-sm md:text-base text-[var(--color-accent)] italic mt-4">
                "{series.tagline}"
              </p>
            )}

            {/* Synopsis */}
            {series.overview && (
              <div className="mt-4">
                <p className={`text-sm md:text-base text-[var(--color-text)] leading-relaxed ${!synopsisExpanded && isLongSynopsis ? 'line-clamp-3' : ''}`}>
                  {series.overview}
                </p>
                {isLongSynopsis && (
                  <button
                    onClick={() => setSynopsisExpanded(!synopsisExpanded)}
                    className="flex items-center gap-1 mt-2 text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
                    aria-expanded={synopsisExpanded}
                  >
                    {synopsisExpanded ? (
                      <>
                        {site.copy.collapse}
                        <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        {site.copy.expand}
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Season/Episode totals */}
            <div className="flex gap-4 mt-4 text-sm text-[var(--color-text-muted)]">
              {series.number_of_seasons && (
                <span>
                  {series.number_of_seasons} {site.copy.season}{series.number_of_seasons > 1 ? 's' : ''}
                </span>
              )}
              {series.number_of_episodes && (
                <span>
                  {series.number_of_episodes} {site.copy.episodes}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
