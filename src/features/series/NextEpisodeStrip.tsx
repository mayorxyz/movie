import React from 'react';
import { Calendar } from 'lucide-react';
import { site } from '../../config/site';
import type { TvSeries, Episode } from '../../types';

interface NextEpisodeStripProps {
  series: TvSeries;
}

export function NextEpisodeStrip({ series }: NextEpisodeStripProps) {
  const nextEpisode = series.next_episode_to_air;
  const lastEpisode = series.last_episode_to_air;

  // Show next episode if it exists, otherwise last aired
  const episode: Episode | null | undefined = nextEpisode || lastEpisode;
  const isNext = !!nextEpisode;

  if (!episode) return null;

  const label = isNext ? site.copy.nextEpisode : site.copy.lastEpisode;
  const airDate = episode.air_date ? new Date(episode.air_date) : null;
  const isUpcoming = airDate && airDate > new Date();

  return (
    <div className="mt-8 p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
      <div className="flex items-start gap-3">
        <Calendar className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isNext ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--color-text)]">
            {label}: S{episode.season_number}E{episode.episode_number} {episode.name || `${site.copy.episode} ${episode.episode_number}`}
          </p>
          {airDate && (
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {isUpcoming ? `${site.copy.airs} ` : ''}
              {airDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
