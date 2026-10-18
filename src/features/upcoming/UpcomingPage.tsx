import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { useUpcomingFilters } from './useUpcomingFilters';
import { useUpcomingReleases } from './useUpcomingReleases';
import { UpcomingHeader } from './UpcomingHeader';
import { MonthNavigator } from './MonthNavigator';
import { CalendarGrid } from './CalendarGrid';
import { ReleaseList } from './ReleaseList';
import { DayGroupedList } from './DayGroupedList';
import { UpcomingPageSkeleton } from './UpcomingPageSkeleton';
import { features } from '../../config/features';

export default function UpcomingPage() {
  // If feature is disabled, redirect to 404
  if (!features.upcomingCalendar) {
    return <Navigate to="/404" replace />;
  }

  const { month, type, day, setMonth, setType, setDay, goToPreviousMonth, goToNextMonth } = useUpcomingFilters();
  const { dayGroups, isLoading, isError, error } = useUpcomingReleases({ month, type });

  const handleDayClick = (clickedDay: string) => {
    // Toggle: if clicking the same day, clear selection
    if (day === clickedDay) {
      setDay(undefined);
    } else {
      setDay(clickedDay);
    }
  };

  if (isLoading) {
    return <UpcomingPageSkeleton />;
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--color-text-muted)] mb-4">Failed to load upcoming releases</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-text-muted)] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[var(--color-base)] px-4 md:px-8 lg:px-12 py-8"
    >
      <UpcomingHeader type={type} onTypeChange={setType} />
      
      <MonthNavigator
        month={month}
        onMonthChange={setMonth}
        onPrevious={goToPreviousMonth}
        onNext={goToNextMonth}
      />

      {/* Desktop layout */}
      <div className="hidden md:grid md:grid-cols-[1fr_400px] gap-8">
        <CalendarGrid
          month={month}
          dayGroups={dayGroups}
          selectedDay={day}
          onDayClick={handleDayClick}
        />
        <ReleaseList dayGroups={dayGroups} selectedDay={day} />
      </div>

      {/* Mobile layout */}
      <div className="md:hidden">
        <DayGroupedList dayGroups={dayGroups} />
      </div>
    </motion.div>
  );
}
