export interface UpcomingRelease {
  id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  overview: string;
  genre_ids: number[];
  popularity: number;
}

export interface UpcomingDayGroup {
  date: string; // YYYY-MM-DD
  releases: UpcomingRelease[];
}

export type UpcomingType = 'movie' | 'tv' | 'all';

export interface UpcomingFilters {
  month: string; // YYYY-MM
  type: UpcomingType;
  day?: string; // YYYY-MM-DD (optional)
}
