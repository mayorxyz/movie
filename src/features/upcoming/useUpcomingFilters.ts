import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import type { UpcomingFilters, UpcomingType } from './types';
import {
  getCurrentMonth,
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
    
    const newFilters: UpcomingFilters = {
      ...filters,
      month,
      day: undefined, // Clear day when month changes
    };
    
    setSearchParams(filtersToSearchParams(newFilters), { replace: true });
  }, [filters, setSearchParams]);
  
  const setType = useCallback((type: UpcomingType) => {
    const newFilters: UpcomingFilters = {
      ...filters,
      type,
    };
    
    setSearchParams(filtersToSearchParams(newFilters), { replace: true });
  }, [filters, setSearchParams]);
  
  const setDay = useCallback((day: string | undefined) => {
    const newFilters: UpcomingFilters = {
      ...filters,
      day,
    };
    
    setSearchParams(filtersToSearchParams(newFilters), { replace: true });
  }, [filters, setSearchParams]);
  
  const goToPreviousMonth = useCallback(() => {
    const prevMonth = getPreviousMonth(filters.month);
    if (isMonthInRange(prevMonth)) {
      setMonth(prevMonth);
    }
  }, [filters.month, setMonth]);
  
  const goToNextMonth = useCallback(() => {
    const nextMonth = getNextMonth(filters.month);
    if (isMonthInRange(nextMonth)) {
      setMonth(nextMonth);
    }
  }, [filters.month, setMonth]);
  
  return {
    ...filters,
    setMonth,
    setType,
    setDay,
    goToPreviousMonth,
    goToNextMonth,
  };
}
