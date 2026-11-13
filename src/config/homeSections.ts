import type { TmdbFilter } from '../types/filter';
import type { FeatureFlag } from './features';
import { mediaPresets } from './mediaPresets';
import {
  curatedAnimeGenres,
  curatedBestOf,
  curatedDirectors,
  curatedFemaleActors,
  curatedFranchises,
  curatedGenres,
  curatedMaleActors,
  curatedTvGenres,
} from './curated';

export type SectionType =
  | 'trending'
  | 'latest'
  | 'fresh'
  | 'recommendations'
  | 'topRated'
  | 'bestOf'
  | 'franchises'
  | 'genre'
  | 'curated';

export type CardVariant = 'poster' | 'wideRank' | 'franchise';

export interface TabConfig {
  id: string;
  label: string;
  filter: TmdbFilter;
}

export interface DropdownOption {
  id: string | number;
  label: string;
  filter: TmdbFilter;
}

export interface CollectionRef {
  id: number;
  label: string;
}

export interface SectionConfig {
  id: string;
  type: SectionType;
  title: string;
  seeAllLink?: string;
  cardVariant: CardVariant;
  tabs?: TabConfig[];
  defaultTab?: string;
  dropdown?: {
    label: string;
    options: DropdownOption[];
    defaultOption?: string | number;
  };
  collections?: CollectionRef[];
  fetcher: {
    endpoint: string;
    params?: TmdbFilter;
  };
  minItems?: number;
  maxItems?: number;
  showRank?: boolean;
  respectsGlobalFilter?: boolean;
  enabled?: boolean;
  featureFlag?: FeatureFlag;
}

export interface HomeConfig {
  sections: SectionConfig[];
}

// Anime = Animation genre + Japanese original language, enforced on top of the preset.
const strictAnime: TmdbFilter = { ...mediaPresets.anime.filter, with_genres: '16', with_original_language: 'ja' };

// Vote floors live in tmdbService (500 movie / 200 TV); only the niche tabs override them.
const topRatedTabs: TabConfig[] = [
  { id: 'movie', label: 'Movie', filter: { mediaType: 'movie' } },
  { id: 'tv', label: 'TV Show', filter: { mediaType: 'tv' } },
  { id: 'anime', label: 'Anime', filter: { ...strictAnime, 'vote_count.gte': 300 } },
  { id: 'asian', label: 'Asian', filter: { ...mediaPresets.asian.filter, 'vote_count.gte': 300 } },
];

const toOptions = (list: { id: number; label: string; filter: TmdbFilter }[]): DropdownOption[] =>
  list.map((o) => ({ id: o.id, label: o.label, filter: o.filter }));

export const homeConfig: HomeConfig = {
  sections: [
    {
      id: 'trending', type: 'trending', title: 'Trending', seeAllLink: '/browse/trending',
      cardVariant: 'wideRank',
      tabs: [
        { id: 'day', label: 'Day', filter: {} },
        { id: 'week', label: 'Week', filter: {} },
        { id: 'month', label: 'Month', filter: {} },
      ],
      defaultTab: 'day',
      fetcher: { endpoint: '/trending/all/{window}', params: {} },
      minItems: 5, maxItems: 10, showRank: true, respectsGlobalFilter: false, enabled: true,
    },
    {
      id: 'latest', type: 'latest', title: 'Latest', seeAllLink: '/browse/latest',
      cardVariant: 'poster',
      tabs: [
        { id: 'movie', label: 'Movie', filter: { mediaType: 'movie' } },
        { id: 'tv', label: 'TV Show', filter: { mediaType: 'tv' } },
        { id: 'anime', label: 'Anime', filter: { ...strictAnime } },
        { id: 'asian', label: 'Asian', filter: { ...mediaPresets.asian.filter, mediaType: 'asian' } },
      ],
      defaultTab: 'movie',
      fetcher: { endpoint: '/discover/{mediaType}', params: {} },
      minItems: 6, maxItems: 20, respectsGlobalFilter: true, enabled: true,
    },
    {
      id: 'freshThisYear', type: 'fresh', title: 'Fresh This Year',
      cardVariant: 'poster',
      fetcher: { endpoint: '/discover/mixed', params: {} },
      minItems: 6, maxItems: 20, respectsGlobalFilter: false, enabled: true,
    },
    {
      id: 'topRated', type: 'topRated', title: 'Top Rated', seeAllLink: '/browse/top-rated',
      cardVariant: 'poster', tabs: topRatedTabs, defaultTab: 'movie',
      fetcher: { endpoint: '/discover/{mediaType}', params: { sort_by: 'vote_average.desc' } },
      minItems: 6, maxItems: 20, respectsGlobalFilter: true, enabled: true,
    },
    {
      id: 'bestOf', type: 'bestOf', title: 'Best Of', cardVariant: 'poster',
      dropdown: { label: 'Network / Studio', options: toOptions(curatedBestOf), defaultOption: 213 },
      fetcher: { endpoint: '/discover/mixed', params: { sort_by: 'popularity.desc' } },
      minItems: 6, maxItems: 20, respectsGlobalFilter: false, enabled: true,
    },
    {
      id: 'franchises', type: 'franchises', title: 'Featured Franchises', cardVariant: 'franchise',
      collections: curatedFranchises,
      fetcher: { endpoint: '/collection/{id}', params: {} },
      respectsGlobalFilter: false, enabled: true, featureFlag: 'featuredFranchises',
    },
    {
      id: 'genre', type: 'genre', title: 'Movie Genre', cardVariant: 'poster',
      dropdown: { label: 'Genre', options: toOptions(curatedGenres), defaultOption: 28 },
      fetcher: { endpoint: '/discover/movie', params: { mediaType: 'movie', sort_by: 'popularity.desc' } },
      minItems: 6, maxItems: 20, respectsGlobalFilter: true, enabled: true,
    },
    {
      id: 'animeGenre', type: 'genre', title: 'Anime Genre', cardVariant: 'poster',
      dropdown: { label: 'Genre', options: toOptions(curatedAnimeGenres), defaultOption: 16 },
      fetcher: { endpoint: '/discover/tv', params: { mediaType: 'tv', sort_by: 'popularity.desc' } },
      minItems: 6, maxItems: 20, respectsGlobalFilter: false, enabled: true,
    },
    {
      id: 'series', type: 'genre', title: 'Series', cardVariant: 'poster',
      dropdown: { label: 'Genre', options: toOptions(curatedTvGenres), defaultOption: 10759 },
      fetcher: { endpoint: '/discover/tv', params: { mediaType: 'tv', sort_by: 'popularity.desc' } },
      minItems: 6, maxItems: 20, respectsGlobalFilter: false, enabled: true,
    },
    {
      id: 'classics', type: 'curated', title: 'Classics', seeAllLink: '/browse/classics',
      cardVariant: 'poster',
      tabs: [
        { id: 'movie', label: 'Movie', filter: { mediaType: 'movie', classics: true } },
        { id: 'tv', label: 'TV Show', filter: { mediaType: 'tv', classics: true } },
      ],
      defaultTab: 'movie',
      fetcher: { endpoint: '/discover/{mediaType}/classics', params: {} },
      minItems: 6, maxItems: 20, respectsGlobalFilter: true, enabled: true,
    },
    {
      id: 'directors', type: 'curated', title: 'Directors', cardVariant: 'poster',
      dropdown: { label: 'Director', options: toOptions(curatedDirectors), defaultOption: 525 },
      fetcher: { endpoint: '/person/{id}/movie_credits', params: { personJob: 'Director', sort_by: 'popularity.desc' } },
      maxItems: 20, respectsGlobalFilter: false, enabled: true,
    },
    {
      id: 'maleActor', type: 'curated', title: 'Male Actor', cardVariant: 'poster',
      dropdown: { label: 'Actor', options: toOptions(curatedMaleActors), defaultOption: 6193 },
      fetcher: { endpoint: '/person/{id}/movie_credits', params: { personJob: 'Cast', sort_by: 'popularity.desc' } },
      maxItems: 20, respectsGlobalFilter: false, enabled: true,
    },
    {
      id: 'femaleActor', type: 'curated', title: 'Female Actor', cardVariant: 'poster',
      dropdown: { label: 'Actor', options: toOptions(curatedFemaleActors), defaultOption: 1373737 },
      fetcher: { endpoint: '/person/{id}/movie_credits', params: { personJob: 'Cast', sort_by: 'popularity.desc' } },
      maxItems: 20, respectsGlobalFilter: false, enabled: true,
    },
  ],
};