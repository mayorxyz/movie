import { useQuery } from '@tanstack/react-query';
import { useHomeFiltersStore } from '../store/homeFilters';
import type { SectionConfig } from '../config/homeSections';
import type { TmdbFilter } from '../types/filter';
import { tmdbService } from '../services/tmdbClient';
import { site } from '../config/site';
import { filterReleased, shiftYears, today as getToday } from '../lib/releaseFilters';

/** Items per page on the full-list section page. */
const PAGE_SIZE = 24;

interface UseSectionFetcherOptions {
  section: SectionConfig;
  activeTab?: string;
  activeDropdown?: string | number;
  enabled?: boolean;
  /** Page number (1-based). Supplying it enables paginated mode for the section page. */
  page?: number;
}

export interface SectionFetchResult {
  items: Record<string, unknown>[];
  totalPages: number;
}

/**
 * Recency gate for Classics: drop anything newer than windowYears or unposted.
 */
function applyRecencyGate(data: unknown[], mediaType: 'movie' | 'tv', section: SectionConfig): unknown[] {
  if (section.id !== 'classics') return data;
  const todayStr = getToday();
  const cutoff = shiftYears(todayStr, -site.settings.recency.windowYears);
  const gate = (filterReleased(data as never[], { requirePoster: true, todayStr }) as Record<string, unknown>[]).filter(
    (item) => {
      const date = (mediaType === 'tv' ? item.first_air_date : item.release_date) as string | undefined;
      if (!date) return false;
      return date <= cutoff && date <= todayStr;
    },
  );
  return gate as unknown[];
}

/** Drops items already shown earlier in the same row (same id + media type). */
function uniqueItems(data: Record<string, unknown>[]): Record<string, unknown>[] {
  const seen = new Set<string>();
  return data.filter((item) => {
    const key = `${String(item.media_type ?? '')}-${String(item.id)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function useSectionFetcher({ section, activeTab, activeDropdown, enabled = true, page }: UseSectionFetcherOptions) {
  const globalFilter = useHomeFiltersStore((state) => state.getGlobalFilter());
  const paginated = page !== undefined;
  const queryKey = [
    'section',
    section.id,
    activeTab ?? null,
    activeDropdown ?? null,
    section.respectsGlobalFilter ? globalFilter : null,
    paginated ? page : null,
  ];
  const query = useQuery<SectionFetchResult>({
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
      const mediaType: 'movie' | 'tv' = filter.mediaType === 'tv' ? 'tv' : 'movie';
      const pageArg = paginated ? page : undefined;
      let data: unknown[] = [];
      let totalPages = 1;

      if (section.type === 'trending') {
        data = activeTab === 'month'
          ? await tmdbService.getTrendingThisMonth()
          : await tmdbService.getTrending(activeTab === 'day' ? 'day' : 'week');
        if (paginated) {
          totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
          data = data.slice((pageArg! - 1) * PAGE_SIZE, pageArg! * PAGE_SIZE);
        }
      } else if (section.type === 'latest') {
        const response = filter.mediaType === 'asian'
          ? await tmdbService.getLatestMixed(filter, pageArg)
          : await tmdbService.getLatest(mediaType, filter, pageArg);
        data = response.results;
        totalPages = response.totalPages;
      } else if (section.type === 'fresh') {
        const response = await tmdbService.getFreshThisYear(pageArg);
        data = response.results;
        totalPages = response.totalPages;
      } else if (section.type === 'topRated') {
        const response = filter.mediaType === 'asian'
          ? await tmdbService.getDiscoverMixed({ ...filter, sort_by: 'vote_average.desc', 'vote_count.gte': 500 }, pageArg)
          : await tmdbService.getTopRated(mediaType, filter, pageArg);
        data = response.results;
        totalPages = response.totalPages;
      } else if (section.type === 'bestOf') {
        const response = await tmdbService.getDiscoverMixed(filter, pageArg);
        data = response.results;
        totalPages = response.totalPages;
      } else if (section.type === 'genre') {
        const response = await tmdbService.getDiscover(mediaType, filter, pageArg);
        data = response.results;
        totalPages = response.totalPages;
      } else if (section.type === 'curated') {
        if (filter.classics) {
          const response = await tmdbService.getClassics(mediaType, {}, pageArg);
          data = applyRecencyGate(response.results, mediaType, section);
          totalPages = response.totalPages;
        } else {
          const personId = Number(filter.personId);
          if (!Number.isFinite(personId)) return { items: [], totalPages: 1 };
          data = await tmdbService.getPersonMovieCredits(personId, filter.personJob === 'Director' ? 'Director' : 'Cast');
          if (paginated) {
            totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
            data = data.slice((pageArg! - 1) * PAGE_SIZE, pageArg! * PAGE_SIZE);
          }
        }
      }

      let items = uniqueItems(data as Record<string, unknown>[]);
      if (!paginated && section.maxItems && items.length > section.maxItems) items = items.slice(0, section.maxItems);
      return { items, totalPages };
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
