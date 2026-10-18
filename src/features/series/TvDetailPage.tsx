import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Play, Download, Bookmark, BookmarkCheck, Clock, Calendar, Tv } from 'lucide-react';
import { tmdbService } from '../../services/tmdbClient';
import { Button } from '../../components/ui/Button';
import { RatingRing } from '../../components/ui/RatingRing';
import { Rail } from '../../components/ui/Rail';
import { PosterCard } from '../../components/ui/PosterCard';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { useWatchlistStore } from '../../store/watchlist';
import { features } from '../../config/features';

export default function TvDetailPage() {
  const { id } = useParams<{ id: string }>();
  const tvId = Number(id);
  const [activeSeason, setActiveSeason] = useState(0);

  const { data: series, isLoading } = useQuery({
    queryKey: ['tv', tvId],
    queryFn: () => tmdbService.getTvDetails(tvId),
    staleTime: 60 * 60 * 1000,
  });

  const { data: credits } = useQuery({
    queryKey: ['tvCredits', tvId],
    queryFn: () => tmdbService.getTvCredits(tvId),
    enabled: !!tvId,
  });

  const { data: similar } = useQuery({
    queryKey: ['tvSimilar', tvId],
    queryFn: () => tmdbService.getTvSimilar(tvId),
    enabled: !!tvId,
  });

  const { data: videos } = useQuery({
    queryKey: ['tvVideos', tvId],
    queryFn: () => tmdbService.getTvVideos(tvId),
    enabled: !!tvId && features.trailers,
  });

  const { addItem, removeItem, isInWatchlist } = useWatchlistStore();
  const inWatchlist = isInWatchlist(tvId, 'tv');

  if (isLoading) return <PageSkeleton />;
  if (!series) return <div className="p-8 text-center text-[var(--color-text-muted)]">Series not found</div>;

  const trailer = videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');

  const handleWatchlistToggle = () => {
    if (inWatchlist) {
      removeItem(tvId, 'tv');
    } else {
      addItem({
        id: series.id,
        mediaType: 'tv',
        title: series.name,
        posterPath: series.poster_path || undefined,
        backdropPath: series.backdrop_path || undefined,
        voteAverage: series.vote_average,
        releaseDate: series.first_air_date,
        addedAt: Date.now(),
      });
    }
  };

  const seasons = series.seasons || [];
  const currentSeason = seasons[activeSeason];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Backdrop */}
      <div className="relative h-[60vh] min-h-[400px] max-h-[600px]">
        <div className="absolute inset-0 vignette">
          <img src={series.backdrop_path || undefined} alt="" className="w-full h-full object-cover" aria-hidden="true" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-base)] via-[var(--color-base)]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-base)]/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative -mt-48 md:-mt-56 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0 w-48 md:w-64 mx-auto md:mx-0">
            <img src={series.poster_path || undefined} alt={series.name} className="w-full rounded-lg shadow-2xl border border-[var(--color-border)]" />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-[var(--font-display)] font-bold text-[var(--color-text)] tracking-tight">
              {series.name}
            </h1>
            {series.tagline && <p className="text-sm md:text-base text-[var(--color-accent)] italic mt-2">"{series.tagline}"</p>}

            <div className="flex flex-wrap items-center gap-4 mt-4">
              <RatingRing rating={series.vote_average} size="md" />
              {series.first_air_date && (
                <span className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
                  <Calendar className="w-4 h-4" />
                  {new Date(series.first_air_date).getFullYear()}
                </span>
              )}
              {series.number_of_seasons && (
                <span className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
                  <Tv className="w-4 h-4" />
                  {series.number_of_seasons} Season{series.number_of_seasons > 1 ? 's' : ''}
                </span>
              )}
              {series.status && (
                <span className="text-xs px-2 py-1 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)]">
                  {series.status}
                </span>
              )}
            </div>

            {series.genres && (
              <div className="flex flex-wrap gap-2 mt-4">
                {series.genres.map(genre => (
                  <span key={genre.id} className="px-3 py-1 text-xs font-medium rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)]">
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            <p className="text-sm md:text-base text-[var(--color-text)] mt-6 leading-relaxed max-w-2xl">{series.overview}</p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              {features.trailers && trailer && (
                <a href={`https://www.youtube.com/watch?v=${trailer.key}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" size="md"><Play className="w-4 h-4 mr-2" />Trailer</Button>
                </a>
              )}
              <Button variant={inWatchlist ? 'secondary' : 'primary'} size="md" onClick={handleWatchlistToggle}>
                {inWatchlist ? <BookmarkCheck className="w-4 h-4 mr-2" /> : <Bookmark className="w-4 h-4 mr-2" />}
                {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
              </Button>
              <Button variant="secondary" size="md" comingSoon featureFlag="streamButton">
                <Play className="w-4 h-4 mr-2" />Stream
              </Button>
              <Button variant="secondary" size="md" comingSoon featureFlag="downloadButton">
                <Download className="w-4 h-4 mr-2" />Download
              </Button>
            </div>

            {/* Next episode */}
            {series.next_episode_to_air && (
              <div className="mt-6 p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="text-sm font-medium text-[var(--color-accent)]">Next Episode</h3>
                <p className="text-sm text-[var(--color-text)] mt-1">
                  S{series.next_episode_to_air.season_number} E{series.next_episode_to_air.episode_number}: {series.next_episode_to_air.name}
                </p>
                {series.next_episode_to_air.air_date && (
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Airs {new Date(series.next_episode_to_air.air_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Seasons */}
        {seasons.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl md:text-2xl font-[var(--font-display)] font-semibold mb-4">Seasons</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 rail-scroll">
              {seasons.map((season, i) => (
                <button
                  key={season.id}
                  onClick={() => setActiveSeason(i)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    i === activeSeason
                      ? 'bg-[var(--color-accent)] text-[var(--color-base)]'
                      : 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {season.name}
                </button>
              ))}
            </div>

            {currentSeason && (
              <div className="mt-6 space-y-3">
                <p className="text-sm text-[var(--color-text-muted)]">{currentSeason.overview}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{currentSeason.episode_count} episodes</p>
              </div>
            )}
          </div>
        )}

        {/* Cast */}
        {credits && credits.cast.length > 0 && (
          <div className="mt-12">
            <Rail title="Cast">
              {credits.cast.slice(0, 12).map(person => (
                <Link key={person.id} to={`/person/${person.id}`} className="flex-shrink-0 w-28 md:w-32 group">
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[var(--color-surface)] mb-2">
                    <img src={(person as any).profile_path || ''} alt={person.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  </div>
                  <p className="text-xs font-medium text-[var(--color-text)] truncate group-hover:text-[var(--color-accent)] transition-colors">{person.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">{person.character}</p>
                </Link>
              ))}
            </Rail>
          </div>
        )}

        {/* Similar */}
        {similar && similar.length > 0 && (
          <div className="mt-10">
            <Rail title="Similar Series">
              {similar.map(s => (
                <div key={s.id} className="flex-shrink-0 w-[140px] md:w-[180px]">
                  <PosterCard id={s.id} title={s.name} posterPath={s.poster_path} voteAverage={s.vote_average} releaseDate={s.first_air_date} mediaType="tv" />
                </div>
              ))}
            </Rail>
          </div>
        )}
      </div>
    </motion.div>
  );
}
