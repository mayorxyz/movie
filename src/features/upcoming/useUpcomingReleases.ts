import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { UpcomingRelease, UpcomingDayGroup, UpcomingType } from './types';
import { getFirstDayOfMonth, getLastDayOfMonth } from './utils';
import { tmdb } from '../../config/tmdb';
import { site } from '../../config/site';

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
 */
export function useUpcomingReleases({ month, type }: UseUpcomingReleasesOptions): UseUpcomingReleasesResult {
  const region = site.region.default;
  const startDate = getFirstDayOfMonth(month);
  const endDate = getLastDayOfMonth(month);

  const query = useQuery({
    queryKey: ['upcoming', month, type, region],
    queryFn: async () => {
      const allReleases: UpcomingRelease[] = [];
      const maxPages = 5;

      // Fetch movies if type is 'movie' or 'all'
      if (type === 'movie' || type === 'all') {
        const movieReleases = await fetchMoviesForMonth(startDate, endDate, region, maxPages);
        allReleases.push(...movieReleases);
      }

      // Fetch TV shows if type is 'tv' or 'all'
      if (type === 'tv' || type === 'all') {
        const tvReleases = await fetchTvForMonth(startDate, endDate, region, maxPages);
        allReleases.push(...tvReleases);
      }

      // Filter out items without poster_path
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
      if (error.message === 'RETRY') return failureCount < 2;
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
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
 * Fetch movies for a given date range
 */
async function fetchMoviesForMonth(
  startDate: string,
  endDate: string,
  region: string,
  maxPages: number
): Promise<UpcomingRelease[]> {
  const allMovies: UpcomingRelease[] = [];

  for (let page = 1; page <= maxPages; page++) {
    const params = new URLSearchParams({
      'region': region,
      'with_release_type': '2|3', // Theatrical and Digital
      'release_date.gte': startDate,
      'release_date.lte': endDate,
      'sort_by': 'popularity.desc',
      'page': page.toString(),
    });

    const response = await fetch(`${tmdb.baseUrl}${tmdb.endpoints.discover.movie}?${params}`);

    if (!response.ok) {
      if (response.status === 429 || response.status >= 500) {
        throw new Error('RETRY');
      }
      throw new Error('FETCH_ERROR');
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      break; // No more results
    }

    const movies: UpcomingRelease[] = data.results.map((movie: any) => ({
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
    if (data.results.length < 20) {
      break;
    }
  }

  return allMovies;
}

/**
 * Fetch TV shows for a given date range
 */
async function fetchTvForMonth(
  startDate: string,
  endDate: string,
  region: string,
  maxPages: number
): Promise<UpcomingRelease[]> {
  const allShows: UpcomingRelease[] = [];

  for (let page = 1; page <= maxPages; page++) {
    const params = new URLSearchParams({
      'with_first_air_date.gte': startDate,
      'with_first_air_date.lte': endDate,
      'sort_by': 'popularity.desc',
      'page': page.toString(),
    });

    const response = await fetch(`${tmdb.baseUrl}${tmdb.endpoints.discover.tv}?${params}`);

    if (!response.ok) {
      if (response.status === 429 || response.status >= 500) {
        throw new Error('RETRY');
      }
      throw new Error('FETCH_ERROR');
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      break; // No more results
    }

    const shows: UpcomingRelease[] = data.results.map((show: any) => ({
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
    if (data.results.length < 20) {
      break;
    }
  }

  return allShows;
}
