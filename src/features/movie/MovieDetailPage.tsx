import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Play, Download, Bookmark, BookmarkCheck, Clock, Calendar } from 'lucide-react';
import { tmdbService } from '../../services/tmdbClient';
import { Button } from '../../components/ui/Button';
import { RatingRing } from '../../components/ui/RatingRing';
import { Rail } from '../../components/ui/Rail';
import { PosterCard } from '../../components/ui/PosterCard';
import { ReleaseBadge } from '../../components/ui/ReleaseBadge';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { useWatchlistStore } from '../../store/watchlist';
import { features } from '../../config/features';
import { isReleased } from '../../lib/releaseFilters';

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const movieId = Number(id);

  const { data: movie, isLoading } = useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => tmdbService.getMovieDetails(movieId),
    staleTime: 60 * 60 * 1000,
  });

  const { data: credits } = useQuery({
    queryKey: ['movieCredits', movieId],
    queryFn: () => tmdbService.getMovieCredits(movieId),
    enabled: !!movieId,
  });

  const { data: similar } = useQuery({
    queryKey: ['movieSimilar', movieId],
    queryFn: () => tmdbService.getMovieSimilar(movieId),
    enabled: !!movieId,
  });

  const { data: videos } = useQuery({
    queryKey: ['movieVideos', movieId],
    queryFn: () => tmdbService.getMovieVideos(movieId),
    enabled: !!movieId && features.trailers,
  });

  const { data: watchProviders } = useQuery({
    queryKey: ['movieWatchProviders', movieId],
    queryFn: () => tmdbService.getMovieWatchProviders(movieId),
    enabled: !!movieId && features.watchProviders,
  });

  const { addItem, removeItem, isInWatchlist } = useWatchlistStore();
  const inWatchlist = isInWatchlist(movieId, 'movie');

  if (isLoading) return <PageSkeleton />;
  if (!movie) return <div className="p-8 text-center text-sm text-[var(--color-text-muted)]">Movie not found</div>;

  const trailer = videos?.results?.find((v) => v.type === 'Trailer' && v.site === 'YouTube');
  const released = isReleased({ id: movie.id, media_type: 'movie', release_date: movie.release_date });

  const handleWatchlistToggle = () => {
    if (inWatchlist) {
      removeItem(movieId, 'movie');
    } else {
      addItem({
        id: movie.id,
        mediaType: 'movie',
        title: movie.title,
        posterPath: movie.poster_path || undefined,
        backdropPath: movie.backdrop_path || undefined,
        voteAverage: movie.vote_average,
        releaseDate: movie.release_date,
        addedAt: Date.now(),
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="pb-8 md:pb-12 overflow-x-clip"
    >
      {/* Backdrop */}
      <div className="relative h-[38vh] min-h-[240px] max-h-[420px] md:h-[52vh] md:min-h-[380px] md:max-h-[540px]">
        <div className="absolute inset-0 vignette">
          <img
            src={movie.backdrop_path || undefined}
            alt=""
            className="w-full h-full object-cover object-top"
            aria-hidden="true"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-base)] via-[var(--color-base)]/60 to-transparent" />
        <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[var(--color-base)]/75 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative -mt-28 sm:-mt-36 md:-mt-48 px-4 sm:px-6 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 w-32 sm:w-40 md:w-56 lg:w-64 mx-auto md:mx-0">
            <img
              src={movie.poster_path || undefined}
              alt={movie.title}
              className="w-full aspect-[2/3] object-cover rounded-xl shadow-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-[var(--font-display)] font-bold text-[var(--color-text)] tracking-tight leading-tight">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="text-xs sm:text-sm md:text-base text-[var(--color-accent)] italic mt-1.5">
                "{movie.tagline}"
              </p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3.5 mt-3 md:mt-4">
              <RatingRing rating={movie.vote_average} size="sm" />
              <ReleaseBadge releaseDate={movie.release_date} mediaType="movie" />
              {movie.release_date && (
                <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-[var(--color-text-muted)] tabular-nums">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(movie.release_date).getFullYear()}
                </span>
              )}
              {movie.runtime ? (
                <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-[var(--color-text-muted)] tabular-nums">
                  <Clock className="w-3.5 h-3.5" />
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </span>
              ) : null}
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-1.5 mt-3">
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-2.5 py-0.5 text-[11px] sm:text-xs font-medium rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)]"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            {movie.overview && (
              <p className="text-xs sm:text-sm md:text-base text-[var(--color-text)]/90 mt-4 md:mt-5 leading-relaxed max-w-2xl mx-auto md:mx-0 text-left">
                {movie.overview}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-2.5 mt-5">
              {features.trailers && trailer && (
                <a
                  href={`https://www.youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="primary" size="sm">
                    <Play className="w-3.5 h-3.5" />
                    Trailer
                  </Button>
                </a>
              )}
              <Button
                variant={inWatchlist ? 'secondary' : 'primary'}
                size="sm"
                onClick={handleWatchlistToggle}
              >
                {inWatchlist ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                {inWatchlist ? 'In Watchlist' : 'Watchlist'}
              </Button>
              <Button variant="secondary" size="sm" comingSoon featureFlag="streamButton">
                <Play className="w-3.5 h-3.5" />
                Stream
              </Button>
              {released && (
                <Button variant="secondary" size="sm" comingSoon featureFlag="downloadButton">
                  <Download className="w-3.5 h-3.5" />
                  Download
                </Button>
              )}
            </div>

            {/* Watch providers */}
            {features.watchProviders && watchProviders?.results?.US?.flatrate?.length ? (
              <div className="mt-5">
                <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                  Where to Watch
                </h3>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {watchProviders.results.US.flatrate.map((provider) => (
                    <div
                      key={provider.provider_id}
                      className="w-9 h-9 rounded-lg bg-[var(--color-surface-raised)] flex items-center justify-center text-xs font-semibold text-[var(--color-text-muted)] border border-[var(--color-border)]"
                      title={provider.provider_name}
                    >
                      {provider.provider_name.charAt(0)}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Cast */}
        {credits && credits.cast.length > 0 && (
          <div className="mt-8 md:mt-12 -mx-4 sm:-mx-6 md:mx-0">
            <Rail title="Cast">
              {credits.cast.slice(0, 12).map((person) => (
                <Link
                  key={person.id}
                  to={`/person/${person.id}`}
                  className="flex-shrink-0 w-24 sm:w-28 md:w-32 group"
                >
                  <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[var(--color-surface)] mb-1.5">
                    <img
                      src={(person as any).profile_path || ''}
                      alt={person.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-[11px] sm:text-xs font-medium text-[var(--color-text)] truncate group-hover:text-[var(--color-accent)] transition-colors">
                    {person.name}
                  </p>
                  <p className="text-[10px] sm:text-xs text-[var(--color-text-muted)] truncate">
                    {person.character}
                  </p>
                </Link>
              ))}
            </Rail>
          </div>
        )}

        {/* Similar */}
        {similar && similar.length > 0 && (
          <div className="mt-6 md:mt-10 -mx-4 sm:-mx-6 md:mx-0">
            <Rail title="Similar Movies">
              {similar.map((m) => (
                <div key={m.id} className="flex-shrink-0 w-[124px] sm:w-[144px] md:w-[175px]">
                  <PosterCard
                    id={m.id}
                    title={m.title}
                    posterPath={m.poster_path}
                    voteAverage={m.vote_average}
                    releaseDate={m.release_date}
                    mediaType="movie"
                  />
                </div>
              ))}
            </Rail>
          </div>
        )}
      </div>
    </motion.div>
  );
}