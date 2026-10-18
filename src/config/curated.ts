import type { TmdbFilter } from '../types/filter';

export interface CuratedOption {
  id: number;
  label: string;
  filter: TmdbFilter;
}

export interface FranchiseEntry {
  id: number;
  label: string;
}

export const curatedNetworks: CuratedOption[] = [
  { id: 213, label: 'Netflix', filter: { with_networks: 213 } },
  { id: 49, label: 'HBO', filter: { with_networks: 49 } },
  { id: 2739, label: 'Disney+', filter: { with_networks: 2739 } },
  { id: 2552, label: 'Apple TV+', filter: { with_networks: 2552 } },
  { id: 1024, label: 'Amazon', filter: { with_networks: 1024 } },
  { id: 129, label: 'Adult Swim', filter: { with_networks: 129 } },
];

export const curatedCompanies: CuratedOption[] = [
  { id: 420, label: 'Marvel Studios', filter: { with_companies: 420 } },
  { id: 20478, label: 'Studio Ghibli', filter: { with_companies: 20478 } },
  { id: 9996, label: 'A24', filter: { with_companies: 9996 } },
];

export const curatedBestOf: CuratedOption[] = [...curatedNetworks, ...curatedCompanies];

export const curatedGenres: CuratedOption[] = [
  { id: 28, label: 'Action', filter: { with_genres: 28 } },
  { id: 35, label: 'Comedy', filter: { with_genres: 35 } },
  { id: 18, label: 'Drama', filter: { with_genres: 18 } },
  { id: 27, label: 'Horror', filter: { with_genres: 27 } },
  { id: 878, label: 'Science Fiction', filter: { with_genres: 878 } },
  { id: 10749, label: 'Romance', filter: { with_genres: 10749 } },
  { id: 53, label: 'Thriller', filter: { with_genres: 53 } },
  { id: 16, label: 'Animation', filter: { with_genres: 16 } },
];

export const curatedDirectors: CuratedOption[] = [
  { id: 525, label: 'Christopher Nolan', filter: { personId: 525 } },
  { id: 138, label: 'Quentin Tarantino', filter: { personId: 138 } },
  { id: 814, label: 'Denis Villeneuve', filter: { personId: 814 } },
  { id: 578, label: 'Steven Spielberg', filter: { personId: 578 } },
  { id: 240, label: 'Martin Scorsese', filter: { personId: 240 } },
];

export const curatedMaleActors: CuratedOption[] = [
  { id: 6193, label: 'Leonardo DiCaprio', filter: { personId: 6193 } },
  { id: 31, label: 'Tom Hanks', filter: { personId: 31 } },
  { id: 64, label: 'Gary Oldman', filter: { personId: 64 } },
  { id: 2888, label: 'Will Smith', filter: { personId: 2888 } },
];

export const curatedFemaleActors: CuratedOption[] = [
  { id: 1136406, label: 'Florence Pugh', filter: { personId: 1136406 } },
  { id: 1245, label: 'Scarlett Johansson', filter: { personId: 1245 } },
  { id: 10930, label: 'Meryl Streep', filter: { personId: 10930 } },
  { id: 1892, label: 'Viola Davis', filter: { personId: 1892 } },
];

export const curatedFranchises: FranchiseEntry[] = [
  { id: 10, label: 'Star Wars' },
  { id: 1241, label: 'Harry Potter' },
  { id: 119, label: 'The Lord of the Rings' },
  { id: 86311, label: 'The Avengers' },
  { id: 9485, label: 'The Fast and the Furious' },
];
