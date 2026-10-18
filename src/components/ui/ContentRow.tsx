import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import type { SectionConfig } from '../../config/homeSections';
import { PosterCard } from './PosterCard';
import { RankCard } from './RankCard';
import { FranchiseCard, type FranchiseSummary } from './FranchiseCard';
import { PosterSkeleton } from './Skeleton';

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
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={
              section.cardVariant === 'wideRank'
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

  if (error) {
    return (
      <div className="px-4 md:px-8 lg:px-12 py-8 text-center">
        <p className="text-[var(--color-text-muted)] mb-4">Failed to load {section.title}</p>
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

  if (!items || items.length === 0) {
    return (
      <div className="px-4 md:px-8 lg:px-12 py-8 text-center">
        <p className="text-[var(--color-text-muted)]">No results found</p>
      </div>
    );
  }

  return (
    <div className="relative group/row">
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-[var(--color-base)] to-transparent items-center justify-center opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 transition-opacity hidden md:flex"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6 text-[var(--color-text)]" />
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
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-[var(--color-base)] to-transparent items-center justify-center opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 transition-opacity hidden md:flex"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 text-[var(--color-text)]" />
        </button>
      )}
    </div>
  );
}
