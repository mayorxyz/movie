import { useQuery } from '@tanstack/react-query';
import { useHomeFiltersStore } from '../store/homeFilters';
import type { SectionConfig } from '../config/homeSections';
import type { TmdbFilter } from '../types/filter';
import { tmdbService } from '../services/tmdbClient';

// Concurrency limiter for section fetches
const concurrencyLimiter = {
  maxConcurrent: 3,
  active: 0,
  queue: [] as Array<() => void>,
  
  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.active >= this.maxConcurrent) {
      await new Promise<void>(resolve => this.queue.push(resolve));
    }
    this.active++;
    try {
      return await fn();
    } finally {
      this.active--;
      const next = this.queue.shift();
      if (next) next();
    }
  },
};

interface UseSectionFetcherOptions {
  section: SectionConfig;
  activeTab?: string;
  activeDropdown?: string | number;
  enabled?: boolean;
}

export function useSectionFetcher({ section, activeTab, activeDropdown, enabled = true }: UseSectionFetcherOptions) {
  const globalFilter = useHomeFiltersStore(state => state.getGlobalFilter());

  // Build query key
  const queryKey = [
    'section',
    section.id,
    activeTab,
    activeDropdown,
    section.respectsGlobalFilter ? globalFilter : null,
  ];

  // Merge filters
  const buildFilter = (): TmdbFilter => {
    let filter: TmdbFilter = {};

    // Start with section default params
    if (section.fetcher.params) {
      filter = { ...filter, ...section.fetcher.params };
    }

    // Apply tab filter if active
    if (activeTab && section.tabs) {
      const tab = section.tabs.find(t => t.id === activeTab);
      if (tab?.filter) {
        filter = { ...filter, ...tab.filter };
      }
    }

    // Apply dropdown filter if active
    if (activeDropdown !== undefined && section.dropdown) {
      const option = section.dropdown.options.find(o => o.id === activeDropdown);
      if (option?.filter) {
        filter = { ...filter, ...option.filter };
      }
    }

    // Apply global filter if section respects it
    if (section.respectsGlobalFilter) {
      filter = { ...filter, ...globalFilter };
    }

    return filter;
  };

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const filter = buildFilter();
      
      // Fetch data based on section type
      let data: any[] = [];

      if (section.type === 'trending') {
        const window = activeTab === 'day' ? 'day' : 'week';
        data = await concurrencyLimiter.run(() => 
          tmdbService.getTrending(window as 'day' | 'week')
        );
      } else if (section.type === 'latest') {
        const mediaType = filter.mediaType || 'movie';
        data = await concurrencyLimiter.run(() => 
          tmdbService.getLatest(mediaType as 'movie' | 'tv', filter)
        );
      } else if (section.type === 'topRated') {
        const mediaType = filter.mediaType || 'movie';
        data = await concurrencyLimiter.run(() => 
          tmdbService.getTopRated(mediaType as 'movie' | 'tv', filter)
        );
      } else if (section.type === 'bestOf') {
        data = await concurrencyLimiter.run(() => 
          tmdbService.getBestOf(filter)
        );
      } else if (section.type === 'genre' || section.type === 'curated') {
        const mediaType = filter.mediaType || 'movie';
        data = await concurrencyLimiter.run(() => 
          tmdbService.getDiscover(mediaType as 'movie' | 'tv', filter)
        );
      }

      // Apply maxItems limit
      if (section.maxItems && data.length > section.maxItems) {
        data = data.slice(0, section.maxItems);
      }

      return data;
    },
    enabled: enabled && section.enabled !== false,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return query;
}
