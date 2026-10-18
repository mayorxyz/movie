import React from 'react';
import { site } from '../../config/site';
import type { Episode } from '../../types';

interface EpisodeGuestStripProps {
  episode: Episode;
}

export function EpisodeGuestStrip({ episode }: EpisodeGuestStripProps) {
  const guestStars = (episode as any).guest_stars;
  if (!guestStars || guestStars.length === 0) return null;

  return (
    <div className="mt-2 pt-2 border-t border-[var(--color-border)]">
      <p className="text-xs font-medium text-[var(--color-text-muted)] mb-1">
        {site.copy.guestStars}:
      </p>
      <div className="flex flex-wrap gap-2">
        {guestStars.slice(0, 10).map((guest: any) => (
          <span
            key={guest.id}
            className="text-xs text-[var(--color-text)] px-2 py-0.5 rounded bg-[var(--color-surface-raised)]"
          >
            {guest.name}
            {guest.character && ` as ${guest.character}`}
          </span>
        ))}
        {guestStars.length > 10 && (
          <span className="text-xs text-[var(--color-text-muted)]">
            +{guestStars.length - 10} more
          </span>
        )}
      </div>
    </div>
  );
}
