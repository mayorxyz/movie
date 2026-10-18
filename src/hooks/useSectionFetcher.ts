import { useQuery } from '@tanstack/react-query';
import { useHomeFiltersStore } from '../store/homeFilters';
import type { SectionConfig } from '../config/homeSections';
import type { TmdbFilter } from '../types/filter';
import { tmdbService } from '../services/tmdbClient';
import { site } from '../config/site';
import { filterReleased, shiftYears, today as getToday } from '../lib/releaseFilters';

interface UseSectionFetcherOptions {
  section: SectionConfig;
  activeTab?: string;
  activeDropdown?: string | number;
  enabled?: boolean;
}

/**
 * Recency gate for Classics: keep vote threshold from config, and drop any
 * stragglers newer than windowYears at result level (mocks filtered identically).
 */
function applyRecencyGate(data: unknown[], mediaType: 'movie' | 'tv', section: SectionConfig): unknown[] {
  if (section.id !== 'classics') return data;
  const todayStr = getToday();
  const cutoff = shiftYears(todayStr, -site.settings.recency.windowYears);
  const gate = (filterReleased(data as never[], { requirePoster: false, todayStr }) as Record<string, unknown>[]).filter(
    (item) => {
      const date = (mediaType === 'tv' ? item.first_air_date : item.release_date) as string | undefined;
      if (!date) return false;
      return date <= cutoff && date <= todayStr;
    },
  );
  return gate as unknown[];
}

export function useSectionFetcher({ section, activeTab, activeDropdown, enabled = true }: UseSectionFetcherOptions) {
  const globalFilter = useHomeFiltersStore((state) => state.getGlobalFilter());
  const queryKey = ['section', section.id, activeTab ?? null, activeDropdown ?? null, section.respectsGlobalFilter ? globalFilter : null];
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      let filter: TmdbFilter = { ...(section.fetcher.params ?? {}) };
      if (activeTab && section.tabs) {
        const tab = section.tabs.find((t) => t.id === activeTab);
        if (tab?.filter) filter = { ...filter, ...tab.filter };
      }
      if (activeDropdown !== undefined && section.dropdown) {
        const option = section.dropdown.options.find((o) => String(o.id) === String(activeDropdown));
        if (option?.filter) filter = { ...filter, ...option.filter };
      }
      if (section.respectsGlobalFilter) filter = { ...filter, ...globalFilter };
      // Recency for Latest: sort by release date desc, capped at today (query bound in service).
      if (section.type === 'latest') {
        filter = { ...filter, sort_by: 'primary_release_date.desc' };
      }
      let data: unknown[] = [];
      if (section.type === 'trending') {
        data = await tmdbService.getTrending(activeTab === 'day' ? 'day' : 'week');
      } else if (section.type === 'latest') {
        data = await tmdbService.getLatest(filter.mediaType === 'tv' ? 'tv' : 'movie', filter);
      } else if (section.type === 'topRated') {
        data = await tmdbService.getTopRated(filter.mediaType === 'tv' ? 'tv' : 'movie', filter);
      } else if (section.type === 'bestOf') {
        data = await tmdbService.getDiscoverMixed(filter);
      } else if (section.type === 'genre') {
        data = await tmdbService.getDiscover('movie', filter);
      } else if (section.type === 'curated') {
        if (filter.classics) {
          data = await tmdbService.getClassics(filter.mediaType === 'tv' ? 'tv' : 'movie');
          data = applyRecencyGate(data, filter.mediaType === 'tv' ? 'tv' : 'movie', section);
        } else {
          const personId = Number(filter.personId);
          if (!Number.isFinite(personId)) return [];
          data = await tmdbService.getPersonMovieCredits(personId, filter.personJob === 'Director' ? 'Director' : 'Cast');
        }
      }
      if (section.maxItems && data.length > section.maxItems) data = data.slice(0, section.maxItems);
      return data as Record<string, unknown>[];
    },
    enabled: enabled && section.enabled !== false,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: (failureCount, error) => {
      const status = (error as Error & { status?: number }).status;
      if (status === 429) return failureCount < 1;
      return failureCount < 2;
    },
    placeholderData: (previous) => previous,
  });
  return query;
}
