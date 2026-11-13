import React from 'react';
import { Link } from 'react-router-dom';

interface SectionHeaderProps {
  title: string;
  titleHref?: string;
  children?: React.ReactNode;
}

export function SectionHeader({ title, titleHref, children }: SectionHeaderProps) {
  const titleContent = (
    <>
      <h2 className="min-w-0 truncate text-lg md:text-[20px] font-semibold text-[var(--color-text)] transition-colors duration-200 group-hover/title:text-[var(--color-accent)]">
        {title}
      </h2>
      <span className="w-7 h-2.5 rounded-full bg-[var(--color-accent)] shrink-0" />
    </>
  );

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 mb-5 px-4 md:px-8 lg:px-12 md:flex md:gap-4">
      <div className="flex min-w-0 items-center gap-3 md:shrink-0">
        {titleHref ? (
          <Link
            to={titleHref}
            className="group/title flex min-w-0 items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            {titleContent}
          </Link>
        ) : (
          titleContent
        )}
      </div>
      <span className="hidden md:block flex-1 h-px bg-[var(--color-border-subtle)]" />
      {children && (
        <div className="col-span-2 w-full min-w-0 md:col-auto md:w-auto md:shrink-0 md:max-w-[min(45vw,32rem)]">
          {children}
        </div>
      )}
    </div>
  );
}