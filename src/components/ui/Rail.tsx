import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface RailProps {
  title: string;
  children: React.ReactNode;
}

const arrowBtn =
  'hidden md:inline-flex absolute top-[38%] -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-[var(--color-surface-raised)] text-[var(--color-text)] shadow-[0_8px_24px_rgba(0,0,0,0.5)] opacity-0 group-hover/rail:opacity-100 focus-visible:opacity-100 hover:bg-[var(--color-accent)] transition-[opacity,background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]';

export function Rail({ title, children }: RailProps) {
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
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: reduced ? 'auto' : 'smooth',
    });
  };

  return (
    <section className="relative" aria-label={title}>
      <div className="flex min-w-0 items-center gap-3 md:gap-4 mb-5 px-4 md:px-8 lg:px-12">
        <h2 className="min-w-0 truncate text-lg md:text-[20px] font-semibold text-[var(--color-text)]">{title}</h2>
        <span className="w-7 h-2.5 rounded-full bg-[var(--color-accent)] shrink-0" />
        <span className="flex-1 min-w-0 h-px bg-[var(--color-border-subtle)]" />
      </div>

      <div className="relative group/rail">
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
          {children}
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
    </section>
  );
}