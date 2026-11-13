import { useState } from 'react';
import { Play, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { RatingRing } from '../../components/ui/RatingRing';
import { EpisodeGuestStrip } from './EpisodeGuestStrip';
import { site } from '../../config/site';
import { features } from '../../config/features';
import { today } from '../../lib/releaseFilters';
import type { Episode } from '../../types';


// -----------------------------------------------------------------------------
// EpisodeRow
// -----------------------------------------------------------------------------
interface EpisodeRowProps {
  episode: Episode;
}

const iconBtn =
  'w-8 h-8 sm:w-9 sm:h-9 inline-flex items-center justify-center rounded-full bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] cursor-not-allowed opacity-50 tooltip-coming-soon';

const linkBtn =
  'inline-flex items-center gap-1 text-[11px] sm:text-[12px] text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]';

export function EpisodeRow({ episode }: EpisodeRowProps) {
  const [overviewExpanded, setOverviewExpanded] = useState(false);
  const [guestsExpanded, setGuestsExpanded] = useState(false);

  const todayStr = today();
  const isUpcoming = episode.air_date ? episode.air_date > todayStr : true;
  const title = episode.name || `${site.copy.episode} ${episode.episode_number}`;
  const isLongOverview = !!episode.overview && episode.overview.length > 100;
  const hasGuests = (episode as any).guest_stars?.length > 0;

  return (
    <div className={`p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-[var(--color-surface)] ${isUpcoming ? 'opacity-60' : ''}`}>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Still */}
        <div className="flex-shrink-0 w-full sm:w-40 md:w-48">
          <div className="aspect-video rounded-lg sm:rounded-xl overflow-hidden bg-[var(--color-surface-raised)]">
            {episode.still_path ? (
              <img src={episode.still_path} alt={title} loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[11px] sm:text-[12px] text-[var(--color-text-faint)]">
                No image
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[12px] sm:text-[13px] font-medium text-[var(--color-accent)] tabular-nums">
                  E{episode.episode_number}
                </span>
                <h4
                  className={`text-[13px] sm:text-[14px] font-semibold truncate ${
                    isUpcoming ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'
                  }`}
                >
                  {title}
                </h4>
              </div>

              <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 mt-1 sm:mt-1.5 text-[11px] sm:text-[12px] text-[var(--color-text-muted)]">
                {episode.air_date && (
                  <span>{isUpcoming ? `${site.copy.airs} ${episode.air_date}` : episode.air_date}</span>
                )}
                {episode.runtime && !isUpcoming && (
                  <span>
                    {Math.floor(episode.runtime / 60)}h {episode.runtime % 60}m
                  </span>
                )}
                {!isUpcoming && episode.vote_average > 0 && (
                  <RatingRing rating={episode.vote_average} size="sm" />
                )}
              </div>
            </div>

            <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
              <button disabled className={iconBtn} aria-label={`${site.copy.watch} (${site.copy.comingSoon})`}>
                <Play className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
              {features.downloadButton && (
                <button disabled className={iconBtn} aria-label={`${site.copy.download} (${site.copy.comingSoon})`}>
                  <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
                </button>
              )}
            </div>
          </div>

          {episode.overview && (
            <div className="mt-2 sm:mt-3">
              <p
                className={`text-[12px] sm:text-[13px] text-[var(--color-text-muted)] leading-relaxed ${
                  !overviewExpanded && isLongOverview ? 'line-clamp-2' : ''
                }`}
              >
                {episode.overview}
              </p>
              {isLongOverview && (
                <button
                  onClick={() => setOverviewExpanded(!overviewExpanded)}
                  className={`${linkBtn} mt-1 sm:mt-1.5`}
                  aria-expanded={overviewExpanded}
                >
                  {overviewExpanded ? (
                    <>
                      {site.copy.collapse}
                      <ChevronUp className="w-3 h-3" strokeWidth={1.75} />
                    </>
                  ) : (
                    <>
                      {site.copy.expand}
                      <ChevronDown className="w-3 h-3" strokeWidth={1.75} />
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {hasGuests && (
            <button
              onClick={() => setGuestsExpanded(!guestsExpanded)}
              className={`${linkBtn} mt-2 sm:mt-3`}
              aria-expanded={guestsExpanded}
            >
              {guestsExpanded ? (
                <>
                  Hide {site.copy.guestStars.toLowerCase()}
                  <ChevronUp className="w-3 h-3" strokeWidth={1.75} />
                </>
              ) : (
                <>
                  Show {site.copy.guestStars.toLowerCase()}
                  <ChevronDown className="w-3 h-3" strokeWidth={1.75} />
                </>
              )}
            </button>
          )}

          {guestsExpanded && <EpisodeGuestStrip episode={episode} />}
        </div>
      </div>
    </div>
  );
}