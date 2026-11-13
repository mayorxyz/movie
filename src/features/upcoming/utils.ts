import type { UpcomingFilters } from './types';

/**
 * Get current month in YYYY-MM format (local time)
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
 * Uses native Date logic to perfectly handle leap years and varying month lengths.
 */
export function getLastDayOfMonth(month: string): string {
  const parsed = parseMonth(month);
  if (!parsed) return `${month}-31`;
  
  // new Date(year, month, 0) gets the last day of the previous month
  const lastDate = new Date(parsed.year, parsed.month, 0).getDate();
  return `${month}-${String(lastDate).padStart(2, '0')}`;
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
  const monthsDiff = (year - currentYear) * 12 + (monthNum - currentMonth);
  
  return monthsDiff >= -6 && monthsDiff <= 24;
}

/**
 * Format month for display (e.g., "November 2026")
 */
export function formatMonthDisplay(month: string): string {
  const parsed = parseMonth(month);
  if (!parsed) return month;
  
  const date = new Date(parsed.year, parsed.month - 1, 1);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

/**
 * Format date for display using region settings
 * Appends local time to prevent UTC timezone shift from changing the displayed day.
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
  
  let month = getCurrentMonth();
  if (monthParam && parseMonth(monthParam) && isMonthInRange(monthParam)) {
    month = monthParam;
  }
  
  let type: UpcomingFilters['type'] = 'all';
  if (typeParam === 'movie' || typeParam === 'tv' || typeParam === 'all') {
    type = typeParam;
  }
  
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
 * Uses 'en-CA' locale which reliably outputs YYYY-MM-DD in local time, 
 * avoiding manual padding and UTC midnight shift bugs.
 */
export function isDateInPast(dateStr: string): boolean {
  const todayStr = new Date().toLocaleDateString('en-CA');
  return dateStr < todayStr;
}

/**
 * Get day of week for a date (0 = Sunday, 6 = Saturday)
 * Appends local time to prevent UTC timezone shift from changing the day.
 */
export function getDayOfWeek(dateStr: string): number {
  const date = new Date(dateStr + 'T00:00:00');
  return date.getDay();
}

/**
 * Get all days in a month as YYYY-MM-DD strings
 */
export function getDaysInMonth(month: string): string[] {
  const parsed = parseMonth(month);
  if (!parsed) return [];
  
  const daysInMonth = new Date(parsed.year, parsed.month, 0).getDate();
  const days: string[] = [];
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(`${month}-${String(i).padStart(2, '0')}`);
  }
  
  return days;
}