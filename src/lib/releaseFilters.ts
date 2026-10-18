import { site } from '../config/site';

export interface ReleaseDatedItem {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  release_date?: string | null;
  first_air_date?: string | null;
  poster_path?: string | null;
}

/** Current date as YYYY-MM-DD in the configured timezone. String comparison only. */
export function today(timezone: string = site.settings.timezone): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

/** Shift a YYYY-MM-DD string by a number of days using UTC math on the date parts. */
export function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

/** Shift a YYYY-MM-DD string by a number of years (clamps Feb 29 to Feb 28). */
export function shiftYears(dateStr: string, years: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y + years, m - 1, d));
  // Clamp month overflow (e.g. Feb 29 -> Mar 1 becomes Feb 28)
  if (dt.getUTCMonth() !== m - 1) {
    return shiftDate(`${y + years}-${String(m).padStart(2, '0')}-01`, -1);
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

/** True when the item has a real date on or before `todayStr`. Missing/empty = unreleased. */
export function isReleased(item: ReleaseDatedItem, todayStr: string = today()): boolean {
  const mediaType = item.media_type ?? (item.title ? 'movie' : item.name ? 'tv' : 'movie');
  const date = mediaType === 'tv' ? item.first_air_date : item.release_date;
  if (!date || date.trim() === '') return false;
  return date <= todayStr;
}

export function filterReleased<T extends ReleaseDatedItem>(
  items: T[],
  options: { requirePoster?: boolean; todayStr?: string } = {},
): T[] {
  const { requirePoster = true, todayStr = today() } = options;
  return items.filter((item) => {
    if (requirePoster && !item.poster_path) return false;
    return isReleased(item, todayStr);
  });
}

/** Remove duplicates by id, preserving first occurrence. */
export function dedupeById<T extends { id: number }>(items: T[]): T[] {
  const seen = new Set<number>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function getReleaseDate(item: ReleaseDatedItem): string {
  return item.release_date ?? item.first_air_date ?? '';
}
