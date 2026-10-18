import { site } from '../../config/site';
import type { UpcomingType } from './types';

interface UpcomingHeaderProps {
  type: UpcomingType;
  onTypeChange: (type: UpcomingType) => void;
}

export function UpcomingHeader({ type, onTypeChange }: UpcomingHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl md:text-4xl font-[var(--font-display)] font-bold text-[var(--color-text)] mb-4">
        {site.copy.upcoming.title}
      </h1>
      
      {/* Type switch */}
      <div className="inline-flex rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] p-1">
        <button
          onClick={() => onTypeChange('movie')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            type === 'movie'
              ? 'bg-[var(--color-accent)] text-[var(--color-base)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          {site.copy.upcoming.movies}
        </button>
        <button
          onClick={() => onTypeChange('tv')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            type === 'tv'
              ? 'bg-[var(--color-accent)] text-[var(--color-base)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          {site.copy.upcoming.tv}
        </button>
        <button
          onClick={() => onTypeChange('all')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            type === 'all'
              ? 'bg-[var(--color-accent)] text-[var(--color-base)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          {site.copy.upcoming.all}
        </button>
      </div>
    </div>
  );
}
