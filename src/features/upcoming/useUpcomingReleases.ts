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
 * Fetch upcoming releases for a given month and type.
 * Strictly filters out any releases that have already passed.
 */
export function useUpcomingReleases({ month, type }: UseUpcomingReleasesOptions): UseUpcomingReleasesResult {
  const primaryRegion = site.region.default;
  const fallbackRegion = site.region.fallback;
  const minReleases = site.settings.minReleasesForFallback;
  const startDate = getFirstDayOfMonth(month);
  const endDate = getLastDayOfMonth(month);
  const todayStr = today(); // e.g., '2026-11-13'

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

      // STRICT CLIENT-SIDE FILTER:
      // 1. Must have a poster
      // 2. Must have a valid release/air date
      // 3. Date MUST be today or in the future (no past releases)
      const filteredReleases = allReleases.filter(release => {
        if (!release.poster_path) return false;
        
        const releaseDate = release.release_date || release.first_air_date;
        if (!releaseDate) return false;
        
        // String comparison works perfectly for 'YYYY-MM-DD' format
        return releaseDate >= todayStr;
      });

      // Sort by date (ascending), then by popularity (descending)
      filteredReleases.sort((a, b) => {
        const dateA = a.release_date || a.first_air_date || '';
        const dateB = b.release_date || b.first_air_date || '';
        
        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;
        
        return b.popularity - a.popularity;
      });

      return filteredReleases;
    },
    staleTime: tmdb.cache.upcomingCalendar,
    gcTime: tmdb.cache.upcomingCalendar,
    retry: (failureCount, error) => {
      const status = (error as Error & { status?: number }).status;
      if (error.message === 'RETRY' || status === 429 || (status !== undefined && status >= 500)) {
        return failureCount < 2;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
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
 */
async function fetchMoviesForMonth(
  startDate: string,
  endDate: string,
  primaryRegion: string,
  fallbackRegion: string,
  minReleases: number,
  maxPages: number
): Promise<UpcomingRelease[]> {
  let allMovies = await fetchMoviesForRegion(startDate, endDate, primaryRegion, maxPages);
  
  if (allMovies.length < minReleases && primaryRegion !== fallbackRegion) {
    const fallbackMovies = await fetchMoviesForRegion(startDate, endDate, fallbackRegion, maxPages);
    
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
  // Clamp the lower bound to today so the API doesn't waste cycles on past titles
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

    if (!result.results || result.results.length === 0) break;

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

    if (result.results.length < 20) break;
  }

  return allMovies;
}

/**
 * Fetch TV shows for a given date range
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

    if (!result.results || result.results.length === 0) break;

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

    if (result.results.length < 20) break;
  }

  return allShows;
}