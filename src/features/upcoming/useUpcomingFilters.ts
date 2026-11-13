import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import type { UpcomingFilters, UpcomingType } from './types';
import {
  parseMonth,
  isMonthInRange,
  getPreviousMonth,
  getNextMonth,
  parseUpcomingFilters,
  filtersToSearchParams,
} from './utils';

export function useUpcomingFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const filters = useMemo<UpcomingFilters>(() => {
    return parseUpcomingFilters(searchParams);
  }, [searchParams]);
  
  const setMonth = useCallback((month: string) => {
    if (!parseMonth(month) || !isMonthInRange(month)) return;
    
    setSearchParams(prev => {
      const current = parseUpcomingFilters(prev);
      return filtersToSearchParams({ ...current, month, day: undefined });
    }, { replace: true });
  }, [setSearchParams]);
  
  const setType = useCallback((type: UpcomingType) => {
    setSearchParams(prev => {
      const current = parseUpcomingFilters(prev);
      return filtersToSearchParams({ ...current, type });
    }, { replace: true });
  }, [setSearchParams]);
  
  const setDay = useCallback((day: string | undefined) => {
    setSearchParams(prev => {
      const current = parseUpcomingFilters(prev);
      return filtersToSearchParams({ ...current, day });
    }, { replace: true });
  }, [setSearchParams]);
  
  const goToPreviousMonth = useCallback(() => {
    const prevMonth = getPreviousMonth(filters.month);
    if (isMonthInRange(prevMonth)) {
      // We can safely call setMonth here; it will handle the validation
      // Alternatively, inline the logic to avoid double parsing, but setMonth is fine.
      setSearchParams(prev => {
        const current = parseUpcomingFilters(prev);
        return filtersToSearchParams({ ...current, month: prevMonth, day: undefined });
      }, { replace: true });
    }
  }, [filters.month, setSearchParams]);
  
  const goToNextMonth = useCallback(() => {
    const nextMonth = getNextMonth(filters.month);
    if (isMonthInRange(nextMonth)) {
      setSearchParams(prev => {
        const current = parseUpcomingFilters(prev);
        return filtersToSearchParams({ ...current, month: nextMonth, day: undefined });
      }, { replace: true });
    }
  }, [filters.month, setSearchParams]);
  
  return {
    ...filters,
    setMonth,
    setType,
    setDay,
    goToPreviousMonth,
    goToNextMonth,
  };
}