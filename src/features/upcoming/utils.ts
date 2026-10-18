import type { UpcomingFilters } from './types';

/**
 * Get current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Parse month string (YYYY-MM) and return year and month
 */
export function parseMonth(month: string): { year: number; month: number } | null {
  const match = month.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;
  
  const year = parseInt(match[1], 10);
  const monthNum = parseInt(match[2], 10);
  
  if (monthNum < 1 || monthNum > 12) return null;
  
  return { year, month: monthNum };
}

/**
 * Get first day of month in YYYY-MM-DD format
 */
export function getFirstDayOfMonth(month: string): string {
  return `${month}-01`;
}

/**
 * Get last day of month in YYYY-MM-DD format
 */
export function getLastDayOfMonth(month: string): string {
  const parsed = parseMonth(month);
  if (!parsed) return `${month}-31`;
  
  const { year, month: monthNum } = parsed;
  
  // Months with 31 days
  if ([1, 3, 5, 7, 8, 10, 12].includes(monthNum)) {
    return `${month}-31`;
  }
  
  // Months with 30 days
  if ([4, 6, 9, 11].includes(monthNum)) {
    return `${month}-30`;
  }
  
  // February - check for leap year
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  return `${month}-${isLeapYear ? '29' : '28'}`;
}

/**
 * Get previous month in YYYY-MM format
 */
export function getPreviousMonth(month: string): string {
  const parsed = parseMonth(month);
  if (!parsed) return month;
  
  const { year, month: monthNum } = parsed;
  
  if (monthNum === 1) {
    return `${year - 1}-12`;
  }
  
  return `${year}-${String(monthNum - 1).padStart(2, '0')}`;
}

/**
 * Get next month in YYYY-MM format
 */
export function getNextMonth(month: string): string {
  const parsed = parseMonth(month);
  if (!parsed) return month;
  
  const { year, month: monthNum } = parsed;
  
  if (monthNum === 12) {
    return `${year + 1}-01`;
  }
  
  return `${year}-${String(monthNum + 1).padStart(2, '0')}`;
}

/**
 * Check if a date string is within the allowed range (-6 to +24 months from current)
 */
export function isMonthInRange(month: string): boolean {
  const parsed = parseMonth(month);
  if (!parsed) return false;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  const { year, month: monthNum } = parsed;
  
  // Calculate months difference
  const monthsDiff = (year - currentYear) * 12 + (monthNum - currentMonth);
  
  // Allow -6 to +24 months
  return monthsDiff >= -6 && monthsDiff <= 24;
}

/**
 * Format month for display (e.g., "November 2026")
 */
export function formatMonthDisplay(month: string): string {
  const parsed = parseMonth(month);
  if (!parsed) return month;
  
  const { year, month: monthNum } = parsed;
  const date = new Date(year, monthNum - 1, 1);
  
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

/**
 * Format date for display using region settings
 */
export function formatDateDisplay(dateStr: string, region: string = 'US'): string {
  const date = new Date(dateStr + 'T00:00:00');
  const locale = region === 'NG' ? 'en-NG' : 'en-US';
  
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Parse URL search params into UpcomingFilters
 */
export function parseUpcomingFilters(searchParams: URLSearchParams): UpcomingFilters {
  const monthParam = searchParams.get('month');
  const typeParam = searchParams.get('type');
  const dayParam = searchParams.get('day');
  
  // Validate month
  let month = getCurrentMonth();
  if (monthParam && parseMonth(monthParam) && isMonthInRange(monthParam)) {
    month = monthParam;
  }
  
  // Validate type
  let type: UpcomingFilters['type'] = 'all';
  if (typeParam === 'movie' || typeParam === 'tv' || typeParam === 'all') {
    type = typeParam;
  }
  
  // Validate day
  let day: string | undefined;
  if (dayParam && dayParam.startsWith(month) && dayParam.length === 10) {
    day = dayParam;
  }
  
  return { month, type, day };
}

/**
 * Convert UpcomingFilters to URL search params
 */
export function filtersToSearchParams(filters: UpcomingFilters): URLSearchParams {
  const params = new URLSearchParams();
  
  params.set('month', filters.month);
  params.set('type', filters.type);
  
  if (filters.day) {
    params.set('day', filters.day);
  }
  
  return params;
}

/**
 * Check if a date is in the past (compared to today)
 */
export function isDateInPast(dateStr: string): boolean {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  return dateStr < todayStr;
}

/**
 * Get day of week for a date (0 = Sunday, 6 = Saturday)
 */
export function getDayOfWeek(dateStr: string): number {
  const date = new Date(dateStr + 'T00:00:00');
  return date.getDay();
}

/**
 * Get all days in a month as YYYY-MM-DD strings
 */
export function getDaysInMonth(month: string): string[] {
  const firstDay = getFirstDayOfMonth(month);
  const lastDay = getLastDayOfMonth(month);
  
  const days: string[] = [];
  let current = firstDay;
  
  while (current <= lastDay) {
    days.push(current);
    
    // Increment day
    const dayNum = parseInt(current.substring(8, 10), 10);
    const nextDay = dayNum + 1;
    current = `${month}-${String(nextDay).padStart(2, '0')}`;
  }
  
  return days;
}
