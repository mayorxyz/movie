import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { filterReleased } from '../../lib/releaseFilters';
import type { SectionConfig } from '../../config/homeSections';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { SegmentedTabs } from '../../components/ui/SegmentedTabs';
import { DropdownSelect } from '../../components/ui/DropdownSelect';
import { ContentRow } from '../../components/ui/ContentRow';
import { RecommendationsBanner } from '../../components/ui/RecommendationsBanner';
import { FranchiseCard, FranchiseSkeleton, type FranchiseSummary } from '../../components/ui/FranchiseCard';
import { PosterSkeleton } from '../../components/ui/Skeleton';
import { useSectionFetcher } from '../../hooks/useSectionFetcher';
import { useSectionParam } from '../../hooks/useSectionParam';
import { useInViewport } from '../../hooks/useInViewport';
import { tmdbService } from '../../services/tmdbClient';

export interface SectionRendererProps {
  section: SectionConfig;
  eager?: boolean;
  onLoadMore?: () => void;
  loadMoreRemaining?: number;
}

function SectionShell({ title, seeAllLink, control, children }: {
  title: string;
  seeAllLink?: string;
  control?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="py-8">
      <SectionHeader title={title} seeAllLink={seeAllLink}>
        {control}
      </SectionHeader>
      {children}
    </section>
  );
}

function SectionError({ label, onRetry }: { label: string; onRetry: () => void }) {
  return (
    <div className="px-4 md:px-8 lg:px-12 py-8 text-center">
      <p className="text-[var(--color-text-muted)] mb-4">Failed to load {label}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-sm text-[var(--color-text)] hover:border-[var(--color-text-muted)] transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Retry
      </button>
    </div>
  );
}

function TabbedSection({ section, eager }: { section: SectionConfig; eager: boolean }) {
  const tabs = section.tabs ?? [];
  const validTabs = useMemo(() => tabs.map((t) => t.id), [tabs]);
  const [activeTab, setActiveTab] = useSectionParam(section.id, validTabs, section.defaultTab ?? validTabs[0] ?? '');
  const { ref, visible } = useInViewport<HTMLDivElement>(eager);
  const query = useSectionFetcher({ section, activeTab, enabled: visible });

  return (
    <SectionShell
      title={section.title}
      seeAllLink={section.seeAllLink}
      control={
        tabs.length > 0 ? (
          <SegmentedTabs tabs={tabs.map(({ id, label }) => ({ id, label }))} activeTab={activeTab} onChange={setActiveTab} />
        ) : undefined
      }
    >
      <div ref={ref}>
        <ContentRow
          section={section}
          items={(query.data as Record<string, unknown>[] | undefined) ?? null}
          loading={!visible || query.isLoading}
          error={query.isError}
          onRetry={() => query.refetch()}
        />
      </div>
    </SectionShell>
  );
}

function DropdownSection({ section, eager }: { section: SectionConfig; eager: boolean }) {
  const options = section.dropdown?.options ?? [];
  const validOptions = useMemo(() => options.map((o) => o.id), [options]);
  const defaultOption = section.dropdown?.defaultOption ?? validOptions[0] ?? '';
  const [active, setActive] = useSectionParam(section.id, validOptions, defaultOption);
  const numeric = options.length > 0 && typeof options[0].id === 'number';
  const activeValue: string | number = numeric ? Number(active) : active;
  const { ref, visible } = useInViewport<HTMLDivElement>(eager);
  const query = useSectionFetcher({ section, activeDropdown: activeValue, enabled: visible });

  return (
    <SectionShell
      title={section.title}
      seeAllLink={section.seeAllLink}
      control={
        section.dropdown ? (
          <DropdownSelect
            label={section.dropdown.label}
            options={options.map(({ id, label }) => ({ id, label }))}
            value={activeValue}
            onChange={setActive}
          />
        ) : undefined
      }
    >
      <div ref={ref}>
        <ContentRow
          section={section}
          items={(query.data as Record<string, unknown>[] | undefined) ?? null}
          loading={!visible || query.isLoading}
          error={query.isError}
          onRetry={() => query.refetch()}
        />
      </div>
    </SectionShell>
  );
}

function FranchisesSection({ section, eager }: { section: SectionConfig; eager: boolean }) {
  const { ref, visible } = useInViewport<HTMLDivElement>(eager);
  const ids = useMemo(() => (section.collections ?? []).map((c) => c.id), [section]);
  const query = useQuery({
    queryKey: ['section', section.id, 'collections', ids],
    queryFn: async (): Promise<FranchiseSummary[]> => {
      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            const collection = await tmdbService.getCollection(id);
            // Service already result-filters unreleased parts; re-filter identically for mocks.
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
    enabled: visible && section.enabled !== false,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    placeholderData: (previous) => previous,
  });

  const data = query.data ?? [];
  return (
    <SectionShell title={section.title} seeAllLink={section.seeAllLink}>
      <div ref={ref} className="relative">
        {(!visible || query.isLoading) && (
          <div className="flex gap-3 overflow-hidden px-4 md:px-8 lg:px-12" aria-label="Loading franchises">
            {Array.from({ length: 4 }).map((_, i) => (
              <FranchiseSkeleton key={i} />
            ))}
          </div>
        )}
        {visible && query.isError && <SectionError label={section.title} onRetry={() => query.refetch()} />}
        {visible && !query.isLoading && !query.isError && data.length === 0 && (
          <div className="px-4 md:px-8 lg:px-12 py-8 text-center">
            <p className="text-[var(--color-text-muted)]">No results found</p>
          </div>
        )}
        {visible && !query.isLoading && !query.isError && data.length > 0 && (
          <div className="rail-scroll flex gap-3 overflow-x-auto px-4 md:px-8 lg:px-12 pb-2">
            {data.map((f) => (
              <FranchiseCard key={f.id} franchise={f} />
            ))}
          </div>
        )}
      </div>
    </SectionShell>
  );
}
function RecommendationsSection({ section }: { section: SectionConfig }) {
  return (
    <SectionShell title={section.title}>
      <RecommendationsBanner />
    </SectionShell>
  );
}

function LoadMoreSection({ section, onLoadMore, remaining }: {
  section: SectionConfig;
  onLoadMore?: () => void;
  remaining: number;
}) {
  if (remaining <= 0) return null;
  return (
    <div className="px-4 md:px-8 lg:px-12 py-8 text-center">
      <button
        onClick={onLoadMore}
        className="px-6 py-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
      >
        Load more ({remaining} remaining)
      </button>
      <span className="sr-only">{section.title}</span>
    </div>
  );
}

export function SectionRenderer({ section, eager = false, onLoadMore, loadMoreRemaining = 0 }: SectionRendererProps) {
  if (section.type === 'trending' || section.type === 'latest' || section.type === 'topRated') {
    return <TabbedSection section={section} eager={eager} />;
  }
  if (section.type === 'bestOf' || section.type === 'genre' || section.type === 'curated') {
    return <DropdownSection section={section} eager={eager} />;
  }
  if (section.type === 'franchises') {
    return <FranchisesSection section={section} eager={eager} />;
  }
  if (section.type === 'recommendations') {
    return <RecommendationsSection section={section} />;
  }
  if (section.type === 'loadMore') {
    return <LoadMoreSection section={section} onLoadMore={onLoadMore} remaining={loadMoreRemaining} />;
  }
  return null;
}

export function SectionSkeleton({ variant }: { variant: 'poster' | 'wideRank' | 'franchise' }) {
  if (variant === 'franchise') {
    return (
      <div className="flex gap-3 overflow-hidden px-4 md:px-8 lg:px-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <FranchiseSkeleton key={i} />
        ))}
      </div>
    );
  }
  const count = variant === 'wideRank' ? 3 : 6;
  return (
    <div className="flex gap-3 overflow-hidden px-4 md:px-8 lg:px-12">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={
            variant === 'wideRank'
              ? 'flex-shrink-0 w-[400px] md:w-[500px] aspect-[16/10]'
              : 'flex-shrink-0 w-[140px] md:w-[180px]'
          }
        >
          <PosterSkeleton />
        </div>
      ))}
    </div>
  );
}

