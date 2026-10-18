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
      <div className="text-center py-12">
        <p className="text-[var(--color-text-muted)]">
          {site.copy.upcoming.noReleases}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dayGroups.map(group => (
        <div key={group.date}>
          <div className="text-sm font-medium text-[var(--color-text-muted)] mb-3">
            {formatDateDisplay(group.date, site.region.default)}
          </div>
          <div className="space-y-3">
            {group.releases.map(release => (
              <ReleaseCard key={`${release.media_type}-${release.id}`} release={release} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
