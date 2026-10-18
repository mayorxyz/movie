import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { tmdbService } from '../../services/tmdbClient';
import { PosterCard } from '../../components/ui/PosterCard';
import { PageSkeleton, PosterSkeleton } from '../../components/ui/Skeleton';

export default function BrowsePage() {
  const { type } = useParams<{ type: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  
  const mediaType = type === 'tv' ? 'tv' : 'movie';
  const page = Number(searchParams.get('page') || 1);
  const genre = searchParams.get('genre') || '';
  const sortBy = searchParams.get('sort') || 'popularity.desc';
  const minRating = searchParams.get('rating') || '';

  const { data: genres } = useQuery<any[]>({
    queryKey: [`${mediaType}Genres`],
    queryFn: () => mediaType === 'tv' ? tmdbService.getTvGenres() : tmdbService.getMovieGenres(),
  });

  const { data, isLoading, isFetching } = useQuery<any>({
    queryKey: [`browse-${mediaType}`, page, genre, sortBy, minRating],
    queryFn: () => mediaType === 'tv' ? tmdbService.getPopularTv(page) : tmdbService.getPopularMovies(page),
    staleTime: 10 * 60 * 1000,
  });

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const title = mediaType === 'tv' ? 'TV Shows' : 'Movies';

  return (
    <div className="px-4 md:px-8 lg:px-12 max-w-[1920px] mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl md:text-4xl font-[var(--font-display)] font-bold text-[var(--color-text)]">
          {title}
        </h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] text-sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Filters */}
      <div className={`${showFilters ? 'block' : 'hidden'} md:block mb-8 p-4 md:p-0 rounded-lg md:rounded-none bg-[var(--color-surface)] md:bg-transparent border border-[var(--color-border)] md:border-0`}>
        <div className="flex flex-wrap gap-4">
          {genres && (
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1">Genre</label>
              <select
                value={genre}
                onChange={e => updateFilter('genre', e.target.value)}
                className="px-3 py-2 rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none"
              >
                <option value="">All Genres</option>
                {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={e => updateFilter('sort', e.target.value)}
              className="px-3 py-2 rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none"
            >
              <option value="popularity.desc">Most Popular</option>
              <option value="vote_average.desc">Highest Rated</option>
              <option value="primary_release_date.desc">Newest</option>
              <option value="primary_release_date.asc">Oldest</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1">Min Rating</label>
            <select
              value={minRating}
              onChange={e => updateFilter('rating', e.target.value)}
              className="px-3 py-2 rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] outline-none"
            >
              <option value="">Any</option>
              <option value="5">5+</option>
              <option value="6">6+</option>
              <option value="7">7+</option>
              <option value="8">8+</option>
              <option value="9">9+</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <PosterSkeleton key={i} />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {data?.results.map((item: any) => (
              <PosterCard
                key={item.id}
                id={item.id}
                title={mediaType === 'tv' ? item.name : item.title}
                posterPath={item.poster_path}
                voteAverage={item.vote_average}
                releaseDate={mediaType === 'tv' ? item.first_air_date : item.release_date}
                mediaType={mediaType}
              />
            ))}
          </div>

          {/* Pagination */}
          {data && data.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => updateFilter('page', String(Math.max(1, page - 1)))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-sm text-[var(--color-text)] disabled:opacity-50 disabled:cursor-not-allowed hover:border-[var(--color-text-muted)] transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-[var(--color-text-muted)]">
                Page {page} of {data.total_pages}
              </span>
              <button
                onClick={() => updateFilter('page', String(Math.min(data.total_pages, page + 1)))}
                disabled={page >= data.total_pages}
                className="px-4 py-2 rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-sm text-[var(--color-text)] disabled:opacity-50 disabled:cursor-not-allowed hover:border-[var(--color-text-muted)] transition-colors"
              >
                Next
              </button>
            </div>
          )}

          {data?.results.length === 0 && (
            <div className="text-center py-16">
              <p className="text-[var(--color-text-muted)]">No results found. Try adjusting your filters.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
