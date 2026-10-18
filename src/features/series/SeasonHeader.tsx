import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { site } from '../../config/site';
import type { Season } from '../../types';

interface SeasonHeaderProps {
  season: Season;
}

export function SeasonHeader({ season }: SeasonHeaderProps) {
  const [expanded, setExpanded] = useState(false);

  const airYear = season.air_date ? new Date(season.air_date).getFullYear() : '';
  const isLongOverview = season.overview && season.overview.length > 150;

  return (
    <div className="flex gap-4 p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] mb-4">
      {/* Season poster */}
      {season.poster_path && (
        <div className="flex-shrink-0 w-20 md:w-24">
          <img
            src={season.poster_path}
            alt={season.name}
            className="w-full rounded aspect-[2/3] object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Season info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">
          {season.name}
        </h3>
        <div className="flex gap-3 mt-1 text-sm text-[var(--color-text-muted)]">
          {airYear && <span>{airYear}</span>}
          <span>
            {season.episode_count} {site.copy.episodes}
          </span>
        </div>

        {/* Overview */}
        {season.overview && (
          <div className="mt-2">
            <p className={`text-sm text-[var(--color-text)] leading-relaxed ${!expanded && isLongOverview ? 'line-clamp-2' : ''}`}>
              {season.overview}
            </p>
            {isLongOverview && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 mt-1 text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
                aria-expanded={expanded}
              >
                {expanded ? (
                  <>
                    {site.copy.collapse}
                    <ChevronUp className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    {site.copy.expand}
                    <ChevronDown className="w-3 h-3" />
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
