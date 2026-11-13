import { site } from '../../config/site';
import type { UpcomingType } from './types';

interface UpcomingHeaderProps {
  type: UpcomingType;
  onTypeChange: (type: UpcomingType) => void;
}

export function UpcomingHeader({ type, onTypeChange }: UpcomingHeaderProps) {
  const options: { value: UpcomingType; label: string }[] = [
    { value: 'movie', label: site.copy.upcoming.movies },
    { value: 'tv', label: site.copy.upcoming.tv },
    { value: 'all', label: site.copy.upcoming.all },
  ];

  const words = String(site.copy.upcoming.title).trim().split(/\s+/);
  const last = words.pop() ?? '';
  const lead = words.join(' ');

  return (
    <header className="mb-6 sm:mb-8">
      <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
        <h1 className="text-[28px] sm:text-[36px] md:text-[44px] leading-[1.1] text-[var(--color-text)]">
          {lead && <span className="font-light">{lead} </span>}
          <span className="font-bold uppercase">{last}</span>
        </h1>
        <span className="hidden sm:block w-7 h-2.5 rounded-full bg-[var(--color-accent)] shrink-0" />
        <span className="hidden sm:block flex-1 h-px bg-[var(--color-border-subtle)]" />
      </div>

      <div 
        role="tablist" 
        aria-label="Release type" 
        className="inline-flex p-1 rounded-full bg-[var(--color-surface)] shadow-sm"
      >
        {options.map((o) => {
          const active = type === o.value;
          return (
            <button
              key={o.value}
              role="tab"
              aria-selected={active}
              onClick={() => onTypeChange(o.value)}
              className={`h-10 sm:h-9 px-4 sm:px-5 rounded-full text-[13px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
                active
                  ? 'bg-[var(--color-accent)] text-white shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]'
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}