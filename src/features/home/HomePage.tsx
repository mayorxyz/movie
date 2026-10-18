import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { tmdbService } from '../../services/tmdbClient';
import { Rail } from '../../components/ui/Rail';
import { PosterCard } from '../../components/ui/PosterCard';
import { Button } from '../../components/ui/Button';
import { RatingRing } from '../../components/ui/RatingRing';
import { PosterSkeleton, TextSkeleton } from '../../components/ui/Skeleton';
import { features } from '../../config/features';

function HeroSlide({ movie, isActive }: { movie: any; isActive: boolean }) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key={movie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 vignette">
            <img
              src={movie.backdrop_path}
              alt=""
              className="w-full h-full object-cover"
              aria-hidden="true"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-base)] via-[var(--color-base)]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-base)]/80 via-transparent to-transparent" />
          
          <div className="relative h-full flex items-end pb-24 md:pb-32 px-4 md:px-8 lg:px-12 max-w-[1920px] mx-auto">
            <div className="max-w-2xl">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <RatingRing rating={movie.vote_average} size="md" />
                  <span className="text-sm text-[var(--color-text-muted)]">
                    {movie.release_date ? new Date(movie.release_date).getFullYear() : ''}
                  </span>
                  {movie.runtime && (
                    <span className="text-sm text-[var(--color-text-muted)]">
                      {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-[var(--font-display)] font-bold text-[var(--color-text)] tracking-tight mb-3">
                  {movie.title}
                </h1>
                {movie.tagline && (
                  <p className="text-sm md:text-base text-[var(--color-accent)] italic mb-3">
                    {movie.tagline}
                  </p>
                )}
                <p className="text-sm md:text-base text-[var(--color-text-muted)] line-clamp-2 mb-6 max-w-lg">
                  {movie.overview}
                </p>
                <div className="flex items-center gap-3">
                  <Link to={`/movie/${movie.id}`}>
                    <Button variant="primary" size="lg">
                      <Info className="w-4 h-4 mr-2" />
                      Details
                    </Button>
                  </Link>
                  <Button variant="secondary" size="lg" comingSoon featureFlag="streamButton">
                    <Play className="w-4 h-4 mr-2" />
                    Watch
                  </Button>
                  <Button variant="secondary" size="lg" comingSoon featureFlag="downloadButton">
                    Download
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  
  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending'],
    queryFn: () => tmdbService.getTrending(),
  });

  const { data: popularMovies } = useQuery({
    queryKey: ['popularMovies'],
    queryFn: () => tmdbService.getPopularMovies(),
  });

  const { data: popularTv } = useQuery({
    queryKey: ['popularTv'],
    queryFn: () => tmdbService.getPopularTv(),
  });

  const { data: topRated } = useQuery({
    queryKey: ['topRatedMovies'],
    queryFn: () => tmdbService.getTopRatedMovies(),
  });

  const { data: upcoming } = useQuery({
    queryKey: ['upcomingMovies'],
    queryFn: () => tmdbService.getUpcomingMovies(),
    enabled: features.upcomingRail,
  });

  // Auto-advance hero
  useEffect(() => {
    if (!trending || trending.length === 0) return;
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % Math.min(trending.length, 5));
    }, 6000);
    return () => clearInterval(interval);
  }, [trending]);

  const heroMovies = trending?.slice(0, 5) || [];

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[80vh] min-h-[500px] max-h-[800px] overflow-hidden" aria-label="Featured">
        {trendingLoading ? (
          <div className="absolute inset-0 bg-[var(--color-surface)] animate-pulse" />
        ) : (
          <>
            {heroMovies.map((movie, i) => (
              <HeroSlide key={movie.id} movie={movie} isActive={i === activeSlide} />
            ))}
            
            {/* Slide indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {heroMovies.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === activeSlide ? 'bg-[var(--color-accent)] w-6' : 'bg-[var(--color-text-muted)]/50'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Arrow controls */}
            <button
              onClick={() => setActiveSlide(prev => (prev - 1 + heroMovies.length) % heroMovies.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => setActiveSlide(prev => (prev + 1) % heroMovies.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}
      </section>

      {/* Rails */}
      <div className="space-y-10 py-12">
        {trendingLoading ? (
          <div className="px-4 md:px-8 lg:px-12">
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[140px] md:w-[180px]">
                  <PosterSkeleton />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <Rail title="Trending This Week">
              {trending?.map(movie => (
                <div key={movie.id} className="flex-shrink-0 w-[140px] md:w-[180px]">
                  <PosterCard
                    id={movie.id}
                    title={movie.title}
                    posterPath={movie.poster_path}
                    voteAverage={movie.vote_average}
                    releaseDate={movie.release_date}
                    mediaType="movie"
                  />
                </div>
              ))}
            </Rail>

            <Rail title="Popular Movies">
              {popularMovies?.results.map(movie => (
                <div key={movie.id} className="flex-shrink-0 w-[140px] md:w-[180px]">
                  <PosterCard
                    id={movie.id}
                    title={movie.title}
                    posterPath={movie.poster_path}
                    voteAverage={movie.vote_average}
                    releaseDate={movie.release_date}
                    mediaType="movie"
                  />
                </div>
              ))}
            </Rail>

            <Rail title="Popular TV Shows">
              {popularTv?.results.map(show => (
                <div key={show.id} className="flex-shrink-0 w-[140px] md:w-[180px]">
                  <PosterCard
                    id={show.id}
                    title={show.name}
                    posterPath={show.poster_path}
                    voteAverage={show.vote_average}
                    releaseDate={show.first_air_date}
                    mediaType="tv"
                  />
                </div>
              ))}
            </Rail>

            <Rail title="Top Rated">
              {topRated?.map(movie => (
                <div key={movie.id} className="flex-shrink-0 w-[140px] md:w-[180px]">
                  <PosterCard
                    id={movie.id}
                    title={movie.title}
                    posterPath={movie.poster_path}
                    voteAverage={movie.vote_average}
                    releaseDate={movie.release_date}
                    mediaType="movie"
                  />
                </div>
              ))}
            </Rail>

            {features.upcomingRail && upcoming && (
              <Rail title="Upcoming">
                {upcoming.map(movie => (
                  <div key={movie.id} className="flex-shrink-0 w-[140px] md:w-[180px]">
                    <PosterCard
                      id={movie.id}
                      title={movie.title}
                      posterPath={movie.poster_path}
                      voteAverage={movie.vote_average}
                      releaseDate={movie.release_date}
                      mediaType="movie"
                    />
                  </div>
                ))}
              </Rail>
            )}
          </>
        )}
      </div>
    </div>
  );
}
