import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { site } from '../../config/site';
import { formatMonthDisplay, isMonthInRange, getPreviousMonth, getNextMonth, parseMonth } from './utils';

interface MonthNavigatorProps {
  month: string;
  onMonthChange: (month: string) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function MonthNavigator({ month, onMonthChange, onPrevious, onNext }: MonthNavigatorProps) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const canGoPrevious = isMonthInRange(getPreviousMonth(month));
  const canGoNext = isMonthInRange(getNextMonth(month));

  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    }
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPicker]);

  // Generate month options (-6 to +24 months from current)
  const monthOptions = [];
  const now = new Date();
  for (let i = -6; i <= 24; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const year = date.getFullYear();
    const monthNum = String(date.getMonth() + 1).padStart(2, '0');
    const monthStr = `${year}-${monthNum}`;
    monthOptions.push({
      value: monthStr,
      label: formatMonthDisplay(monthStr),
    });
  }

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

      <div className="relative" ref={pickerRef}>
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center gap-2 text-xl md:text-2xl font-semibold text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors"
          aria-label={site.copy.upcoming.jumpToMonth}
          aria-expanded={showPicker}
        >
          {formatMonthDisplay(month)}
          <Calendar className="w-5 h-5" />
        </button>

        {showPicker && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 max-h-80 overflow-y-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg z-50">
            {monthOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onMonthChange(option.value);
                  setShowPicker(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-surface-raised)] transition-colors ${
                  option.value === month ? 'text-[var(--color-accent)] font-medium' : 'text-[var(--color-text)]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
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
