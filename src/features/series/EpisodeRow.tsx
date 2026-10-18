import { useState } from 'react';
import { Play, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { RatingRing } from '../../components/ui/RatingRing';
import { Button } from '../../components/ui/Button';
import { EpisodeGuestStrip } from './EpisodeGuestStrip';
import { site } from '../../config/site';
import { features } from '../../config/features';
import { today } from '../../lib/releaseFilters';
import type { Episode } from '../../types';

interface EpisodeRowProps {
  episode: Episode;
}

export function EpisodeRow({ episode }: EpisodeRowProps) {
  const [overviewExpanded, setOverviewExpanded] = useState(false);
  const [guestsExpanded, setGuestsExpanded] = useState(false);

  const todayStr = today();
  // Unaired episodes stay visible but muted with "Airs {date}" (string compare, no Date shifting).
  const isUpcoming = episode.air_date ? episode.air_date > todayStr : true;
  const title = episode.name || `${site.copy.episode} ${episode.episode_number}`;
  const isLongOverview = episode.overview && episode.overview.length > 100;

  return (
    <div className={`p-3 rounded-lg border ${isUpcoming ? 'bg-[var(--color-surface)]/50 border-[var(--color-border)]/50' : 'bg-[var(--color-surface)] border-[var(--color-border)]'}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Still image */}
        <div className="flex-shrink-0 w-full sm:w-48 md:w-56">
          <div className="aspect-video rounded overflow-hidden bg-[var(--color-surface-raised)]">
            {episode.still_path ? (
              <img
                src={episode.still_path}
                alt={title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] text-xs">
                No Image
              </div>
            )}
          </div>
        </div>

        {/* Episode info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--color-text-muted)]">
                  E{episode.episode_number}
                </span>
                <h4 className={`text-sm font-semibold truncate ${isUpcoming ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'}`}>
                  {title}
                </h4>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[var(--color-text-muted)]">
                {episode.air_date && (
                  <span>
                    {isUpcoming ? `${site.copy.airs} ${episode.air_date}` : episode.air_date}
                  </span>
                )}
                {episode.runtime && !isUpcoming && (
                  <span>{Math.floor(episode.runtime / 60)}h {episode.runtime % 60}m</span>
                )}
                {!isUpcoming && episode.vote_average > 0 && (
                  <RatingRing rating={episode.vote_average} size="sm" />
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-1 flex-shrink-0">
              <button
                disabled
                className="p-1.5 rounded-full bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] cursor-not-allowed opacity-50 tooltip-coming-soon"
                aria-label={`${site.copy.watch} (${site.copy.comingSoon})`}
              >
                <Play className="w-3.5 h-3.5" />
              </button>
              {features.downloadButton && (
                <button
                  disabled
                  className="p-1.5 rounded-full bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] cursor-not-allowed opacity-50 tooltip-coming-soon"
                  aria-label={`${site.copy.download} (${site.copy.comingSoon})`}
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Overview */}
          {episode.overview && (
            <div className="mt-2">
              <p className={`text-xs text-[var(--color-text)] leading-relaxed ${!overviewExpanded && isLongOverview ? 'line-clamp-2' : ''}`}>
                {episode.overview}
              </p>
              {isLongOverview && (
                <button
                  onClick={() => setOverviewExpanded(!overviewExpanded)}
                  className="flex items-center gap-0.5 mt-1 text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
                  aria-expanded={overviewExpanded}
                >
                  {overviewExpanded ? (
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

          {/* Guest stars toggle */}
          {(episode as any).guest_stars?.length > 0 && (
            <button
              onClick={() => setGuestsExpanded(!guestsExpanded)}
              className="flex items-center gap-1 mt-2 text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
              aria-expanded={guestsExpanded}
            >
              {guestsExpanded ? (
                <>
                  Hide {site.copy.guestStars.toLowerCase()}
                  <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  Show {site.copy.guestStars.toLowerCase()}
                  <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          )}

          {/* Guest stars strip */}
          {guestsExpanded && <EpisodeGuestStrip episode={episode} />}
        </div>
      </div>
    </div>
  );
}
