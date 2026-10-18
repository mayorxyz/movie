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
import { PageSkeleton } from '../../components/ui/Skeleton';
import { useWatchlistStore } from '../../store/watchlist';
import { features } from '../../config/features';

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
  if (!movie) return <div className="p-8 text-center text-[var(--color-text-muted)]">Movie not found</div>;

  const trailer = videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');

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
      transition={{ duration: 0.3 }}
    >
      {/* Backdrop */}
      <div className="relative h-[60vh] min-h-[400px] max-h-[600px]">
        <div className="absolute inset-0 vignette">
          <img
            src={movie.backdrop_path || undefined}
            alt=""
            className="w-full h-full object-cover"
            aria-hidden="true"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-base)] via-[var(--color-base)]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-base)]/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative -mt-48 md:-mt-56 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 w-48 md:w-64 mx-auto md:mx-0">
            <img
              src={movie.poster_path || undefined}
              alt={movie.title}
              className="w-full rounded-lg shadow-2xl border border-[var(--color-border)]"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-[var(--font-display)] font-bold text-[var(--color-text)] tracking-tight">
              {movie.title}
            </h1>
            
            {movie.tagline && (
              <p className="text-sm md:text-base text-[var(--color-accent)] italic mt-2">
                "{movie.tagline}"
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-4">
              <RatingRing rating={movie.vote_average} size="md" />
              {movie.release_date && (
                <span className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
                  <Calendar className="w-4 h-4" />
                  {new Date(movie.release_date).getFullYear()}
                </span>
              )}
              {movie.runtime && (
                <span className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
                  <Clock className="w-4 h-4" />
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </span>
              )}
            </div>

            {movie.genres && (
              <div className="flex flex-wrap gap-2 mt-4">
                {movie.genres.map(genre => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 text-xs font-medium rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)]"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            <p className="text-sm md:text-base text-[var(--color-text)] mt-6 leading-relaxed max-w-2xl">
              {movie.overview}
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              {features.trailers && trailer && (
                <a
                  href={`https://www.youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="primary" size="md">
                    <Play className="w-4 h-4 mr-2" />
                    Trailer
                  </Button>
                </a>
              )}
              <Button
                variant={inWatchlist ? 'secondary' : 'primary'}
                size="md"
                onClick={handleWatchlistToggle}
              >
                {inWatchlist ? <BookmarkCheck className="w-4 h-4 mr-2" /> : <Bookmark className="w-4 h-4 mr-2" />}
                {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
              </Button>
              <Button variant="secondary" size="md" comingSoon featureFlag="streamButton">
                <Play className="w-4 h-4 mr-2" />
                Stream
              </Button>
              <Button variant="secondary" size="md" comingSoon featureFlag="downloadButton">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>

            {/* Watch providers */}
            {features.watchProviders && watchProviders?.results?.US && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-[var(--color-text-muted)] mb-2">Where to Watch</h3>
                <div className="flex gap-2">
                  {watchProviders.results.US.flatrate?.map(provider => (
                    <div
                      key={provider.provider_id}
                      className="w-10 h-10 rounded-lg bg-[var(--color-surface-raised)] flex items-center justify-center text-xs text-[var(--color-text-muted)] border border-[var(--color-border)]"
                      title={provider.provider_name}
                    >
                      {provider.provider_name.charAt(0)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cast */}
        {credits && credits.cast.length > 0 && (
          <div className="mt-12">
            <Rail title="Cast">
              {credits.cast.slice(0, 12).map(person => (
                <Link
                  key={person.id}
                  to={`/person/${person.id}`}
                  className="flex-shrink-0 w-28 md:w-32 group"
                >
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[var(--color-surface)] mb-2">
                    <img
                      src={(person as any).profile_path || ''}
                      alt={person.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-xs font-medium text-[var(--color-text)] truncate group-hover:text-[var(--color-accent)] transition-colors">
                    {person.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">
                    {person.character}
                  </p>
                </Link>
              ))}
            </Rail>
          </div>
        )}

        {/* Similar */}
        {similar && similar.length > 0 && (
          <div className="mt-10">
            <Rail title="Similar Movies">
              {similar.map(m => (
                <div key={m.id} className="flex-shrink-0 w-[140px] md:w-[180px]">
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
