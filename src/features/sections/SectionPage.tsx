import { useEffect, useState, type ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, SearchX } from 'lucide-react';
import { homeConfig, type SectionConfig } from '../../config/homeSections';
import { PosterCard } from '../../components/ui/PosterCard';
import { PosterSkeleton } from '../../components/ui/Skeleton';
import { FranchiseCard } from '../../components/ui/FranchiseCard';
import { SegmentedTabs } from '../../components/ui/SegmentedTabs';
import { DropdownSelect } from '../../components/ui/DropdownSelect';
import { useSectionFetcher } from '../../hooks/useSectionFetcher';
import { useSectionParam } from '../../hooks/useSectionParam';
import { useFranchises } from '../../hooks/useFranchises';

const GRID =
  'grid grid-cols-2 min-[420px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-6 md:gap-x-5 md:gap-y-7';
const FRANCHISE_GRID = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4';

const pageBtn =
  'w-8 h-8 md:w-10 md:h-10 inline-flex items-center justify-center rounded-full text-[12px] md:text-[14px] font-medium tabular-nums transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:opacity-40 disabled:cursor-not-allowed';

function getPages(page: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) pages.push('…');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('…');
  pages.push(total);
  return pages;
}

type Item = Record<string, unknown> & {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  poster_path?: string | null;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
};

function fallbackMediaType(section: SectionConfig): 'movie' | 'tv' {
  if (section.fetcher.endpoint.includes('/tv')) return 'tv';
  return section.fetcher.params?.mediaType === 'tv' ? 'tv' : 'movie';
}

function SectionPageHeader({ section, control }: { section: SectionConfig; control?: ReactNode }) {
  return (
    <header className="mb-5 sm:mb-6 md:mb-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1 h-8 px-2 -ml-2 rounded-full text-[12px] sm:text-[13px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
      >
        <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.75} />
        Back
      </Link>
      <div className="flex flex-col md:flex-row md:items-center gap-3 sm:gap-4 mt-2">
        <h1 className="text-[24px] sm:text-[32px] md:text-[40px] leading-tight text-[var(--color-text)]">
          <span className="font-light">All </span>
          <span className="font-bold uppercase">{section.title}</span>
        </h1>
        <span className="hidden sm:block w-6 h-2 rounded-full bg-[var(--color-accent)] shrink-0" />
        <span className="hidden sm:block flex-1 h-px bg-[var(--color-border-subtle)]" />
        {control && <div className="w-full min-w-0 md:w-auto mt-1 md:mt-0">{control}</div>}
      </div>
    </header>
  );
}

function FranchisesList({ section }: { section: SectionConfig }) {
  const query = useFranchises(section);
  const data = query.data ?? [];

  return (
    <>
      <SectionPageHeader section={section} />
      {query.isLoading ? (
        <div className={FRANCHISE_GRID}>
          {Array.from({ length: 8 }).map((_, i) => (
            <PosterSkeleton key={i} />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className={FRANCHISE_GRID}>
          {data.map((f) => (
            <FranchiseCard key={f.id} franchise={f} />
          ))}
        </div>
      )}
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center py-12 md:py-20">
      <SearchX className="w-10 h-10 md:w-12 md:h-12 text-[var(--color-text-faint)] mb-3" strokeWidth={1.5} />
      <h2 className="text-[15px] md:text-[16px] font-semibold text-[var(--color-text)]">No titles found</h2>
    </div>
  );
}

function SectionList({ section }: { section: SectionConfig }) {
  const tabs = section.tabs ?? [];
  const tabIds = tabs.map((t) => t.id);
  const [activeTab, setActiveTab] = useSectionParam(section.id, tabIds, section.defaultTab ?? tabIds[0] ?? '');

  const options = section.dropdown?.options ?? [];
  const optionIds = options.map((o) => o.id);
  const defaultOption = section.dropdown?.defaultOption ?? optionIds[0] ?? '';
  const [activeOption, setActiveOption] = useSectionParam(section.id, optionIds, defaultOption);
  const numeric = options.length > 0 && typeof options[0].id === 'number';
  const activeDropdown = options.length > 0 ? (numeric ? Number(activeOption) : activeOption) : undefined;

  const [page, setPage] = useState(1);
  useEffect(() => {
    setPage(1);
  }, [section.id, activeTab, activeOption]);

  const query = useSectionFetcher({
    section,
    activeTab: tabs.length > 0 ? activeTab : undefined,
    activeDropdown,
    page,
  });

  const items = (query.data?.items as unknown as Item[] | undefined) ?? [];
  const totalPages = query.data?.totalPages ?? 1;

  const goToPage = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const control =
    tabs.length > 0 ? (
      <div className="w-full overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <SegmentedTabs
          tabs={tabs.map(({ id, label }) => ({ id, label }))}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>
    ) : section.dropdown ? (
      <DropdownSelect
        label={section.dropdown.label}
        options={options.map(({ id, label }) => ({ id, label }))}
        value={activeDropdown ?? ''}
        onChange={setActiveOption}
      />
    ) : undefined;

  return (
    <>
      <SectionPageHeader section={section} control={control} />
      {query.isLoading ? (
        <div className={GRID} aria-label={`Loading ${section.title}`}>
          {Array.from({ length: 12 }).map((_, i) => (
            <PosterSkeleton key={i} />
          ))}
        </div>
      ) : query.isError ? (
        <div className="py-12 text-center">
          <p className="text-[13px] md:text-[14px] text-[var(--color-text-muted)]">Failed to load {section.title}</p>
        </div>
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div
            className={`${GRID} transition-opacity duration-150 motion-reduce:transition-none ${
              query.isFetching ? 'opacity-60' : 'opacity-100'
            }`}
            aria-busy={query.isFetching}
          >
            {items.map((item) => {
              const mediaType =
                item.media_type === 'tv'
                  ? 'tv'
                  : item.media_type === 'movie'
                    ? 'movie'
                    : fallbackMediaType(section);
              return (
                <PosterCard
                  key={`${mediaType}-${item.id}`}
                  id={item.id}
                  title={item.title ?? item.name ?? 'Untitled'}
                  posterPath={item.poster_path ?? null}
                  voteAverage={item.vote_average ?? 0}
                  releaseDate={item.release_date ?? item.first_air_date}
                  mediaType={mediaType}
                />
              );
            })}
          </div>

          {totalPages > 1 && (
            <nav aria-label="Pagination" className="flex items-center justify-center gap-1 md:gap-2 mt-8 md:mt-12">
              <button
                type="button"
                onClick={() => goToPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                aria-label="Previous page"
                className={`${pageBtn} bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-text-muted)]`}
              >
                <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={1.75} />
              </button>

              {getPages(page, totalPages).map((p, i) =>
                p === '…' ? (
                  <span key={`gap-${i}`} className="w-4 md:w-6 text-center text-xs text-[var(--color-text-faint)]">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => goToPage(p)}
                    aria-label={`Page ${p}`}
                    aria-current={p === page ? 'page' : undefined}
                    className={`${pageBtn} ${
                      p === page
                        ? 'bg-[var(--color-accent)] text-white'
                        : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}

              <button
                type="button"
                onClick={() => goToPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                aria-label="Next page"
                className={`${pageBtn} bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-text-muted)]`}
              >
                <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={1.75} />
              </button>
            </nav>
          )}
        </>
      )}
    </>
  );
}

export default function SectionPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const section = homeConfig.sections.find((s) => s.id === sectionId);

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-4 md:py-8">
      {!section ? (
        <div className="flex flex-col items-center text-center py-16">
          <h1 className="text-[16px] md:text-[18px] font-semibold text-[var(--color-text)]">Section not found</h1>
          <Link
            to="/"
            className="mt-3 inline-flex items-center gap-1 h-9 px-4 rounded-full bg-[var(--color-surface)] text-[12px] md:text-[13px] text-[var(--color-text)] hover:bg-[var(--color-surface-raised)] transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={1.75} />
            Back home
          </Link>
        </div>
      ) : section.type === 'recommendations' ? (
        <>
          <SectionPageHeader section={section} />
          <EmptyState />
        </>
      ) : section.type === 'franchises' ? (
        <FranchisesList section={section} />
      ) : (
        <SectionList section={section} />
      )}
    </div>
  );
}