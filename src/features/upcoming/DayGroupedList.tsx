import type { UpcomingDayGroup } from './types';
import { ReleaseCard } from './ReleaseCard';
import { formatDateDisplay } from './utils';
import { site } from '../../config/site';

interface DayGroupedListProps {
  dayGroups: UpcomingDayGroup[];
}

export function DayGroupedList({ dayGroups }: DayGroupedListProps) {
  if (dayGroups.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16">
        <p className="text-[14px] text-[var(--color-text-muted)]">{site.copy.upcoming.noReleases}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {dayGroups.map((group) => (
        <section key={group.date}>
          <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[var(--color-accent)] shrink-0" />
            <h3 className="text-[12px] sm:text-[13px] font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
              {formatDateDisplay(group.date, site.region.default)}
            </h3>
          </div>
          <div className="space-y-2.5 sm:space-y-3">
            {group.releases.map((release) => (
              <ReleaseCard key={`${release.media_type}-${release.id}`} release={release} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}