import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { site } from '../../config/site';
import type { Season } from '../../types';

interface SeasonHeaderProps {
  season: Season;
}

export function SeasonHeader({ season }: SeasonHeaderProps) {
  const [expanded, setExpanded] = useState(false);

  const airYear = season.air_date ? new Date(season.air_date).getFullYear() : '';
  const isLongOverview = !!season.overview && season.overview.length > 150;

  return (
    <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl bg-[var(--color-surface)] mb-3 sm:mb-4">
      {season.poster_path && (
        <div className="flex-shrink-0 w-20 sm:w-24">
          <img
            src={season.poster_path}
            alt={season.name}
            loading="lazy"
            className="w-full aspect-[2/3] object-cover rounded-lg sm:rounded-xl"
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h3 className="text-[16px] sm:text-[18px] font-semibold text-[var(--color-text)] leading-tight">
          {season.name}
        </h3>
        
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-[13px] sm:text-[14px] text-[var(--color-text-muted)]">
          {airYear && <span>{airYear}</span>}
          <span>
            {season.episode_count} {site.copy.episodes}
          </span>
        </div>

        {season.overview && (
          <div className="mt-2.5 sm:mt-3">
            <p
              className={`text-[14px] sm:text-[15px] text-[var(--color-text-muted)] leading-relaxed ${
                !expanded && isLongOverview ? 'line-clamp-2' : ''
              }`}
            >
              {season.overview}
            </p>
            
            {isLongOverview && (
              <button
                onClick={() => setExpanded(!expanded)}
                aria-expanded={expanded}
                className="inline-flex items-center gap-1.5 mt-2 -ml-1.5 px-1.5 py-1 text-[13px] sm:text-[14px] font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              >
                {expanded ? (
                  <>
                    {site.copy.collapse}
                    <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.75} />
                  </>
                ) : (
                  <>
                    {site.copy.expand}
                    <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.75} />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}