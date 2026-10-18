import type { TmdbFilter } from '../types/filter';
import type { FeatureFlag } from './features';
import { mediaPresets } from './mediaPresets';
import {
  curatedBestOf,
  curatedDirectors,
  curatedFemaleActors,
  curatedFranchises,
  curatedGenres,
  curatedMaleActors,
} from './curated';

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
  batchSize?: number;
  respectsGlobalFilter?: boolean;
  enabled?: boolean;
  featureFlag?: FeatureFlag;
}

export interface HomeConfig {
  sections: SectionConfig[];
  settings: {
    loadMoreBatchSize: number;
  };
}
const topRatedTabs: TabConfig[] = [
  { id: 'movie', label: 'Movie', filter: { mediaType: 'movie' } },
  { id: 'tv', label: 'TV Show', filter: { mediaType: 'tv' } },
  { id: 'anime', label: 'Anime', filter: { ...mediaPresets.anime.filter, 'vote_count.gte': 500 } },
  { id: 'asian', label: 'Asian', filter: { ...mediaPresets.asian.filter, 'vote_count.gte': 500 } },
];

const toOptions = (list: { id: number; label: string; filter: TmdbFilter }[]): DropdownOption[] =>
  list.map((o) => ({ id: o.id, label: o.label, filter: o.filter }));

export const homeConfig: HomeConfig = {
  settings: { loadMoreBatchSize: 2 },
  sections: [
    {
      id: 'trending', type: 'trending', title: 'Trending', seeAllLink: '/browse/trending',
      cardVariant: 'wideRank',
      tabs: [
        { id: 'day', label: 'Day', filter: {} },
        { id: 'week', label: 'Week', filter: {} },
      ],
      defaultTab: 'week',
      fetcher: { endpoint: '/trending/movie/{window}', params: {} },
      maxItems: 10, showRank: true, respectsGlobalFilter: false, enabled: true,
    },
    {
      id: 'latest', type: 'latest', title: 'Latest', seeAllLink: '/browse/latest',
      cardVariant: 'poster',
      tabs: [
        { id: 'movie', label: 'Movie', filter: { mediaType: 'movie' } },
        { id: 'tv', label: 'TV Show', filter: { mediaType: 'tv' } },
        { id: 'anime', label: 'Anime', filter: { ...mediaPresets.anime.filter } },
        { id: 'asian', label: 'Asian', filter: { ...mediaPresets.asian.filter } },
      ],
      defaultTab: 'movie',
      fetcher: { endpoint: '/discover/{mediaType}', params: { sort_by: 'primary_release_date.desc' } },
      maxItems: 20, respectsGlobalFilter: true, enabled: true,
    },
    {
      id: 'recommendations', type: 'recommendations', title: 'Your Next Watch',
      cardVariant: 'poster',
      fetcher: { endpoint: '/recommendations', params: {} },
      respectsGlobalFilter: true, enabled: true,
    },
    {
      id: 'topRated', type: 'topRated', title: 'Top Rated', seeAllLink: '/browse/top-rated',
      cardVariant: 'poster', tabs: topRatedTabs, defaultTab: 'movie',
      fetcher: { endpoint: '/{mediaType}/top_rated', params: { 'vote_count.gte': 500, sort_by: 'vote_average.desc' } },
      maxItems: 20, respectsGlobalFilter: true, enabled: true,
    },
    {
      id: 'bestOf', type: 'bestOf', title: 'Best Of', cardVariant: 'poster',
      dropdown: { label: 'Network / Studio', options: toOptions(curatedBestOf), defaultOption: 213 },
      fetcher: { endpoint: '/discover/mixed', params: { sort_by: 'popularity.desc' } },
      maxItems: 20, respectsGlobalFilter: false, enabled: true,
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
      fetcher: { endpoint: '/discover/movie', params: { sort_by: 'popularity.desc' } },
      maxItems: 20, respectsGlobalFilter: true, enabled: true,
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
      maxItems: 20, respectsGlobalFilter: true, enabled: true,
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
      dropdown: { label: 'Actor', options: toOptions(curatedFemaleActors), defaultOption: 1136406 },
      fetcher: { endpoint: '/person/{id}/movie_credits', params: { personJob: 'Cast', sort_by: 'popularity.desc' } },
      maxItems: 20, respectsGlobalFilter: false, enabled: true,
    },
    {
      id: 'loadMore', type: 'loadMore', title: 'Load More', cardVariant: 'poster',
      fetcher: { endpoint: '/load-more', params: {} },
      batchSize: 2, respectsGlobalFilter: false, enabled: true,
    },
  ],
};

