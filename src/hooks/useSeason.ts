import { useQuery } from '@tanstack/react-query';
import { tmdb } from '../config/tmdb';
import type { Season } from '../types';

interface UseSeasonOptions {
  seriesId: number;
  seasonNumber: number;
  seriesStatus?: string;
  enabled?: boolean;
}

export function useSeason({ seriesId, seasonNumber, seriesStatus, enabled = true }: UseSeasonOptions) {
  const isOngoing = seriesStatus === 'Returning Series' || seriesStatus === 'In Production';
  const staleTime = isOngoing ? tmdb.cache.seasonDataOngoing : tmdb.cache.seasonData;

  return useQuery<Season>({
    queryKey: ['tv', seriesId, 'season', seasonNumber],
    queryFn: async () => {
      const response = await fetch(
        `${tmdb.baseUrl}${tmdb.endpoints.tvSeason(seriesId, seasonNumber)}?language=en-US`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('NOT_FOUND');
        }
        if (response.status === 429 || response.status >= 500) {
          throw new Error('RETRY');
        }
        throw new Error('FETCH_ERROR');
      }

      const data = await response.json();
      return data;
    },
    staleTime,
    gcTime: staleTime,
    enabled: enabled && seasonNumber >= 0,
    retry: (failureCount, error) => {
      // Never retry on 404
      if (error.message === 'NOT_FOUND') return false;
      // Retry on 429/5xx up to 2 times
      if (error.message === 'RETRY') return failureCount < 2;
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}
