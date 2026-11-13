import { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, SlidersHorizontal, X, SearchX } from 'lucide-react';
import { tmdbService } from '../../services/tmdbClient';
import { PosterCard } from '../../components/ui/PosterCard';
import { PosterSkeleton } from '../../components/ui/Skeleton';
import { DropdownSelect } from '../../components/ui/DropdownSelect';

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'primary_release_date.desc', label: 'Newest' },
  { value: 'primary_release_date.asc', label: 'Oldest' },
];
const RATING_OPTIONS = ['5', '6', '7', '8', '9'];
const DEFAULT_SORT = 'popularity.desc';
const MAX_PAGES = 500;

const GRID =
  'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-x-2.5 gap-y-4 sm:gap-x-3.5 sm:gap-y-6 md:gap-x-4 md:gap-y-7';

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

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <DropdownSelect label={label} options={options} value={value} onChange={(next) => onChange(String(next))} />
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 h-7 md:h-8 pl-2.5 pr-1.5 md:pl-3 md:pr-2 rounded-full bg-[var(--color-surface)] border border-[var(--color-accent)] text-[11px] md:text-[12px] text-[var(--color-text)] hover:bg-[var(--color-surface-raised)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
      aria-label={`Remove filter ${label}`}
    >
      {label}
      <X className="w-3 h-3 md:w-3.5 md:h-3.5 text-[var(--color-text-muted)]" strokeWidth={2} />
    </button>
  );
}

const pageBtn =
  'w-8 h-8 md:w-10 md:h-10 inline-flex items-center justify-center rounded-full text-[12px] md:text-[14px] font-medium tabular-nums transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:opacity-40 disabled:cursor-not-allowed';

export default function BrowsePage() {
  const { type } = useParams<{ type: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const mediaType = type === 'tv' ? 'tv' : 'movie';
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const genre = searchParams.get('genre') || '';
  const sortBy = searchParams.get('sort') || DEFAULT_SORT;
  const minRating = searchParams.get('rating') || '';

  const { data: genres } = useQuery<any[]>({
    queryKey: [`${mediaType}Genres`],
    queryFn: () => (mediaType === 'tv' ? tmdbService.getTvGenres() : tmdbService.getMovieGenres()),
  });

  const { data, isLoading, isFetching } = useQuery<any>({
    queryKey: [`browse-${mediaType}`, page, genre, sortBy, minRating],
    queryFn: () =>
      tmdbService.getBrowsePage(mediaType, {
        page,
        genre: genre ? Number(genre) : undefined,
        sortBy,
        minRating: minRating ? Number(minRating) : undefined,
      }),
    staleTime: 10 * 60 * 1000,
  });

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    setSearchParams(params);
  };

  const goToPage = (next: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(next));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAll = () => setSearchParams(new URLSearchParams());

  const title = mediaType === 'tv' ? 'TV Shows' : 'Movies';
  const totalPages = Math.min(data?.total_pages ?? 1, MAX_PAGES);
  const genreName = useMemo(
    () => genres?.find((g) => String(g.id) === genre)?.name,
    [genres, genre],
  );
  const sortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label;

  const activeCount = [genre, minRating, sortBy !== DEFAULT_SORT ? sortBy : ''].filter(Boolean).length;
  const hasActive = activeCount > 0;
  const results: any[] = data?.results ?? [];

  return (
    <div className="px-4 md:px-8 lg:px-12 max-w-[1920px] mx-auto pt-5 md:pt-8 pb-8 md:pb-12">
      {/* Header */}
      <header className="mb-4 md:mb-6">
        <p className="text-[10px] md:text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-muted)] mb-1">
          Browse
        </p>
        <div className="flex items-center gap-3 md:gap-4">
          <h1 className="text-[24px] sm:text-[30px] md:text-[40px] leading-tight text-[var(--color-text)]">
            <span className="font-light">All </span>
            <span className="font-bold uppercase">{title}</span>
          </h1>
          <span className="hidden sm:block w-6 h-2 rounded-full bg-[var(--color-accent)] shrink-0" />
          <span className="hidden sm:block flex-1 h-px bg-[var(--color-border-subtle)]" />
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            className="md:hidden ml-auto inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[12px] font-medium text-[var(--color-text)] hover:border-[var(--color-text-muted)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.75} />
            Filters
            {activeCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-[var(--color-accent)] text-white text-[10px] font-bold tabular-nums">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Filters */}
      <section
        aria-label="Filters"
        className={`${showFilters ? 'block' : 'hidden'} md:block mb-4 md:mb-5 p-3.5 md:p-0 rounded-2xl md:rounded-none bg-[var(--color-surface-raised)] md:bg-transparent border border-[var(--color-border)] md:border-0`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 md:flex md:flex-wrap gap-2.5 md:gap-3.5">
          {genres && (
            <FilterSelect
              label="Genre"
              value={genre}
              onChange={(v) => updateFilter('genre', v)}
              options={[
                { id: '', label: 'All Genres' },
                ...genres.map((g) => ({ id: String(g.id), label: g.name })),
              ]}
            />
          )}
          <FilterSelect
            label="Sort by"
            value={sortBy}
            onChange={(v) => updateFilter('sort', v)}
            options={SORT_OPTIONS.map((option) => ({ id: option.value, label: option.label }))}
          />
          <FilterSelect
            label="Min rating"
            value={minRating}
            onChange={(v) => updateFilter('rating', v)}
            options={[
              { id: '', label: 'Any' },
              ...RATING_OPTIONS.map((rating) => ({ id: rating, label: `${rating}+` })),
            ]}
          />
        </div>
      </section>

      {/* Active chips and count */}
      {(hasActive || data?.total_results != null) && (
        <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-4 md:mb-6">
          {genre && genreName && <Chip label={genreName} onRemove={() => updateFilter('genre', '')} />}
          {minRating && <Chip label={`${minRating}+ rating`} onRemove={() => updateFilter('rating', '')} />}
          {sortBy !== DEFAULT_SORT && sortLabel && (
            <Chip label={sortLabel} onRemove={() => updateFilter('sort', '')} />
          )}
          {hasActive && (
            <button
              type="button"
              onClick={clearAll}
              className="text-[12px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] px-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded-full"
            >
              Clear all
            </button>
          )}
          {data?.total_results != null && (
            <span className="ml-auto text-[11px] md:text-[12px] text-[var(--color-text-muted)] tabular-nums">
              {data.total_results.toLocaleString()} titles
            </span>
          )}
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className={GRID} aria-label="Loading titles">
          {Array.from({ length: 18 }).map((_, i) => (
            <PosterSkeleton key={i} />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center text-center py-12 md:py-20">
          <SearchX className="w-10 h-10 md:w-12 md:h-12 text-[var(--color-text-faint)] mb-3" strokeWidth={1.5} />
          <h2 className="text-[15px] md:text-[16px] font-semibold text-[var(--color-text)]">No titles found</h2>
          <p className="text-[13px] md:text-[14px] text-[var(--color-text-muted)] mt-1 mb-5">
            Try adjusting or clearing your filters.
          </p>
          {hasActive && (
            <button
              type="button"
              onClick={clearAll}
              className="h-9 md:h-10 px-5 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-[13px] md:text-[14px] font-semibold active:scale-[0.98] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div
            className={`${GRID} transition-opacity duration-150 motion-reduce:transition-none ${
              isFetching ? 'opacity-60' : 'opacity-100'
            }`}
            aria-busy={isFetching}
          >
            {results.map((item: any) => (
              <PosterCard
                key={item.id}
                id={item.id}
                title={mediaType === 'tv' ? item.name : item.title}
                posterPath={item.poster_path}
                voteAverage={item.vote_average}
                releaseDate={mediaType === 'tv' ? item.first_air_date : item.release_date}
                mediaType={mediaType}
              />
            ))}
          </div>

          {/* Pagination */}
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
    </div>
  );
}