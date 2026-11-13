import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { Rail } from '../../components/ui/Rail';
import { site } from '../../config/site';
import { features } from '../../config/features';
import type { TvSeries } from '../../types';

interface CastRailProps {
  series: TvSeries;
}

const cardFocus =
  'block rounded-xl md:rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]';

export function CastRail({ series }: CastRailProps) {
  // Top 20 by total_episode_count from aggregate_credits
  const aggregateCredits = (series as any).aggregate_credits;
  if (!aggregateCredits?.cast) return null;

  const cast = [...(aggregateCredits.cast || [])]
    .sort((a: any, b: any) => (b.total_episode_count || 0) - (a.total_episode_count || 0))
    .slice(0, 20);

  if (cast.length === 0) return null;

  return (
    <div className="mt-8 md:mt-14 -mx-4 sm:-mx-6 md:mx-0">
      <Rail title={site.copy.cast}>
        {cast.map((person: any) => {
          const content = (
            <div className="flex-shrink-0 w-24 sm:w-28 md:w-36 group">
              <div className="aspect-[3/4] rounded-xl md:rounded-2xl overflow-hidden bg-[var(--color-surface)] mb-2 md:mb-3 flex items-center justify-center">
                {person.profile_path ? (
                  <img
                    src={person.profile_path}
                    alt={person.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                ) : (
                  <User className="w-7 h-7 md:w-8 md:h-8 text-[var(--color-text-faint)]" strokeWidth={1.5} />
                )}
              </div>
              <p className="text-[12px] md:text-[13px] font-semibold text-[var(--color-text)] truncate">{person.name}</p>
              <p className="text-[11px] md:text-[12px] text-[var(--color-text-muted)] truncate mt-0.5">
                {person.roles?.[0]?.character || person.character || ''}
              </p>
              {person.total_episode_count ? (
                <p className="text-[10px] md:text-[11px] text-[var(--color-text-faint)] mt-0.5 tabular-nums">
                  {person.total_episode_count} ep{person.total_episode_count > 1 ? 's' : ''}
                </p>
              ) : null}
            </div>
          );

          if (features.personPages) {
            return (
              <Link key={person.id} to={`/person/${person.id}`} className={cardFocus}>
                {content}
              </Link>
            );
          }
          return <div key={person.id}>{content}</div>;
        })}
      </Rail>
    </div>
  );
}