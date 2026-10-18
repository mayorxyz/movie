import type { TmdbFilter } from '../types/filter';

// Media type presets for filtering
export const mediaPresets = {
  all: {
    id: 'all',
    label: 'All',
    filter: {} as TmdbFilter,
  },
  movie: {
    id: 'movie',
    label: 'Movie',
    filter: {
      mediaType: 'movie',
    } as TmdbFilter,
  },
  tv: {
    id: 'tv',
    label: 'TV Show',
    filter: {
      mediaType: 'tv',
    } as TmdbFilter,
  },
  anime: {
    id: 'anime',
    label: 'Anime',
    filter: {
      mediaType: 'tv',
      with_genres: 16, // Animation
      with_original_language: 'ja',
    } as TmdbFilter,
  },
  asian: {
    id: 'asian',
    label: 'Asian',
    filter: {
      mediaType: 'tv',
      with_original_language: 'ko|ja|zh|th|hi',
    } as TmdbFilter,
  },
} as const;

export type MediaPresetId = keyof typeof mediaPresets;

export const globalFilterChips = [
  mediaPresets.all,
  mediaPresets.movie,
  mediaPresets.tv,
  mediaPresets.anime,
  mediaPresets.asian,
];
