import { describe, it, expect } from 'vitest';
import { today, isReleased, filterReleased, dedupeById } from './releaseFilters';

describe('today', () => {
  it('returns YYYY-MM-DD format', () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('respects configured timezone by default', () => {
    expect(today('Africa/Lagos')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('isReleased', () => {
  const ref = '2026-06-15';

  it('treats past movie dates as released', () => {
    expect(isReleased({ id: 1, media_type: 'movie', release_date: '2026-06-14' }, ref)).toBe(true);
  });

  it('treats today as released', () => {
    expect(isReleased({ id: 1, media_type: 'movie', release_date: '2026-06-15' }, ref)).toBe(true);
    expect(isReleased({ id: 2, media_type: 'tv', first_air_date: '2026-06-15' }, ref)).toBe(true);
  });

  it('treats tomorrow as unreleased', () => {
    expect(isReleased({ id: 1, media_type: 'movie', release_date: '2026-06-16' }, ref)).toBe(false);
    expect(isReleased({ id: 2, media_type: 'tv', first_air_date: '2026-06-16' }, ref)).toBe(false);
  });

  it('treats missing date as unreleased', () => {
    expect(isReleased({ id: 1, media_type: 'movie' }, ref)).toBe(false);
    expect(isReleased({ id: 2, media_type: 'tv' }, ref)).toBe(false);
  });

  it('treats empty string as unreleased', () => {
    expect(isReleased({ id: 1, media_type: 'movie', release_date: '' }, ref)).toBe(false);
    expect(isReleased({ id: 2, media_type: 'tv', first_air_date: '' }, ref)).toBe(false);
  });

  it('handles month boundary (May 31 -> Jun 1)', () => {
    expect(isReleased({ id: 1, media_type: 'movie', release_date: '2026-05-31' }, '2026-06-01')).toBe(true);
    expect(isReleased({ id: 2, media_type: 'movie', release_date: '2026-06-01' }, '2026-05-31')).toBe(false);
  });

  it('handles year boundary (Dec 31 -> Jan 1)', () => {
    expect(isReleased({ id: 1, media_type: 'movie', release_date: '2025-12-31' }, '2026-01-01')).toBe(true);
    expect(isReleased({ id: 2, media_type: 'movie', release_date: '2026-01-01' }, '2025-12-31')).toBe(false);
  });

  it('uses title/name to infer media type when media_type is absent', () => {
    expect(isReleased({ id: 1, title: 'M', release_date: '2026-06-14' }, ref)).toBe(true);
    expect(isReleased({ id: 2, name: 'S', first_air_date: '2026-06-16' }, ref)).toBe(false);
  });
});

describe('filterReleased', () => {
  const ref = '2026-06-15';

  it('keeps released items with posters and drops the rest', () => {
    const items = [
      { id: 1, media_type: 'movie', release_date: '2026-06-14', poster_path: '/a.jpg' },
      { id: 2, media_type: 'movie', release_date: '2026-06-16', poster_path: '/b.jpg' },
      { id: 3, media_type: 'movie', release_date: '2026-06-14', poster_path: null },
      { id: 4, media_type: 'movie', release_date: '', poster_path: '/d.jpg' },
    ];
    expect(filterReleased(items, { todayStr: ref }).map((i) => i.id)).toEqual([1]);
  });

  it('can skip the poster requirement', () => {
    const items = [{ id: 1, media_type: 'movie', release_date: '2026-06-14', poster_path: null }];
    expect(filterReleased(items, { requirePoster: false, todayStr: ref })).toHaveLength(1);
  });
});

describe('dedupeById', () => {
  it('removes duplicates across pages, keeping first occurrence', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 1 }, { id: 3 }, { id: 2 }];
    expect(dedupeById(items).map((i) => i.id)).toEqual([1, 2, 3]);
  });
});
