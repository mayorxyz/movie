import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { site } from '../../config/site';
import { formatMonthDisplay, isMonthInRange, getPreviousMonth, getNextMonth } from './utils';

interface MonthNavigatorProps {
  month: string;
  onMonthChange: (month: string) => void;
  onPrevious: () => void;
  onNext: () => void;
}

const navBtn =
  'w-11 h-11 inline-flex items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-raised)] active:scale-95 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]';

export function MonthNavigator({ month, onMonthChange, onPrevious, onNext }: MonthNavigatorProps) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const canGoPrevious = isMonthInRange(getPreviousMonth(month));
  const canGoNext = isMonthInRange(getNextMonth(month));

  useEffect(() => {
    if (!showPicker) return;
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setShowPicker(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [showPicker]);

  // Month options: -6 to +24 months from current
  const monthOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const now = new Date();
    for (let i = -6; i <= 24; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      options.push({ value: monthStr, label: formatMonthDisplay(monthStr) });
    }
    return options;
  }, []);

  return (
    <div className="flex items-center justify-between mb-8">
      <button onClick={onPrevious} disabled={!canGoPrevious} className={navBtn} aria-label={site.copy.upcoming.previousMonth}>
        <ChevronLeft className="w-5 h-5" strokeWidth={1.75} />
      </button>

      <div className="relative" ref={pickerRef}>
        <button
          onClick={() => setShowPicker(!showPicker)}
          aria-label={site.copy.upcoming.jumpToMonth}
          aria-expanded={showPicker}
          className="inline-flex items-center gap-3 h-11 px-5 rounded-full text-[20px] md:text-[24px] font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        >
          {formatMonthDisplay(month)}
          <Calendar className="w-5 h-5 text-[var(--color-text-muted)]" strokeWidth={1.75} />
        </button>

        {showPicker && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 max-h-80 overflow-y-auto p-1 bg-[var(--color-surface-raised)] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-50">
            {monthOptions.map((option) => {
              const selected = option.value === month;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onMonthChange(option.value);
                    setShowPicker(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-[14px] hover:bg-[var(--color-surface)] transition-colors ${
                    selected ? 'text-[var(--color-text)] font-medium' : 'text-[var(--color-text-muted)]'
                  }`}
                >
                  {option.label}
                  {selected && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button onClick={onNext} disabled={!canGoNext} className={navBtn} aria-label={site.copy.upcoming.nextMonth}>
        <ChevronRight className="w-5 h-5" strokeWidth={1.75} />
      </button>
    </div>
  );
}