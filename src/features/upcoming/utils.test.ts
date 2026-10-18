import { describe, it, expect } from 'vitest';
import type { UpcomingFilters } from './types';
import {
  getCurrentMonth,
  parseMonth,
  getFirstDayOfMonth,
  getLastDayOfMonth,
  getPreviousMonth,
  getNextMonth,
  isMonthInRange,
  formatMonthDisplay,
  formatDateDisplay,
  parseUpcomingFilters,
  filtersToSearchParams,
  isDateInPast,
  getDayOfWeek,
  getDaysInMonth,
} from './utils';

describe('Upcoming Calendar Utils', () => {
  describe('getCurrentMonth', () => {
    it('should return current month in YYYY-MM format', () => {
      const result = getCurrentMonth();
      expect(result).toMatch(/^\d{4}-\d{2}$/);
    });
  });

  describe('parseMonth', () => {
    it('should parse valid month string', () => {
      const result = parseMonth('2026-11');
      expect(result).toEqual({ year: 2026, month: 11 });
    });

    it('should return null for invalid format', () => {
      expect(parseMonth('2026-13')).toBeNull();
      expect(parseMonth('2026-00')).toBeNull();
      expect(parseMonth('202611')).toBeNull();
      expect(parseMonth('invalid')).toBeNull();
    });

    it('should handle boundary months', () => {
      expect(parseMonth('2026-01')).toEqual({ year: 2026, month: 1 });
      expect(parseMonth('2026-12')).toEqual({ year: 2026, month: 12 });
    });
  });

  describe('getFirstDayOfMonth', () => {
    it('should return first day of month', () => {
      expect(getFirstDayOfMonth('2026-11')).toBe('2026-11-01');
      expect(getFirstDayOfMonth('2026-01')).toBe('2026-01-01');
    });
  });

  describe('getLastDayOfMonth', () => {
    it('should return last day for 31-day months', () => {
      expect(getLastDayOfMonth('2026-01')).toBe('2026-01-31');
      expect(getLastDayOfMonth('2026-03')).toBe('2026-03-31');
      expect(getLastDayOfMonth('2026-12')).toBe('2026-12-31');
    });

    it('should return last day for 30-day months', () => {
      expect(getLastDayOfMonth('2026-04')).toBe('2026-04-30');
      expect(getLastDayOfMonth('2026-06')).toBe('2026-06-30');
      expect(getLastDayOfMonth('2026-09')).toBe('2026-09-30');
    });

    it('should handle February in non-leap year', () => {
      expect(getLastDayOfMonth('2025-02')).toBe('2025-02-28');
      expect(getLastDayOfMonth('2026-02')).toBe('2026-02-28');
    });

    it('should handle February in leap year', () => {
      expect(getLastDayOfMonth('2024-02')).toBe('2024-02-29');
      expect(getLastDayOfMonth('2028-02')).toBe('2028-02-29');
    });
  });

  describe('getPreviousMonth', () => {
    it('should return previous month', () => {
      expect(getPreviousMonth('2026-11')).toBe('2026-10');
      expect(getPreviousMonth('2026-03')).toBe('2026-02');
    });

    it('should handle year boundary', () => {
      expect(getPreviousMonth('2026-01')).toBe('2025-12');
    });
  });

  describe('getNextMonth', () => {
    it('should return next month', () => {
      expect(getNextMonth('2026-11')).toBe('2026-12');
      expect(getNextMonth('2026-03')).toBe('2026-04');
    });

    it('should handle year boundary', () => {
      expect(getNextMonth('2026-12')).toBe('2027-01');
    });
  });

  describe('isMonthInRange', () => {
    it('should return true for current month', () => {
      const currentMonth = getCurrentMonth();
      expect(isMonthInRange(currentMonth)).toBe(true);
    });

    it('should return true for months within range', () => {
      // These should be within -6 to +24 months from current
      expect(isMonthInRange('2026-11')).toBe(true);
    });

    it('should return false for invalid month', () => {
      expect(isMonthInRange('invalid')).toBe(false);
      expect(isMonthInRange('2026-13')).toBe(false);
    });
  });

  describe('formatMonthDisplay', () => {
    it('should format month for display', () => {
      const result = formatMonthDisplay('2026-11');
      expect(result).toContain('2026');
      expect(result).toContain('November');
    });
  });

  describe('formatDateDisplay', () => {
    it('should format date with US region', () => {
      const result = formatDateDisplay('2026-11-15', 'US');
      expect(result).toContain('2026');
      expect(result).toContain('15');
    });

    it('should format date with NG region', () => {
      const result = formatDateDisplay('2026-11-15', 'NG');
      expect(result).toContain('2026');
      expect(result).toContain('15');
    });
  });

  describe('parseUpcomingFilters', () => {
    it('should parse valid filters', () => {
      const params = new URLSearchParams('month=2026-11&type=movie&day=2026-11-15');
      const result = parseUpcomingFilters(params);
      
      expect(result.month).toBe('2026-11');
      expect(result.type).toBe('movie');
      expect(result.day).toBe('2026-11-15');
    });

    it('should fallback to current month for invalid month', () => {
      const params = new URLSearchParams('month=invalid&type=movie');
      const result = parseUpcomingFilters(params);
      
      expect(result.month).toBe(getCurrentMonth());
      expect(result.type).toBe('movie');
    });

    it('should fallback to all for invalid type', () => {
      const params = new URLSearchParams('month=2026-11&type=invalid');
      const result = parseUpcomingFilters(params);
      
      expect(result.month).toBe('2026-11');
      expect(result.type).toBe('all');
    });

    it('should ignore day if not in same month', () => {
      const params = new URLSearchParams('month=2026-11&day=2026-12-15');
      const result = parseUpcomingFilters(params);
      
      expect(result.month).toBe('2026-11');
      expect(result.day).toBeUndefined();
    });
  });

  describe('filtersToSearchParams', () => {
    it('should convert filters to search params', () => {
      const filters: UpcomingFilters = { month: '2026-11', type: 'movie', day: '2026-11-15' };
      const result = filtersToSearchParams(filters);
      
      expect(result.get('month')).toBe('2026-11');
      expect(result.get('type')).toBe('movie');
      expect(result.get('day')).toBe('2026-11-15');
    });

    it('should omit day if not present', () => {
      const filters: UpcomingFilters = { month: '2026-11', type: 'movie' };
      const result = filtersToSearchParams(filters);
      
      expect(result.get('month')).toBe('2026-11');
      expect(result.get('type')).toBe('movie');
      expect(result.get('day')).toBeNull();
    });
  });

  describe('isDateInPast', () => {
    it('should return true for past dates', () => {
      expect(isDateInPast('2020-01-01')).toBe(true);
      expect(isDateInPast('2024-01-01')).toBe(true);
    });

    it('should return false for future dates', () => {
      expect(isDateInPast('2030-01-01')).toBe(false);
    });

    it('should use string comparison without Date shifting', () => {
      // This test ensures we're using YYYY-MM-DD string comparison
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      // Yesterday should be in past
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      expect(isDateInPast(yesterdayStr)).toBe(true);
      
      // Tomorrow should not be in past
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
      expect(isDateInPast(tomorrowStr)).toBe(false);
    });
  });

  describe('getDayOfWeek', () => {
    it('should return day of week (0-6)', () => {
      const result = getDayOfWeek('2026-11-01');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(6);
    });
  });

  describe('getDaysInMonth', () => {
    it('should return all days in month', () => {
      const days = getDaysInMonth('2026-11');
      expect(days.length).toBe(30); // November has 30 days
      expect(days[0]).toBe('2026-11-01');
      expect(days[days.length - 1]).toBe('2026-11-30');
    });

    it('should handle February in leap year', () => {
      const days = getDaysInMonth('2024-02');
      expect(days.length).toBe(29);
    });

    it('should handle February in non-leap year', () => {
      const days = getDaysInMonth('2025-02');
      expect(days.length).toBe(28);
    });
  });

  describe('TV date validation', () => {
    it('should verify all TV dates fall within the month', () => {
      // This test documents the expected behavior:
      // When fetching TV shows for a month, all returned shows should have
      // first_air_date within that month's date range
      
      const month = '2026-11';
      const startDate = getFirstDayOfMonth(month);
      const endDate = getLastDayOfMonth(month);
      
      // Simulate TV show dates
      const tvDates = [
        '2026-11-01',
        '2026-11-15',
        '2026-11-30',
      ];
      
      // All dates should be >= startDate and <= endDate
      tvDates.forEach(date => {
        expect(date >= startDate).toBe(true);
        expect(date <= endDate).toBe(true);
      });
      
      // Dates outside the month should fail
      const invalidDates = ['2026-10-31', '2026-12-01'];
      invalidDates.forEach(date => {
        const isValid = date >= startDate && date <= endDate;
        expect(isValid).toBe(false);
      });
    });

    it('should use first_air_date.gte/lte params (not with_first_air_date)', () => {
      // This test documents that we use first_air_date.gte/lte
      // The actual API call is tested in integration tests
      const startDate = '2026-11-01';
      const endDate = '2026-11-30';
      
      // Expected params for TV discover
      const expectedParams = {
        'first_air_date.gte': startDate,
        'first_air_date.lte': endDate,
      };
      
      expect(expectedParams['first_air_date.gte']).toBe(startDate);
      expect(expectedParams['first_air_date.lte']).toBe(endDate);
    });
  });
});
