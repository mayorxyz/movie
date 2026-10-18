import React from 'react';
import { Link } from 'react-router-dom';
import { Rail } from '../../components/ui/Rail';
import { site } from '../../config/site';
import { features } from '../../config/features';
import type { TvSeries } from '../../types';

interface CastRailProps {
  series: TvSeries;
}

export function CastRail({ series }: CastRailProps) {
  // Get cast from aggregate_credits, sort by total_episode_count, take top 20
  const aggregateCredits = (series as any).aggregate_credits;
  if (!aggregateCredits?.cast) return null;

  const cast = aggregateCredits.cast
    .sort((a: any, b: any) => (b.total_episode_count || 0) - (a.total_episode_count || 0))
    .slice(0, 20);

  if (cast.length === 0) return null;

  return (
    <div className="mt-12">
      <Rail title={site.copy.cast}>
        {cast.map((person: any) => {
          const content = (
            <div className="flex-shrink-0 w-28 md:w-32 group">
              <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[var(--color-surface)] mb-2">
                {person.profile_path ? (
                  <img
                    src={person.profile_path}
                    alt={person.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] text-xs">
                    No Image
                  </div>
                )}
              </div>
              <p className="text-xs font-medium text-[var(--color-text)] truncate group-hover:text-[var(--color-accent)] transition-colors">
                {person.name}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] truncate">
                {person.roles?.[0]?.character || person.character || ''}
              </p>
              {person.total_episode_count && (
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {person.total_episode_count} ep{person.total_episode_count > 1 ? 's' : ''}
                </p>
              )}
            </div>
          );

          // Link to person page if flag is on
          if (features.personPages) {
            return (
              <Link key={person.id} to={`/person/${person.id}`}>
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
