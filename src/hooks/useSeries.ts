import { useQuery } from '@tanstack/react-query';
import { tmdb } from '../config/tmdb';
import { features } from '../config/features';
import { site } from '../config/site';
import type { TvSeries } from '../types';

interface UseSeriesOptions {
  id: number;
}

export function useSeries({ id }: UseSeriesOptions) {
  // Build append_to_response based on feature flags
  const appendToResponse: string[] = [];
  if (features.trailers) appendToResponse.push('videos');
  if (features.watchProviders) appendToResponse.push('watch/providers');
  appendToResponse.push('aggregate_credits', 'similar', 'content_ratings', 'keywords');

  return useQuery<TvSeries>({
    queryKey: ['tv', id],
    queryFn: async () => {
      const response = await fetch(
        `${tmdb.baseUrl}${tmdb.endpoints.tvDetails(id)}?append_to_response=${appendToResponse.join(',')}&language=en-US`
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
    staleTime: 60 * 60 * 1000, // 1 hour default
    gcTime: 60 * 60 * 1000,
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
