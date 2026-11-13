import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useUpcomingFilters } from './useUpcomingFilters';
import { useUpcomingReleases } from './useUpcomingReleases';
import { UpcomingHeader } from './UpcomingHeader';
import { MonthNavigator } from './MonthNavigator';
import { CalendarGrid } from './CalendarGrid';
import { ReleaseList } from './ReleaseList';
import { DayGroupedList } from './DayGroupedList';
import { UpcomingPageSkeleton } from './UpcomingPageSkeleton';
import { features } from '../../config/features';

function UpcomingContent() {
  const { month, type, day, setMonth, setType, setDay, goToPreviousMonth, goToNextMonth } = useUpcomingFilters();
  const { dayGroups, isLoading, isError } = useUpcomingReleases({ month, type });

  // Toggle: clicking the selected day clears the selection
  const handleDayClick = (clickedDay: string) => {
    setDay(day === clickedDay ? undefined : clickedDay);
  };

  if (isLoading) return <UpcomingPageSkeleton />;

  if (isError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--color-text-faint)] mb-4" strokeWidth={1.5} />
        <h2 className="text-[16px] font-semibold text-[var(--color-text)]">Failed to load upcoming releases</h2>
        <p className="text-[14px] text-[var(--color-text-muted)] mt-1 mb-6">Check your connection and try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="h-10 sm:h-11 px-5 sm:px-6 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-[13px] sm:text-[14px] font-semibold active:scale-[0.98] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen px-4 md:px-8 lg:px-12 py-6 sm:py-8 pb-16"
    >
      <UpcomingHeader type={type} onTypeChange={setType} />

      <div className="mb-6 sm:mb-8">
        <MonthNavigator
          month={month}
          onMonthChange={setMonth}
          onPrevious={goToPreviousMonth}
          onNext={goToNextMonth}
        />
      </div>

      {/* Desktop Layout: Calendar + List */}
      <div className="hidden md:grid md:grid-cols-[1fr_400px] gap-8 items-start">
        <CalendarGrid month={month} dayGroups={dayGroups} selectedDay={day} onDayClick={handleDayClick} />
        <ReleaseList dayGroups={dayGroups} selectedDay={day} />
      </div>

      {/* Mobile Layout: Vertical List */}
      <div className="md:hidden">
        <DayGroupedList dayGroups={dayGroups} />
      </div>
    </motion.div>
  );
}

export default function UpcomingPage() {
  // Feature off: redirect to 404
  if (!features.upcomingCalendar) {
    return <Navigate to="/404" replace />;
  }
  return <UpcomingContent />;
}