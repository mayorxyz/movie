import { ChevronLeft, ChevronRight } from 'lucide-react';
import { site } from '../../config/site';
import { formatMonthDisplay, isMonthInRange, getPreviousMonth, getNextMonth } from './utils';

interface MonthNavigatorProps {
  month: string;
  onMonthChange: (month: string) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function MonthNavigator({ month, onMonthChange, onPrevious, onNext }: MonthNavigatorProps) {
  const canGoPrevious = isMonthInRange(getPreviousMonth(month));
  const canGoNext = isMonthInRange(getNextMonth(month));

  return (
    <div className="flex items-center justify-between mb-8">
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="p-2 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-text-muted)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={site.copy.upcoming.previousMonth}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="text-xl md:text-2xl font-semibold text-[var(--color-text)]">
        {formatMonthDisplay(month)}
      </div>

      <button
        onClick={onNext}
        disabled={!canGoNext}
        className="p-2 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-text-muted)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={site.copy.upcoming.nextMonth}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
