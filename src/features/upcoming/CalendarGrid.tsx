import { useMemo } from 'react';
import type { UpcomingDayGroup } from './types';
import { getDaysInMonth, getDayOfWeek, isDateInPast } from './utils';
import { site } from '../../config/site';

interface CalendarGridProps {
  month: string;
  dayGroups: UpcomingDayGroup[];
  selectedDay?: string;
  onDayClick: (day: string) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarGrid({ month, dayGroups, selectedDay, onDayClick }: CalendarGridProps) {
  const days = useMemo(() => getDaysInMonth(month), [month]);
  
  const releasesByDay = useMemo(() => {
    const map = new Map<string, UpcomingDayGroup>();
    dayGroups.forEach(group => {
      map.set(group.date, group);
    });
    return map;
  }, [dayGroups]);

  // Calculate starting offset for first day of month
  const firstDayOfWeek = getDayOfWeek(days[0]);

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {WEEKDAYS.map(day => (
          <div
            key={day}
            className="text-center text-xs font-medium text-[var(--color-text-muted)] py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2" role="grid" aria-label="Calendar">
        {/* Empty cells for days before first of month */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Day cells */}
        {days.map(day => {
          const dayNum = parseInt(day.substring(8, 10), 10);
          const group = releasesByDay.get(day);
          const releaseCount = group?.releases.length || 0;
          const isPast = isDateInPast(day);
          const isSelected = selectedDay === day;

          return (
            <button
              key={day}
              onClick={() => onDayClick(day)}
              className={`aspect-square rounded-lg border transition-all flex flex-col items-center justify-center relative ${
                isSelected
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                  : isPast
                  ? 'border-[var(--color-border)] bg-[var(--color-surface-raised)] opacity-50'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-text-muted)]'
              }`}
              role="gridcell"
              aria-label={`${dayNum} ${releaseCount > 0 ? `${releaseCount} ${site.copy.upcoming.dayReleases}` : ''}`}
              aria-selected={isSelected}
            >
              <span className={`text-sm font-medium ${isPast ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'}`}>
                {dayNum}
              </span>
              
              {/* Poster dots indicator */}
              {releaseCount > 0 && (
                <div className="flex gap-0.5 mt-1">
                  {Array.from({ length: Math.min(releaseCount, 3) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-1 rounded-full bg-[var(--color-accent)]"
                    />
                  ))}
                  {releaseCount > 3 && (
                    <span className="text-xs text-[var(--color-accent)] ml-0.5">
                      +{releaseCount - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
