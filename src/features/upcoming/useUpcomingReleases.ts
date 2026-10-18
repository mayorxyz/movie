import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { UpcomingRelease, UpcomingDayGroup, UpcomingType } from './types';
import { getFirstDayOfMonth, getLastDayOfMonth } from './utils';
import { tmdb } from '../../config/tmdb';
import { site } from '../../config/site';
import { tmdbRequest } from '../../services/tmdbClient';
import { today } from '../../lib/releaseFilters';

interface UseUpcomingReleasesOptions {
  month: string;
  type: UpcomingType;
}

interface UseUpcomingReleasesResult {
  releases: UpcomingRelease[];
  dayGroups: UpcomingDayGroup[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Fetch upcoming releases for a given month and type
 * Fetches up to 5 pages sorted by popularity
 * Falls back to US region if primary region returns fewer than minReleasesForFallback
 */
export function useUpcomingReleases({ month, type }: UseUpcomingReleasesOptions): UseUpcomingReleasesResult {
  const primaryRegion = site.region.default;
  const fallbackRegion = site.region.fallback;
  const minReleases = site.settings.minReleasesForFallback;
  const startDate = getFirstDayOfMonth(month);
  const endDate = getLastDayOfMonth(month);

  const query = useQuery({
    queryKey: ['upcoming', month, type],
    queryFn: async () => {
      const allReleases: UpcomingRelease[] = [];
      const maxPages = 5;

      // Fetch movies if type is 'movie' or 'all'
      if (type === 'movie' || type === 'all') {
        const movieReleases = await fetchMoviesForMonth(startDate, endDate, primaryRegion, fallbackRegion, minReleases, maxPages);
        allReleases.push(...movieReleases);
      }

      // Fetch TV shows if type is 'tv' or 'all'
      if (type === 'tv' || type === 'all') {
        const tvReleases = await fetchTvForMonth(startDate, endDate, maxPages);
        allReleases.push(...tvReleases);
      }

      // Filter out items without poster_path
      // Upcoming is exempt from the released filter; use gte of today for the future view.
      const filteredReleases = allReleases.filter(release => release.poster_path !== null);

      // Sort by date then popularity
      filteredReleases.sort((a, b) => {
        const dateA = a.release_date || a.first_air_date || '';
        const dateB = b.release_date || b.first_air_date || '';
        
        // First sort by date
        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;
        
        // Then by popularity (descending)
        return b.popularity - a.popularity;
      });

      return filteredReleases;
    },
    staleTime: tmdb.cache.upcomingCalendar,
    gcTime: tmdb.cache.upcomingCalendar,
    retry: (failureCount, error) => {
      // Retry on 429/5xx up to 2 times
      const status = (error as Error & { status?: number }).status;
      if (error.message === 'RETRY' || status === 429 || (status !== undefined && status >= 500)) {
        return failureCount < 2;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    // On 429, use stale cache if available
    placeholderData: (previousData) => previousData,
  });

  // Group releases by date
  const dayGroups = useMemo<UpcomingDayGroup[]>(() => {
    if (!query.data) return [];

    const groups = new Map<string, UpcomingRelease[]>();

    query.data.forEach(release => {
      const date = release.release_date || release.first_air_date;
      if (!date) return;

      if (!groups.has(date)) {
        groups.set(date, []);
      }
      groups.get(date)!.push(release);
    });

    // Convert to array and sort by date
    return Array.from(groups.entries())
      .map(([date, releases]) => ({ date, releases }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [query.data]);

  return {
    releases: query.data || [],
    dayGroups,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

/**
 * Fetch movies for a given date range with region fallback
 * Uses with_release_type=2|3|4 (Theatrical limited, Theatrical, Digital)
 */
async function fetchMoviesForMonth(
  startDate: string,
  endDate: string,
  primaryRegion: string,
  fallbackRegion: string,
  minReleases: number,
  maxPages: number
): Promise<UpcomingRelease[]> {
  // Try primary region first
  let allMovies = await fetchMoviesForRegion(startDate, endDate, primaryRegion, maxPages);
  
  // If fewer than minReleases, try fallback region
  if (allMovies.length < minReleases && primaryRegion !== fallbackRegion) {
    const fallbackMovies = await fetchMoviesForRegion(startDate, endDate, fallbackRegion, maxPages);
    
    // Merge results, avoiding duplicates by ID
    const movieIds = new Set(allMovies.map(m => m.id));
    fallbackMovies.forEach(movie => {
      if (!movieIds.has(movie.id)) {
        allMovies.push(movie);
        movieIds.add(movie.id);
      }
    });
  }

  return allMovies;
}

/**
 * Fetch movies for a specific region
 */
async function fetchMoviesForRegion(
  startDate: string,
  endDate: string,
  region: string,
  maxPages: number
): Promise<UpcomingRelease[]> {
  const allMovies: UpcomingRelease[] = [];
  const todayStr = today();
  // Future view: clamp the lower bound to today so past titles never leak in.
  const gte = startDate < todayStr ? todayStr : startDate;

  for (let page = 1; page <= maxPages; page++) {
    const result = await tmdbRequest<{ results: any[] }>(tmdb.endpoints.discover.movie, {
      region,
      with_release_type: '2|3|4',
      'release_date.gte': gte,
      'release_date.lte': endDate,
      sort_by: 'popularity.desc',
      page,
    });

    if (!result.results || result.results.length === 0) {
      break; // No more results
    }

    const movies: UpcomingRelease[] = result.results.map((movie: any) => ({
      id: movie.id,
      media_type: 'movie' as const,
      title: movie.title,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      overview: movie.overview,
      genre_ids: movie.genre_ids,
      popularity: movie.popularity,
    }));

    allMovies.push(...movies);

    // If we got fewer results than expected, we've reached the end
    if (result.results.length < 20) {
      break;
    }
  }

  return allMovies;
}

/**
 * Fetch TV shows for a given date range
 * Uses first_air_date.gte/lte (not with_first_air_date)
 */
async function fetchTvForMonth(
  startDate: string,
  endDate: string,
  maxPages: number
): Promise<UpcomingRelease[]> {
  const allShows: UpcomingRelease[] = [];
  const todayStr = today();
  const gte = startDate < todayStr ? todayStr : startDate;

  for (let page = 1; page <= maxPages; page++) {
    const result = await tmdbRequest<{ results: any[] }>(tmdb.endpoints.discover.tv, {
      'first_air_date.gte': gte,
      'first_air_date.lte': endDate,
      sort_by: 'popularity.desc',
      page,
    });

    if (!result.results || result.results.length === 0) {
      break; // No more results
    }

    const shows: UpcomingRelease[] = result.results.map((show: any) => ({
      id: show.id,
      media_type: 'tv' as const,
      title: show.name,
      poster_path: show.poster_path,
      backdrop_path: show.backdrop_path,
      first_air_date: show.first_air_date,
      vote_average: show.vote_average,
      overview: show.overview,
      genre_ids: show.genre_ids,
      popularity: show.popularity,
    }));

    allShows.push(...shows);

    // If we got fewer results than expected, we've reached the end
    if (result.results.length < 20) {
      break;
    }
  }

  return allShows;
}
