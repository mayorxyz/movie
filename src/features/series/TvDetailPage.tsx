import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RefreshCw, ArrowDownUp } from 'lucide-react';
import { useSeries } from '../../hooks/useSeries';
import { useSeason } from '../../hooks/useSeason';
import { useSeriesFilters } from '../../hooks/useSeriesFilters';
import { SeriesHero } from './SeriesHero';
import { ActionRow } from './ActionRow';
import { NextEpisodeStrip } from './NextEpisodeStrip';
import { CastRail } from './CastRail';
import { SeasonSelector } from './SeasonSelector';
import { SeasonHeader } from './SeasonHeader';
import { EpisodeRow } from './EpisodeRow';
import { TrailerModal } from './TrailerModal';
import { SeriesPageSkeleton } from './SeriesPageSkeleton';
import { Rail } from '../../components/ui/Rail';
import { PosterCard } from '../../components/ui/PosterCard';
import { ReleaseBadge } from '../../components/ui/ReleaseBadge';
import { Skeleton } from '../../components/ui/Skeleton';
import { site } from '../../config/site';
import { isReleased, filterReleased } from '../../lib/releaseFilters';
import type { TvSeries } from '../../types';

const retryBtn =
  'inline-flex items-center gap-2 h-10 sm:h-11 px-5 sm:px-6 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-[13px] sm:text-[14px] font-semibold active:scale-[0.98] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]';

export default function TvDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const seriesId = Number(id);

  const {
    data: series,
    isLoading: seriesLoading,
    isError: seriesError,
    error: seriesErrorObj,
  } = useSeries({ id: seriesId });

  // URL-synced filters
  const { season, setSeason, sort, setSort } = useSeriesFilters(series);

  const {
    data: seasonData,
    isLoading: seasonLoading,
    isError: seasonError,
    refetch: refetchSeason,
  } = useSeason({
    seriesId,
    seasonNumber: season,
    seriesStatus: series?.status,
    enabled: !!series,
  });

  const [trailerOpen, setTrailerOpen] = useState(false);
  const trailerVideo = (series as any)?.videos?.results?.find(
    (v: any) => v.site === 'YouTube' && v.type === 'Trailer',
  );

  // 404
  useEffect(() => {
    if (seriesError && (seriesErrorObj as any)?.message === 'NOT_FOUND') {
      navigate('/404', { replace: true });
    }
  }, [seriesError, seriesErrorObj, navigate]);

  if (seriesError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-[16px] font-semibold text-[var(--color-text)]">Failed to load series</h2>
        <p className="text-[14px] text-[var(--color-text-muted)] mt-1 mb-6">Check your connection and try again.</p>
        <button onClick={() => window.location.reload()} className={retryBtn}>
          <RefreshCw className="w-4 h-4" strokeWidth={1.75} />
          {site.copy.retry}
        </button>
      </div>
    );
  }

  if (seriesLoading || !series) return <SeriesPageSkeleton />;

  const episodes = seasonData?.episodes || [];
  const sortedEpisodes = [...episodes].sort((a, b) =>
    sort === 'asc' ? a.episode_number - b.episode_number : b.episode_number - a.episode_number,
  );

  // Similar series: hide unreleased outside Upcoming; mocks filtered identically
  const similarSeries = filterReleased((series as any)?.similar?.results || [], {
    requirePoster: false,
  }) as TvSeries[];
  // Direct URLs for unreleased titles still open; badge, no Watch/Download state.
  const released = isReleased({ id: series.id, media_type: 'tv', first_air_date: series.first_air_date });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pb-16"
    >
      <SeriesHero series={series} />

      {!released && (
        <div className="px-4 md:px-8 lg:px-12 max-w-[1440px] mx-auto mt-4">
          <ReleaseBadge firstAirDate={series.first_air_date} mediaType="tv" />
        </div>
      )}

      <div className="px-4 md:px-8 lg:px-12 max-w-[1440px] mx-auto">
        <div className="mt-6 sm:mt-8">
          <ActionRow series={series} onTrailerClick={() => setTrailerOpen(true)} released={released} />
        </div>

        <NextEpisodeStrip series={series} />

        <CastRail series={series} />

        {/* Seasons and episodes */}
        <section className="mt-10 sm:mt-14">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
            <h2 className="text-[18px] sm:text-[20px] font-semibold text-[var(--color-text)]">{site.copy.seasonsAndEpisodes}</h2>
            <span className="w-6 h-2 sm:w-7 sm:h-2.5 rounded-full bg-[var(--color-accent)] shrink-0" />
            <span className="flex-1 h-px bg-[var(--color-border-subtle)]" />
          </div>

          {series.seasons && series.seasons.length > 0 && (
            <SeasonSelector seasons={series.seasons} activeSeason={season} onSeasonChange={setSeason} />
          )}

          {seasonData && (
            <div className="mt-3 sm:mt-4">
              <SeasonHeader season={seasonData} />
            </div>
          )}

          <div className="flex items-center justify-end mb-3 sm:mb-4">
            <button
              onClick={() => setSort(sort === 'asc' ? 'desc' : 'asc')}
              className="inline-flex items-center gap-2 h-9 sm:h-10 px-3 sm:px-4 rounded-full bg-[var(--color-surface)] text-[12px] sm:text-[13px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-raised)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              <ArrowDownUp className="w-3.5 h-3.5" strokeWidth={1.75} />
              {sort === 'asc' ? site.copy.ascending : site.copy.descending}
            </button>
          </div>

          {seasonLoading ? (
            <div className="space-y-2.5 sm:space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-28 sm:h-32 w-full rounded-xl sm:rounded-2xl" />
              ))}
            </div>
          ) : seasonError ? (
            <div className="flex flex-col items-center text-center py-12">
              <p className="text-[14px] text-[var(--color-text-muted)] mb-4">Failed to load episodes</p>
              <button onClick={() => refetchSeason()} className={retryBtn}>
                <RefreshCw className="w-4 h-4" strokeWidth={1.75} />
                {site.copy.retry}
              </button>
            </div>
          ) : sortedEpisodes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[14px] text-[var(--color-text-muted)]">{site.copy.noEpisodes}</p>
            </div>
          ) : (
            <div className="space-y-2.5 sm:space-y-3" aria-live="polite">
              {sortedEpisodes.map((episode) => (
                <EpisodeRow key={episode.id} episode={episode} />
              ))}
            </div>
          )}
        </section>

        {similarSeries.length > 0 && (
          <div className="mt-10 sm:mt-14">
            <Rail title={site.copy.similarSeries}>
              {similarSeries.map((s: TvSeries) => (
                <div key={s.id} className="flex-shrink-0 w-[120px] sm:w-[140px] md:w-[180px]">
                  <PosterCard
                    id={s.id}
                    title={s.name}
                    posterPath={s.poster_path}
                    voteAverage={s.vote_average}
                    releaseDate={s.first_air_date}
                    mediaType="tv"
                  />
                </div>
              ))}
            </Rail>
          </div>
        )}
      </div>

      {trailerOpen && trailerVideo && (
        <TrailerModal videoKey={trailerVideo.key} onClose={() => setTrailerOpen(false)} />
      )}
    </motion.div>
  );
}