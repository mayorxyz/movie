import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  seeAllLink?: string;
  children?: React.ReactNode;
}

export function SectionHeader({ title, seeAllLink, children }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4 px-4 md:px-8 lg:px-12">
      <div className="flex items-center gap-4">
        <h2 className="text-xl md:text-2xl font-[var(--font-display)] font-semibold text-[var(--color-text)]">
          {title}
        </h2>
        {children && <div>{children}</div>}
      </div>
      {seeAllLink && (
        <Link
          to={seeAllLink}
          className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
        >
          See all
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
