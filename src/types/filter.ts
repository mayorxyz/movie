// Shared TMDB filter type used across all sections
export interface TmdbFilter {
  mediaType?: 'movie' | 'tv' | 'anime' | 'asian';
  with_genres?: number;
  with_networks?: number;
  with_companies?: number;
  with_cast?: number;
  with_crew?: number;
  with_keywords?: number;
  with_original_language?: string;
  sort_by?: string;
  'vote_count.gte'?: number;
  'release_date.gte'?: string;
  'release_date.lte'?: string;
  'first_air_date.gte'?: string;
  'first_air_date.lte'?: string;
  page?: number;
  [key: string]: string | number | boolean | undefined;
}
