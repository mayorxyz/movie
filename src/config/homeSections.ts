import type { TmdbFilter } from '../types/filter';
import type { FeatureFlag } from './features';

// Section types
export type SectionType =
  | 'trending'
  | 'latest'
  | 'recommendations'
  | 'topRated'
  | 'bestOf'
  | 'franchises'
  | 'genre'
  | 'curated'
  | 'loadMore';

// Card variants
export type CardVariant = 'poster' | 'wideRank' | 'franchise';

// Tab configuration
export interface TabConfig {
  id: string;
  label: string;
  filter: TmdbFilter;
}

// Dropdown option
export interface DropdownOption {
  id: string | number;
  label: string;
  filter: TmdbFilter;
}

// Section configuration
export interface SectionConfig {
  id: string;
  type: SectionType;
  title: string;
  seeAllLink?: string;
  cardVariant: CardVariant;

  // Tabs (for trending, latest, topRated)
  tabs?: TabConfig[];
  defaultTab?: string;

  // Dropdown (for bestOf, genre, curated)
  dropdown?: {
    label: string;
    options: DropdownOption[];
    defaultOption?: string | number;
  };

  // Fetcher configuration
  fetcher: {
    endpoint: string;
    params?: TmdbFilter;
    transform?: (data: any) => any[];
  };

  // Display options
  minItems?: number;
  maxItems?: number;
  showRank?: boolean;

  // Global filter behavior
  respectsGlobalFilter?: boolean;

  // Feature flags
  enabled?: boolean;
  featureFlag?: FeatureFlag;
}

// Home page configuration
export interface HomeConfig {
  sections: SectionConfig[];
}

// Curated data for dropdowns
const curatedStudios = [
  { id: 213, label: 'Netflix', filter: { with_networks: 213 } as TmdbFilter },
  { id: 49, label: 'HBO', filter: { with_networks: 49 } as TmdbFilter },
  { id: 2552, label: 'Apple TV+', filter: { with_networks: 2552 } as TmdbFilter },
  { id: 2739, label: 'Disney+', filter: { with_networks: 2739 } as TmdbFilter },
  { id: 1024, label: 'Amazon', filter: { with_networks: 1024 } as TmdbFilter },
];

const curatedGenres = [
  { id: 28, label: 'Action', filter: { with_genres: 28 } as TmdbFilter },
  { id: 35, label: 'Comedy', filter: { with_genres: 35 } as TmdbFilter },
  { id: 18, label: 'Drama', filter: { with_genres: 18 } as TmdbFilter },
  { id: 27, label: 'Horror', filter: { with_genres: 27 } as TmdbFilter },
  { id: 878, label: 'Science Fiction', filter: { with_genres: 878 } as TmdbFilter },
  { id: 10749, label: 'Romance', filter: { with_genres: 10749 } as TmdbFilter },
  { id: 53, label: 'Thriller', filter: { with_genres: 53 } as TmdbFilter },
  { id: 16, label: 'Animation', filter: { with_genres: 16 } as TmdbFilter },
];

const curatedDirectors = [
  { id: 525, label: 'Christopher Nolan', filter: { with_crew: 525 } as TmdbFilter },
  { id: 138, label: 'Quentin Tarantino', filter: { with_crew: 138 } as TmdbFilter },
  { id: 814, label: 'Denis Villeneuve', filter: { with_crew: 814 } as TmdbFilter },
  { id: 578, label: 'Steven Spielberg', filter: { with_crew: 578 } as TmdbFilter },
  { id: 240, label: 'Martin Scorsese', filter: { with_crew: 240 } as TmdbFilter },
];

const curatedActors = [
  { id: 6193, label: 'Leonardo DiCaprio', filter: { with_cast: 6193 } as TmdbFilter },
  { id: 31, label: 'Tom Hanks', filter: { with_cast: 31 } as TmdbFilter },
  { id: 1136406, label: 'Florence Pugh', filter: { with_cast: 1136406 } as TmdbFilter },
  { id: 1245, label: 'Scarlett Johansson', filter: { with_cast: 1245 } as TmdbFilter },
  { id: 64, label: 'Gary Oldman', filter: { with_cast: 64 } as TmdbFilter },
];

const curatedFranchises = [
  { id: 10, label: 'Star Wars' },
  { id: 86146, label: 'The Batman' },
  { id: 1241, label: 'Harry Potter' },
  { id: 119, label: 'The Lord of the Rings' },
  { id: 86066, label: 'The Avengers' },
];

// Full home page configuration
export const homeConfig: HomeConfig = {
  sections: [
    // 1. Trending
    {
      id: 'trending',
      type: 'trending',
      title: 'Trending',
      seeAllLink: '/browse/trending',
      cardVariant: 'wideRank',
      tabs: [
        { id: 'day', label: 'Day', filter: {} },
        { id: 'week', label: 'Week', filter: {} },
      ],
      defaultTab: 'week',
      fetcher: {
        endpoint: '/trending/all/{window}',
        params: {},
      },
      maxItems: 10,
      showRank: true,
      respectsGlobalFilter: true,
    },

    // 2. Latest
    {
      id: 'latest',
      type: 'latest',
      title: 'Latest',
      seeAllLink: '/browse/latest',
      cardVariant: 'poster',
      tabs: [
        { id: 'movie', label: 'Movie', filter: { mediaType: 'movie' } },
        { id: 'tv', label: 'TV Show', filter: { mediaType: 'tv' } },
        { id: 'anime', label: 'Anime', filter: { mediaType: 'tv', with_genres: 16, with_original_language: 'ja' } },
        { id: 'asian', label: 'Asian', filter: { mediaType: 'tv', with_original_language: 'ko|ja|zh|th|hi' } },
      ],
      defaultTab: 'movie',
      fetcher: {
        endpoint: '/discover/{mediaType}',
        params: {
          sort_by: 'primary_release_date.desc',
        },
      },
      maxItems: 20,
      respectsGlobalFilter: true,
    },

    // 3. Your Next Watch (Recommendations)
    {
      id: 'recommendations',
      type: 'recommendations',
      title: 'Your Next Watch',
      cardVariant: 'poster',
      fetcher: {
        endpoint: '/recommendations',
        params: {},
      },
      respectsGlobalFilter: true,
    },

    // 4. Top Rated
    {
      id: 'topRated',
      type: 'topRated',
      title: 'Top Rated',
      seeAllLink: '/browse/top-rated',
      cardVariant: 'poster',
      tabs: [
        { id: 'movie', label: 'Movie', filter: { mediaType: 'movie' } },
        { id: 'tv', label: 'TV Show', filter: { mediaType: 'tv' } },
        { id: 'anime', label: 'Anime', filter: { mediaType: 'tv', with_genres: 16, with_original_language: 'ja', 'vote_count.gte': 50 } },
        { id: 'asian', label: 'Asian', filter: { mediaType: 'tv', with_original_language: 'ko|ja|zh|th|hi', 'vote_count.gte': 50 } },
      ],
      defaultTab: 'movie',
      fetcher: {
        endpoint: '/{mediaType}/top_rated',
        params: {},
      },
      maxItems: 20,
      respectsGlobalFilter: true,
    },

    // 5. Best Of (Studio/Network)
    {
      id: 'bestOf',
      type: 'bestOf',
      title: 'Best Of',
      cardVariant: 'poster',
      dropdown: {
        label: 'Studio/Network',
        options: curatedStudios,
        defaultOption: 213, // Netflix
      },
      fetcher: {
        endpoint: '/discover/tv',
        params: {},
      },
      maxItems: 20,
      respectsGlobalFilter: false,
    },

    // 6. Featured Franchises
    {
      id: 'franchises',
      type: 'franchises',
      title: 'Featured Franchises',
      cardVariant: 'franchise',
      fetcher: {
        endpoint: '/collection/{id}',
        params: {},
      },
      respectsGlobalFilter: false,
    },

    // 7. Movie Genre
    {
      id: 'genre',
      type: 'genre',
      title: 'Movie Genre',
      cardVariant: 'poster',
      dropdown: {
        label: 'Genre',
        options: curatedGenres,
        defaultOption: 28, // Action
      },
      fetcher: {
        endpoint: '/discover/movie',
        params: {},
      },
      maxItems: 20,
      respectsGlobalFilter: true,
    },

    // 8. Directors
    {
      id: 'directors',
      type: 'curated',
      title: 'Directors',
      cardVariant: 'poster',
      dropdown: {
        label: 'Director',
        options: curatedDirectors,
        defaultOption: 525, // Christopher Nolan
      },
      fetcher: {
        endpoint: '/discover/movie',
        params: {},
      },
      maxItems: 20,
      respectsGlobalFilter: false,
    },

    // 9. Male Actor
    {
      id: 'maleActor',
      type: 'curated',
      title: 'Male Actor',
      cardVariant: 'poster',
      dropdown: {
        label: 'Actor',
        options: curatedActors,
        defaultOption: 6193, // Leonardo DiCaprio
      },
      fetcher: {
        endpoint: '/discover/movie',
        params: {},
      },
      maxItems: 20,
      respectsGlobalFilter: false,
    },

    // 10. Female Actor (sibling section)
    {
      id: 'femaleActor',
      type: 'curated',
      title: 'Female Actor',
      cardVariant: 'poster',
      dropdown: {
        label: 'Actor',
        options: [
          { id: 1136406, label: 'Florence Pugh', filter: { with_cast: 1136406 } },
          { id: 1245, label: 'Scarlett Johansson', filter: { with_cast: 1245 } },
          { id: 10930, label: 'Meryl Streep', filter: { with_cast: 10930 } },
          { id: 1892, label: 'Viola Davis', filter: { with_cast: 1892 } },
        ],
        defaultOption: 1136406,
      },
      fetcher: {
        endpoint: '/discover/movie',
        params: {},
      },
      maxItems: 20,
      respectsGlobalFilter: false,
    },

    // 11. Load More
    {
      id: 'loadMore',
      type: 'loadMore',
      title: 'Load More',
      cardVariant: 'poster',
      fetcher: {
        endpoint: '/load-more',
        params: {},
      },
      respectsGlobalFilter: true,
    },
  ],
};
