import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import type { SectionConfig, CardVariant } from '../../config/homeSections';
import { useSectionFetcher } from '../../hooks/useSectionFetcher';
import { PosterCard } from './PosterCard';
import { RankCard } from './RankCard';
import { PosterSkeleton } from './Skeleton';

interface ContentRowProps {
  section: SectionConfig;
  activeTab?: string;
  activeDropdown?: string | number;
}

export function ContentRow({ section, activeTab, activeDropdown }: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  // Lazy load when section enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (rowRef.current) {
      observer.observe(rowRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Fetch data only when visible
  const { data, isLoading, isError, refetch } = useSectionFetcher({
    section,
    activeTab,
    activeDropdown,
    enabled: isVisible,
  });

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  // Render card based on variant
  const renderCard = (item: any, index: number) => {
    const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
    const title = item.title || item.name;
    const releaseDate = item.release_date || item.first_air_date;

    if (section.cardVariant === 'wideRank') {
      return (
        <RankCard
          key={item.id}
          id={item.id}
          rank={index + 1}
          title={title}
          backdropPath={item.backdrop_path}
          voteAverage={item.vote_average}
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
          posterPath={item.poster_path}
          voteAverage={item.vote_average}
          releaseDate={releaseDate}
          mediaType={mediaType}
        />
      </div>
    );
  };

  // Skeleton loader
  const renderSkeleton = () => {
    const count = section.maxItems || 10;
    return (
      <div className="flex gap-3 overflow-hidden px-4 md:px-8 lg:px-12">
        {Array.from({ length: Math.min(count, 6) }).map((_, i) => (
          <div key={i} className={section.cardVariant === 'wideRank' ? 'flex-shrink-0 w-[400px] md:w-[500px] aspect-[16/10]' : 'flex-shrink-0 w-[140px] md:w-[180px]'}>
            <PosterSkeleton />
          </div>
        ))}
      </div>
    );
  };

  // Error state
  const renderError = () => (
    <div className="px-4 md:px-8 lg:px-12 py-8 text-center">
      <p className="text-[var(--color-text-muted)] mb-4">Failed to load {section.title}</p>
      <button
        onClick={() => refetch()}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-sm text-[var(--color-text)] hover:border-[var(--color-text-muted)] transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Retry
      </button>
    </div>
  );

  // Empty state
  const renderEmpty = () => (
    <div className="px-4 md:px-8 lg:px-12 py-8 text-center">
      <p className="text-[var(--color-text-muted)]">No results found</p>
    </div>
  );

  return (
    <div ref={rowRef} className="relative group/row">
      {isLoading && renderSkeleton()}

      {isError && renderError()}

      {!isLoading && !isError && data && data.length === 0 && renderEmpty()}

      {!isLoading && !isError && data && data.length > 0 && (
        <>
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-[var(--color-base)] to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
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
            {data.map((item, index) => renderCard(item, index))}
          </div>

          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-[var(--color-base)] to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6 text-[var(--color-text)]" />
            </button>
          )}
        </>
      )}
    </div>
  );
}
