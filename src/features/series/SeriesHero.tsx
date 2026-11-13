import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { RatingRing } from '../../components/ui/RatingRing';
import { site } from '../../config/site';
import type { TvSeries } from '../../types';

interface SeriesHeroProps {
  series: TvSeries;
}

const chip =
  'inline-flex items-center h-7 px-3 rounded-full text-[12px] bg-[var(--color-surface)] text-[var(--color-text-muted)]';

export function SeriesHero({ series }: SeriesHeroProps) {
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);

  const startYear = series.first_air_date ? new Date(series.first_air_date).getFullYear() : '';
  const endYear = series.last_air_date
    ? new Date(series.last_air_date).getFullYear()
    : series.status === 'Ended' || series.status === 'Canceled'
    ? startYear
    : 'Present';

  const yearRange =
    startYear && endYear ? (startYear === endYear ? `${startYear}` : `${startYear} – ${endYear}`) : '';

  // Content rating for region, then fallback region
  const region = site.region.default;
  const ratings = (series as any).content_ratings?.results;
  const contentRating =
    ratings?.find((r: any) => r.iso_3166_1 === region)?.rating ||
    ratings?.find((r: any) => r.iso_3166_1 === site.region.fallback)?.rating ||
    '';

  const network = (series as any).networks?.[0];
  const isLongSynopsis = !!series.overview && series.overview.length > 200;

  const words = series.name.trim().split(/\s+/);
  const last = words.pop() ?? '';
  const lead = words.join(' ');

  return (
    <>
      {/* Backdrop */}
      <div className="relative h-[320px] sm:h-[400px] md:h-[480px] lg:h-[560px] overflow-hidden bg-[var(--color-surface)]">
        {series.backdrop_path && (
          <img
            src={series.backdrop_path}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg)] via-[var(--color-bg)]/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[var(--color-bg)] to-transparent" />
      </div>

      {/* Content */}
      <div className="relative -mt-32 sm:-mt-40 md:-mt-56 px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* Poster */}
          <div className="flex-shrink-0 w-36 sm:w-48 md:w-60 mx-auto md:mx-0">
            {series.poster_path ? (
              <img
                src={series.poster_path}
                alt={series.name}
                className="w-full aspect-[2/3] object-cover rounded-xl sm:rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              />
            ) : (
              <div className="w-full aspect-[2/3] rounded-xl sm:rounded-2xl bg-[var(--color-surface)]" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 md:pt-24 text-center md:text-left">
            <h1 className="text-[28px] sm:text-[36px] md:text-[48px] lg:text-[56px] leading-[1.1] tracking-tight text-[var(--color-text)]">
              {lead && <span className="font-light">{lead} </span>}
              <span className="font-bold uppercase">{last}</span>
            </h1>

            {series.tagline && (
              <p className="text-[14px] sm:text-[15px] text-[var(--color-text-muted)] italic mt-3">
                “{series.tagline}”
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-3 mt-6">
              <RatingRing rating={series.vote_average} size="lg" showPercent />
              {yearRange && <span className="text-[13px] text-[var(--color-text-muted)]">{yearRange}</span>}
              {series.status && <span className={chip}>{series.status}</span>}
              {contentRating && <span className={chip}>{contentRating}</span>}
              {network?.logo_path && (
                <div className="h-6 flex items-center">
                  <img src={network.logo_path} alt={network.name} className="h-full object-contain opacity-80" />
                </div>
              )}
            </div>

            {series.genres && series.genres.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-5">
                {series.genres.map((genre) => (
                  <span key={genre.id} className={chip}>
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {series.overview && (
              <div className="mt-6 max-w-2xl mx-auto md:mx-0">
                <p
                  className={`text-[15px] sm:text-[16px] text-[var(--color-text-muted)] leading-relaxed ${
                    !synopsisExpanded && isLongSynopsis ? 'line-clamp-3' : ''
                  }`}
                >
                  {series.overview}
                </p>
                {isLongSynopsis && (
                  <button
                    onClick={() => setSynopsisExpanded(!synopsisExpanded)}
                    aria-expanded={synopsisExpanded}
                    className="inline-flex items-center gap-1.5 mt-3 h-10 px-5 rounded-full bg-[var(--color-surface)] text-[13px] sm:text-[14px] font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-raised)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                  >
                    {synopsisExpanded ? (
                      <>
                        {site.copy.collapse}
                        <ChevronUp className="w-4 h-4" strokeWidth={1.75} />
                      </>
                    ) : (
                      <>
                        {site.copy.expand}
                        <ChevronDown className="w-4 h-4" strokeWidth={1.75} />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {(series.number_of_seasons || series.number_of_episodes) && (
              <dl className="flex justify-center md:justify-start gap-10 sm:gap-12 mt-8 pt-6 max-w-2xl mx-auto md:mx-0">
                {series.number_of_seasons ? (
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-muted)] mb-1">
                      {site.copy.season}s
                    </dt>
                    <dd className="text-[20px] sm:text-[22px] font-semibold text-[var(--color-text)] tabular-nums">
                      {series.number_of_seasons}
                    </dd>
                  </div>
                ) : null}
                {series.number_of_episodes ? (
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-muted)] mb-1">
                      {site.copy.episodes}
                    </dt>
                    <dd className="text-[20px] sm:text-[22px] font-semibold text-[var(--color-text)] tabular-nums">
                      {series.number_of_episodes}
                    </dd>
                  </div>
                ) : null}
              </dl>
            )}
          </div>
        </div>
      </div>
    </>
  );
}