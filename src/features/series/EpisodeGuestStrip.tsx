import { site } from '../../config/site';
import type { Episode } from '../../types';

interface EpisodeGuestStripProps {
  episode: Episode;
}

export function EpisodeGuestStrip({ episode }: EpisodeGuestStripProps) {
  const guestStars = (episode as any).guest_stars;
  if (!guestStars || guestStars.length === 0) return null;

  return (
    <div className="mt-3">
      <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-muted)] mb-2">
        {site.copy.guestStars}
      </p>
      <div className="flex flex-wrap gap-2">
        {guestStars.slice(0, 10).map((guest: any) => (
          <span
            key={guest.id}
            className="inline-flex items-center h-7 px-3 rounded-full text-[12px] bg-[var(--color-surface-raised)] text-[var(--color-text)]"
          >
            {guest.name}
            {guest.character && <span className="text-[var(--color-text-muted)]">&nbsp;as {guest.character}</span>}
          </span>
        ))}
        {guestStars.length > 10 && (
          <span className="inline-flex items-center h-7 text-[12px] text-[var(--color-text-muted)]">
            +{guestStars.length - 10} more
          </span>
        )}
      </div>
    </div>
  );
}