import { Calendar, Play, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { RatingRing } from '../../components/ui/RatingRing';
import { EpisodeGuestStrip } from './EpisodeGuestStrip';
import { site } from '../../config/site';
import { features } from '../../config/features';
import { today } from '../../lib/releaseFilters';
import type { TvSeries, Episode } from '../../types';



// -----------------------------------------------------------------------------
// NextEpisodeStrip
// -----------------------------------------------------------------------------
interface NextEpisodeStripProps {
  series: TvSeries;
}

export function NextEpisodeStrip({ series }: NextEpisodeStripProps) {
  const nextEpisode = series.next_episode_to_air;
  const lastEpisode = series.last_episode_to_air;

  const episode: Episode | null | undefined = nextEpisode || lastEpisode;
  const isNext = !!nextEpisode;

  if (!episode) return null;

  const label = isNext ? site.copy.nextEpisode : site.copy.lastEpisode;
  const airDate = episode.air_date ? new Date(episode.air_date) : null;
  const isUpcoming = airDate && airDate > new Date();

  return (
    <div className="mt-6 p-3 sm:mt-10 sm:p-5 rounded-xl sm:rounded-2xl bg-[var(--color-surface)]">
      <div className="flex items-start gap-3 sm:gap-4">
        <span
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            isNext ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]'
          }`}
        >
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.75} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
            {label}
          </p>
          <p className="text-[13px] sm:text-[14px] font-semibold text-[var(--color-text)] mt-0.5 sm:mt-1">
            S{episode.season_number}E{episode.episode_number}{' '}
            {episode.name || `${site.copy.episode} ${episode.episode_number}`}
          </p>
          {airDate && (
            <p className="text-[11px] sm:text-[12px] text-[var(--color-text-muted)] mt-0.5 sm:mt-1">
              {isUpcoming ? `${site.copy.airs} ` : ''}
              {airDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

