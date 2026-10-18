import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, X, Clock, Film, Tv, User } from 'lucide-react';
import { tmdbService } from '../../services/tmdbClient';
import { PosterCard } from '../../components/ui/PosterCard';
import { PosterSkeleton } from '../../components/ui/Skeleton';

const RECENT_SEARCHES_KEY = 'cinevault-recent-searches';

function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
  } catch { return []; }
}

function addRecentSearch(query: string) {
  const searches = getRecentSearches().filter(s => s !== query);
  searches.unshift(query);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches.slice(0, 10)));
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(query);
  const [recentSearches, setRecentSearches] = useState<string[]>(getRecentSearches());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => tmdbService.searchMulti(query),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
      addRecentSearch(inputValue.trim());
      setRecentSearches(getRecentSearches());
    }
  };

  const handleRecentClick = (term: string) => {
    setInputValue(term);
    setSearchParams({ q: term });
  };

  const clearSearch = () => {
    setInputValue('');
    setSearchParams({});
    inputRef.current?.focus();
  };

  const movies = data?.results?.filter((r: any) => r.media_type === 'movie') || [];
  const tvShows = data?.results?.filter((r: any) => r.media_type === 'tv') || [];
  const people = data?.results?.filter((r: any) => r.media_type === 'person') || [];

  return (
    <div className="px-4 md:px-8 lg:px-12 max-w-[1920px] mx-auto py-8">
      <h1 className="text-3xl md:text-4xl font-[var(--font-display)] font-bold text-[var(--color-text)] mb-8">
        Search
      </h1>

      {/* Search input */}
      <form onSubmit={handleSubmit} className="relative max-w-2xl mb-8">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Search movies, TV shows, people..."
          className="w-full pl-12 pr-12 py-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] outline-none transition-colors"
        />
        {inputValue && (
          <button type="button" onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            <X className="w-5 h-5" />
          </button>
        )}
      </form>

      {/* Recent searches */}
      {!query && recentSearches.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Recent Searches
          </h2>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term, i) => (
              <button
                key={i}
                onClick={() => handleRecentClick(term)}
                className="px-3 py-1.5 rounded-full bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-text-muted)] transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {query && (
        <div>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <PosterSkeleton key={i} />)}
            </div>
          ) : data?.results?.length === 0 ? (
            <div className="text-center py-16">
              <SearchIcon className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4 opacity-50" />
              <p className="text-[var(--color-text-muted)]">No results found for "{query}"</p>
              <p className="text-sm text-[var(--color-text-muted)] mt-2">Try different keywords or check your spelling</p>
            </div>
          ) : (
            <div className="space-y-10">
              {movies.length > 0 && (
                <section>
                  <h2 className="text-lg font-[var(--font-display)] font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
                    <Film className="w-5 h-5 text-[var(--color-accent)]" /> Movies
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {movies.map((item: any) => (
                      <PosterCard key={item.id} id={item.id} title={item.title || item.name} posterPath={item.poster_path} voteAverage={item.vote_average} releaseDate={item.release_date} mediaType="movie" />
                    ))}
                  </div>
                </section>
              )}
              {tvShows.length > 0 && (
                <section>
                  <h2 className="text-lg font-[var(--font-display)] font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
                    <Tv className="w-5 h-5 text-[var(--color-accent)]" /> TV Shows
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {tvShows.map((item: any) => (
                      <PosterCard key={item.id} id={item.id} title={item.name || item.title} posterPath={item.poster_path} voteAverage={item.vote_average} releaseDate={item.first_air_date} mediaType="tv" />
                    ))}
                  </div>
                </section>
              )}
              {people.length > 0 && (
                <section>
                  <h2 className="text-lg font-[var(--font-display)] font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-[var(--color-accent)]" /> People
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {people.map((person: any) => (
                      <Link key={person.id} to={`/person/${person.id}`} className="group">
                        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[var(--color-surface)] mb-2">
                          <img src={person.profile_path || ''} alt={person.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                        </div>
                        <p className="text-sm font-medium text-[var(--color-text)] truncate group-hover:text-[var(--color-accent)] transition-colors">{person.name}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!query && recentSearches.length === 0 && (
        <div className="text-center py-16">
          <SearchIcon className="w-16 h-16 text-[var(--color-text-muted)] mx-auto mb-4 opacity-30" />
          <p className="text-[var(--color-text-muted)]">Search for movies, TV shows, or people</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-2">Press / to focus the search bar</p>
        </div>
      )}
    </div>
  );
}
