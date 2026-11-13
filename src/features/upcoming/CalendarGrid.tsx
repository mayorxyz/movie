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
    dayGroups.forEach((group) => map.set(group.date, group));
    return map;
  }, [dayGroups]);

  const firstDayOfWeek = getDayOfWeek(days[0]);

  return (
    <div className="bg-[var(--color-surface)] rounded-[20px] p-4 md:p-5 sticky top-24 self-start z-10">
      <div className="grid grid-cols-7 gap-2 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-muted)] py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2" role="grid" aria-label="Calendar">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {days.map((day) => {
          const dayNum = parseInt(day.substring(8, 10), 10);
          const group = releasesByDay.get(day);
          const releaseCount = group?.releases.length || 0;
          const isPast = isDateInPast(day);
          const isSelected = selectedDay === day;

          return (
            <button
              key={day}
              onClick={() => onDayClick(day)}
              role="gridcell"
              aria-label={`${dayNum} ${releaseCount > 0 ? `${releaseCount} ${site.copy.upcoming.dayReleases}` : ''}`}
              aria-selected={isSelected}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
                isSelected
                  ? 'bg-[var(--color-accent)]'
                  : isPast
                  ? 'bg-[var(--color-surface-raised)] opacity-40 hover:opacity-60'
                  : 'bg-[var(--color-surface-raised)] hover:bg-[var(--color-border)]'
              }`}
            >
              <span
                className={`text-[14px] leading-none font-medium tabular-nums ${
                  isSelected ? 'text-white' : isPast ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'
                }`}
              >
                {dayNum}
              </span>

              {releaseCount > 0 && (
                <div className="flex items-center justify-center gap-px mt-0.5 leading-none max-w-full">
                  {Array.from({ length: Math.min(releaseCount, releaseCount > 3 ? 2 : 3) }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-[3px] h-[3px] rounded-full shrink-0 ${isSelected ? 'bg-white' : 'bg-[var(--color-accent)]'}`}
                    />
                  ))}
                  {releaseCount > 3 && (
                    <span
                      className={`text-[8px] leading-none ml-px tabular-nums ${
                        isSelected ? 'text-white' : 'text-[var(--color-accent)]'
                      }`}
                    >
                      +{releaseCount - 2}
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