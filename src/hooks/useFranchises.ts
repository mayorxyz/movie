import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { filterReleased } from '../lib/releaseFilters';
import type { SectionConfig } from '../config/homeSections';
import { tmdbService } from '../services/tmdbClient';
import type { FranchiseSummary } from '../components/ui/FranchiseCard';

/** Loads the curated franchises for a section, summarising each collection. */
export function useFranchises(section: SectionConfig, enabled = true) {
  const ids = useMemo(() => (section.collections ?? []).map((c) => c.id), [section]);
  return useQuery({
    queryKey: ['section', section.id, 'collections', ids],
    queryFn: async (): Promise<FranchiseSummary[]> => {
      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            const collection = await tmdbService.getCollection(id);
            const parts = filterReleased(collection.parts ?? [], { requirePoster: false });
            const years = parts
              .map((p) => (p.release_date ? new Date(p.release_date).getFullYear() : NaN))
              .filter((y) => Number.isFinite(y))
              .sort((a, b) => a - b);
            const ratings = parts.map((p) => p.vote_average ?? 0).filter((r) => r > 0);
            return {
              id: collection.id,
              name: collection.name,
              titleCount: parts.length,
              yearRange: years.length > 0 ? `${years[0]}–${years[years.length - 1]}` : '',
              averageRating: ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0,
              posters: parts.slice(0, 3).map((p) => p.poster_path),
            } satisfies FranchiseSummary;
          } catch {
            return null;
          }
        }),
      );
      return results.filter((r: FranchiseSummary | null): r is FranchiseSummary => r !== null);
    },
    enabled: enabled && section.enabled !== false,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    placeholderData: (previous) => previous,
  });
}
