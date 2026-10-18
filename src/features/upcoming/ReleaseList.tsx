import type { UpcomingDayGroup } from './types';
import { ReleaseCard } from './ReleaseCard';
import { formatDateDisplay } from './utils';
import { site } from '../../config/site';

interface ReleaseListProps {
  dayGroups: UpcomingDayGroup[];
  selectedDay?: string;
}

export function ReleaseList({ dayGroups, selectedDay }: ReleaseListProps) {
  // Filter to selected day if specified
  const filteredGroups = selectedDay
    ? dayGroups.filter(group => group.date === selectedDay)
    : dayGroups;

  if (filteredGroups.length === 0) {
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
      {selectedDay && (
        <div className="text-lg font-semibold text-[var(--color-text)]">
          {formatDateDisplay(selectedDay, site.region.default)}
        </div>
      )}

      {filteredGroups.map(group => (
        <div key={group.date}>
          {!selectedDay && (
            <div className="text-sm font-medium text-[var(--color-text-muted)] mb-3">
              {formatDateDisplay(group.date, site.region.default)}
            </div>
          )}
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
