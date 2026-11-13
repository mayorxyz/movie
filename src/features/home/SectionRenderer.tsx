import { useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import type { SectionConfig } from '../../config/homeSections';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { SegmentedTabs } from '../../components/ui/SegmentedTabs';
import { DropdownSelect } from '../../components/ui/DropdownSelect';
import { ContentRow } from '../../components/ui/ContentRow';
import { RecommendationsBanner } from '../../components/ui/RecommendationsBanner';
import { FranchiseCard, FranchiseSkeleton } from '../../components/ui/FranchiseCard';
import { PosterSkeleton } from '../../components/ui/Skeleton';
import { useSectionFetcher } from '../../hooks/useSectionFetcher';
import { useSectionParam } from '../../hooks/useSectionParam';
import { useInViewport } from '../../hooks/useInViewport';
import { useFranchises } from '../../hooks/useFranchises';

export interface SectionRendererProps {
  section: SectionConfig;
  eager?: boolean;
}

/** URL of the full-list page for a section, preserving the active tab/dropdown. */
export function sectionHref(section: SectionConfig, value?: string | number): string {
  const base = `/section/${section.id}`;
  return value === undefined ? base : `${base}?${section.id}=${encodeURIComponent(String(value))}`;
}

function SectionShell({
  title,
  titleHref,
  control,
  children,
}: {
  title: string;
  titleHref?: string;
  control?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="py-3.5 sm:py-5 md:py-7">
      <SectionHeader title={title} titleHref={titleHref}>
        {control}
      </SectionHeader>
      {children}
    </section>
  );
}

function SectionError({ label, onRetry }: { label: string; onRetry: () => void }) {
  return (
    <div className="px-4 md:px-8 lg:px-12 py-5 md:py-7 text-center">
      <p className="text-[var(--color-text-muted)] mb-2.5 md:mb-3 text-xs md:text-sm">
        Failed to load {label}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 px-4 md:px-5 h-9 md:h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-xs md:text-sm font-medium text-[var(--color-text)] active:scale-95 hover:border-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] transition-all duration-150 touch-manipulation"
      >
        <RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4" />
        Retry
      </button>
    </div>
  );
}

function TabbedSection({ section, eager }: { section: SectionConfig; eager: boolean }) {
  const tabs = section.tabs ?? [];
  const validTabs = useMemo(() => tabs.map((t) => t.id), [tabs]);
  const [activeTab, setActiveTab] = useSectionParam(
    section.id,
    validTabs,
    section.defaultTab ?? validTabs[0] ?? '',
  );
  const { ref, visible } = useInViewport<HTMLDivElement>(eager);
  const query = useSectionFetcher({ section, activeTab, enabled: visible });

  return (
    <SectionShell
      title={section.title}
      titleHref={sectionHref(section, tabs.length > 0 ? activeTab : undefined)}
      control={
        tabs.length > 0 ? (
          <div className="w-full min-w-0 overflow-x-auto no-scrollbar max-w-full md:w-auto -mx-4 px-4 md:mx-0 md:px-0">
            <SegmentedTabs
              tabs={tabs.map(({ id, label }) => ({ id, label }))}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>
        ) : undefined
      }
    >
      <div ref={ref}>
        <ContentRow
          section={section}
          items={query.data?.items ?? null}
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
      titleHref={sectionHref(section, options.length > 0 ? activeValue : undefined)}
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
          items={query.data?.items ?? null}
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
  const query = useFranchises(section, visible);

  const data = query.data ?? [];
  return (
    <SectionShell title={section.title} titleHref={sectionHref(section)}>
      <div ref={ref} className="relative">
        {(!visible || query.isLoading) && (
          <div className="flex gap-2.5 md:gap-3 overflow-hidden px-4 md:px-8 lg:px-12" aria-label="Loading franchises">
            {Array.from({ length: 4 }).map((_, i) => (
              <FranchiseSkeleton key={i} />
            ))}
          </div>
        )}
        {visible && query.isError && <SectionError label={section.title} onRetry={() => query.refetch()} />}
        {visible && !query.isLoading && !query.isError && data.length === 0 && (
          <div className="px-4 md:px-8 lg:px-12 py-5 md:py-7 text-center">
            <p className="text-[var(--color-text-muted)] text-xs md:text-sm">No results found</p>
          </div>
        )}
        {visible && !query.isLoading && !query.isError && data.length > 0 && (
          <div className="rail-scroll flex gap-2.5 md:gap-3 overflow-x-auto snap-x snap-mandatory scroll-pl-4 md:scroll-pl-8 lg:scroll-pl-12 px-4 md:px-8 lg:px-12 pb-1.5 scrollbar-none [overflow-scrolling:touch]">
            {data.map((f) => (
              <div key={f.id} className="snap-start shrink-0">
                <FranchiseCard franchise={f} />
              </div>
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

export function SectionRenderer({ section, eager = false }: SectionRendererProps) {
  if (
    section.type === 'trending' ||
    section.type === 'latest' ||
    section.type === 'topRated' ||
    section.type === 'fresh'
  ) {
    return <TabbedSection section={section} eager={eager} />;
  }
  if (section.type === 'bestOf' || section.type === 'genre') {
    return <DropdownSection section={section} eager={eager} />;
  }
  if (section.type === 'curated') {
    return section.tabs ? (
      <TabbedSection section={section} eager={eager} />
    ) : (
      <DropdownSection section={section} eager={eager} />
    );
  }
  if (section.type === 'franchises') {
    return <FranchisesSection section={section} eager={eager} />;
  }
  if (section.type === 'recommendations') {
    return <RecommendationsSection section={section} />;
  }
  return null;
}

export function SectionSkeleton({ variant }: { variant: 'poster' | 'wideRank' | 'franchise' }) {
  if (variant === 'franchise') {
    return (
      <div className="flex gap-2.5 md:gap-3 overflow-hidden px-4 md:px-8 lg:px-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <FranchiseSkeleton key={i} />
        ))}
      </div>
    );
  }
  const count = variant === 'wideRank' ? 3 : 6;
  return (
    <div className="flex gap-2.5 md:gap-3 overflow-hidden px-4 md:px-8 lg:px-12">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={
            variant === 'wideRank'
              ? 'flex-shrink-0 w-[240px] sm:w-[320px] md:w-[460px] lg:w-[500px] aspect-[16/10]'
              : 'flex-shrink-0 w-[112px] sm:w-[140px] md:w-[165px] lg:w-[180px]'
          }
        >
          <PosterSkeleton />
        </div>
      ))}
    </div>
  );
}
