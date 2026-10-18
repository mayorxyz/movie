import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
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
import { NotFoundPage } from '../errors/ErrorPages';
import { site } from '../../config/site';
import type { TvSeries } from '../../types';

export default function TvDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const seriesId = Number(id);

  // Fetch series details
  const { data: series, isLoading: seriesLoading, isError: seriesError, error: seriesErrorObj } = useSeries({ id: seriesId });

  // URL-synced filters
  const { season, setSeason, sort, setSort } = useSeriesFilters(series);

  // Fetch season episodes
  const { 
    data: seasonData, 
    isLoading: seasonLoading, 
    isError: seasonError,
    refetch: refetchSeason 
  } = useSeason({ 
    seriesId, 
    seasonNumber: season, 
    seriesStatus: series?.status,
    enabled: !!series 
  });

  // Trailer modal state
  const [trailerOpen, setTrailerOpen] = useState(false);
  const trailerVideo = (series as any)?.videos?.results?.find(
    (v: any) => v.site === 'YouTube' && v.type === 'Trailer'
  );

  // Handle 404
  useEffect(() => {
    if (seriesError && (seriesErrorObj as any)?.message === 'NOT_FOUND') {
      navigate('/404', { replace: true });
    }
  }, [seriesError, seriesErrorObj, navigate]);

  // Prefetch next season on idle
  useEffect(() => {
    if (!series?.seasons || !seasonData) return;

    const currentSeasonIndex = series.seasons.findIndex(s => s.season_number === season);
    const nextSeason = series.seasons[currentSeasonIndex + 1];

    if (nextSeason && nextSeason.season_number > 0) {
      const prefetch = () => {
        // Prefetch will be handled by TanStack Query automatically
        // when the user navigates to the next season
      };

      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(prefetch);
      }
    }
  }, [series, season, seasonData]);

  // Loading state
  if (seriesLoading || !series) {
    return <SeriesPageSkeleton />;
  }

  // Error state
  if (seriesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--color-text-muted)] mb-4">Failed to load series</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-sm text-[var(--color-text)] hover:border-[var(--color-text-muted)] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {site.copy.retry}
          </button>
        </div>
      </div>
    );
  }

  // Sort episodes
  const episodes = seasonData?.episodes || [];
  const sortedEpisodes = [...episodes].sort((a, b) => {
    return sort === 'asc' 
      ? a.episode_number - b.episode_number
      : b.episode_number - a.episode_number;
  });

  // Get similar series
  const similarSeries = (series as any)?.similar?.results || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Hero */}
      <SeriesHero series={series} />

      {/* Content */}
      <div className="relative -mt-48 md:-mt-56 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        {/* Action Row */}
        <div className="mt-8">
          <ActionRow series={series} onTrailerClick={() => setTrailerOpen(true)} />
        </div>

        {/* Next Episode Strip */}
        <NextEpisodeStrip series={series} />

        {/* Cast Rail */}
        <CastRail series={series} />

        {/* Seasons & Episodes Section */}
        <div className="mt-12">
          <h2 className="text-xl md:text-2xl font-[var(--font-display)] font-semibold mb-4">
            {site.copy.seasonsAndEpisodes}
          </h2>

          {/* Season Selector */}
          {series.seasons && series.seasons.length > 0 && (
            <SeasonSelector
              seasons={series.seasons}
              activeSeason={season}
              onSeasonChange={setSeason}
            />
          )}

          {/* Season Header */}
          {seasonData && <SeasonHeader season={seasonData} />}

          {/* Sort Toggle */}
          <div className="flex items-center justify-end mb-4">
            <button
              onClick={() => setSort(sort === 'asc' ? 'desc' : 'asc')}
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              {sort === 'asc' ? site.copy.ascending : site.copy.descending}
            </button>
          </div>

          {/* Episode List */}
          {seasonLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 rounded-lg bg-[var(--color-surface)] animate-pulse" />
              ))}
            </div>
          ) : seasonError ? (
            <div className="text-center py-8">
              <p className="text-[var(--color-text-muted)] mb-4">Failed to load episodes</p>
              <button
                onClick={() => refetchSeason()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-sm text-[var(--color-text)] hover:border-[var(--color-text-muted)] transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                {site.copy.retry}
              </button>
            </div>
          ) : sortedEpisodes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[var(--color-text-muted)]">{site.copy.noEpisodes}</p>
            </div>
          ) : (
            <div className="space-y-3" aria-live="polite">
              {sortedEpisodes.map(episode => (
                <EpisodeRow key={episode.id} episode={episode} />
              ))}
            </div>
          )}
        </div>

        {/* Similar Series Rail */}
        {similarSeries.length > 0 && (
          <div className="mt-12">
            <Rail title={site.copy.similarSeries}>
              {similarSeries.map((s: TvSeries) => (
                <div key={s.id} className="flex-shrink-0 w-[140px] md:w-[180px]">
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

      {/* Trailer Modal */}
      {trailerOpen && trailerVideo && (
        <TrailerModal videoKey={trailerVideo.key} onClose={() => setTrailerOpen(false)} />
      )}
    </motion.div>
  );
}
