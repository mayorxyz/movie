import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import type { SectionConfig } from '../../config/homeSections';
import { PosterCard } from './PosterCard';
import { RankCard } from './RankCard';
import { FranchiseCard, FranchiseSkeleton, type FranchiseSummary } from './FranchiseCard';
import { PosterSkeleton, Skeleton } from './Skeleton';

interface ContentRowProps {
  section: SectionConfig;
  items: Record<string, unknown>[] | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}

type CardItem = {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
};

const arrowBtn =
  'hidden md:inline-flex absolute top-[38%] -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-[var(--color-surface-raised)] text-[var(--color-text)] shadow-[0_8px_24px_rgba(0,0,0,0.5)] opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 hover:bg-[var(--color-accent)] transition-[opacity,background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]';

const retryBtn =
  'inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-[14px] font-semibold active:scale-[0.98] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]';

export function ContentRow({ section, items, loading, error, onRetry }: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: prefersReduced ? 'auto' : 'smooth',
    });
  };

  const renderCard = (raw: Record<string, unknown>, index: number) => {
    const item = raw as unknown as CardItem;
    if (section.cardVariant === 'franchise') {
      return <FranchiseCard key={item.id} franchise={raw as unknown as FranchiseSummary} />;
    }
    const mediaType = item.media_type === 'tv' ? 'tv' : 'movie';
    const title = item.title ?? item.name ?? 'Untitled';
    const releaseDate = item.release_date ?? item.first_air_date;

    if (section.cardVariant === 'wideRank') {
      return (
        <RankCard
          key={item.id}
          id={item.id}
          rank={index + 1}
          title={title}
          backdropPath={item.backdrop_path ?? null}
          voteAverage={item.vote_average ?? 0}
          releaseDate={releaseDate}
          mediaType={mediaType}
        />
      );
    }

    return (
      <div key={item.id} className="flex-shrink-0 w-[140px] md:w-[180px]">
        <PosterCard
          id={item.id}
          title={title}
          posterPath={item.poster_path ?? null}
          voteAverage={item.vote_average ?? 0}
          releaseDate={releaseDate}
          mediaType={mediaType}
        />
      </div>
    );
  };

  if (loading) {
    const count = Math.min(section.maxItems ?? 10, 6);
    return (
      <div className="flex gap-3 overflow-hidden px-4 md:px-8 lg:px-12" aria-label={`Loading ${section.title}`}>
        {Array.from({ length: count }).map((_, i) => {
          if (section.cardVariant === 'franchise') return <FranchiseSkeleton key={i} />;
          if (section.cardVariant === 'wideRank') {
            return (
              <div key={i} className="flex-shrink-0 w-[300px] sm:w-[400px] md:w-[500px] aspect-[16/10]">
                <Skeleton className="w-full h-full rounded-[20px]" />
              </div>
            );
          }
          return (
            <div key={i} className="flex-shrink-0 w-[140px] md:w-[180px]">
              <PosterSkeleton />
            </div>
          );
        })}
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 md:px-8 lg:px-12 py-10 flex flex-col items-center text-center">
        <p className="text-[14px] text-[var(--color-text-muted)] mb-4">Failed to load {section.title}</p>
        <button onClick={onRetry} className={retryBtn}>
          <RefreshCw className="w-4 h-4" strokeWidth={1.75} />
          Retry
        </button>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="px-4 md:px-8 lg:px-12 py-10 text-center">
        <p className="text-[14px] text-[var(--color-text-muted)]">No results found</p>
      </div>
    );
  }

  return (
    <div className="relative group/row">
      {canScrollLeft && (
        <button onClick={() => scroll('left')} className={`${arrowBtn} left-4`} aria-label="Scroll left">
          <ChevronLeft className="w-5 h-5" strokeWidth={1.75} />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="rail-scroll flex gap-3 overflow-x-auto px-4 md:px-8 lg:px-12 pb-2"
      >
        {items.map((item, index) => renderCard(item, index))}
      </div>

      {canScrollRight && (
        <>
          <div className="hidden md:block pointer-events-none absolute right-0 top-0 bottom-2 w-6 bg-gradient-to-l from-[var(--color-bg)] to-transparent" />
          <button onClick={() => scroll('right')} className={`${arrowBtn} right-4`} aria-label="Scroll right">
            <ChevronRight className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </>
      )}
    </div>
  );
}