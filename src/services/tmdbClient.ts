import type {
  Movie,
  TvSeries,
  Person,
  PaginatedResponse,
  CreditsResponse,
  Video,
  WatchProvidersResult,
  Genre,
} from '../types';
import type { TmdbFilter } from '../types/filter';
import { tmdb } from '../config/tmdb';
import { site } from '../config/site';
import { sharedLimiter } from './requestLimiter';
import { today as getToday, shiftDate, shiftYears, filterReleased, dedupeById, type ReleaseDatedItem } from '../lib/releaseFilters';

const PROXY_BASE_URL = (import.meta.env.VITE_TMDB_PROXY_URL || '/api/tmdb').replace(/\/$/, '');

function normalizeImages<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(item => normalizeImages(item)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => {
        if (key.endsWith('_path') && typeof item === 'string' && item.startsWith('/')) {
          const size = key === 'backdrop_path' ? tmdb.imageSizes.backdrop.md
            : key === 'profile_path' ? tmdb.imageSizes.profile.md
              : key === 'still_path' ? tmdb.imageSizes.still.md
                : tmdb.imageSizes.poster.lg;
          return [key, `${tmdb.imageBaseUrl}/${size}${item}`];
        }
        return [key, normalizeImages(item)];
      }),
    ) as T;
  }

  return value;
}

/** Makes a request through the server-side TMDB proxy; the API token never reaches the browser. */
export async function tmdbRequest<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const url = new URL(`${window.location.origin}${PROXY_BASE_URL}${endpoint}`);
  url.searchParams.set('language', 'en-US');

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value));
  });

  return sharedLimiter.run(async () => {
    const response = await fetch(url.toString());
    if (!response.ok) {
      const error = new Error(`TMDB API error: ${response.status}`) as Error & { status?: number; retryAfter?: string | null };
      error.status = response.status;
      error.retryAfter = response.headers.get('Retry-After');
      throw error;
    }

    return normalizeImages(await response.json()) as T;
  });
}

function toApiParams(filter: TmdbFilter = {}): Record<string, string | number | boolean | undefined> {
  const { mediaType: _mediaType, personId: _personId, personJob: _personJob, collectionIds: _collectionIds, ...rest } = filter;
  const out: Record<string, string | number | boolean | undefined> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      out[key] = value.join(',');
    } else {
      out[key] = value as string | number | boolean;
    }
  }
  return out;
}

type TrendingItem = (Movie | TvSeries) & { media_type: 'movie' | 'tv' };

/** Query-level upper bound so discover never returns unreleased titles. */
function withReleasedBounds(
  mediaType: 'movie' | 'tv',
  params: Record<string, string | number | boolean | undefined>,
  todayStr: string = getToday(),
): Record<string, string | number | boolean | undefined> {
  const out = { ...params };
  if (mediaType === 'tv') {
    if (out['first_air_date.lte'] === undefined) out['first_air_date.lte'] = todayStr;
    if (typeof out['first_air_date.lte'] === 'string' && (out['first_air_date.lte'] as string) > todayStr) {
      out['first_air_date.lte'] = todayStr;
    }
    delete out['release_date.lte'];
    delete out['release_date.gte'];
  } else {
    if (out['release_date.lte'] === undefined) out['release_date.lte'] = todayStr;
    if (typeof out['release_date.lte'] === 'string' && (out['release_date.lte'] as string) > todayStr) {
      out['release_date.lte'] = todayStr;
    }
    delete out['first_air_date.lte'];
    delete out['first_air_date.gte'];
  }
  return out;
}

/**
 * Paged discover with backfill: after result-level filtering a page may be
 * short, so fetch up to `extraPages` more pages and dedupe by id.
 */
async function discoverPaged<T extends ReleaseDatedItem & { id: number }>(
  endpoint: string,
  baseParams: Record<string, string | number | boolean | undefined>,
  options: { target?: number; extraPages?: number; todayStr?: string } = {},
): Promise<T[]> {
  const todayStr = options.todayStr ?? getToday();
  const extraPages = options.extraPages ?? site.settings.releaseFilter.extraPages;
  const target = options.target ?? 20;
  const collected: T[] = [];
  const seen = new Set<number>();
  const maxPages = 1 + extraPages;
  for (let page = 1; page <= maxPages; page++) {
    const response = await tmdbRequest<PaginatedResponse<T>>(endpoint, { ...baseParams, page });
    const filtered = filterReleased(response.results ?? [], { requirePoster: false, todayStr });
    for (const item of filtered) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      collected.push(item as T);
    }
    if (collected.length >= target) break;
    if (!response.results || response.results.length < 20 || page >= (response.total_pages ?? page)) break;
  }
  return dedupeById(collected);
}

export const tmdbService = {
  async getTrending(window: 'day' | 'week' = 'week'): Promise<TrendingItem[]> {
    const response = await tmdbRequest<PaginatedResponse<TrendingItem>>(`/trending/movie/${window}`);
    // Trending has no date params: filter at result level (mock data filtered identically).
    return filterReleased(response.results, { requirePoster: false });
  },

  getPopularMovies(page = 1): Promise<PaginatedResponse<Movie>> {
    return tmdbRequest(tmdb.endpoints.popularMovies, { page });
  },

  getPopularTv(page = 1): Promise<PaginatedResponse<TvSeries>> {
    return tmdbRequest(tmdb.endpoints.popularTv, { page });
  },

  async getTopRatedMovies(): Promise<Movie[]> {
    return filterReleased(
      (await tmdbRequest<PaginatedResponse<Movie>>(tmdb.endpoints.topRatedMovies)).results,
      { requirePoster: false },
    );
  },

  async getTopRatedTv(): Promise<TvSeries[]> {
    return filterReleased(
      (await tmdbRequest<PaginatedResponse<TvSeries>>(tmdb.endpoints.topRatedTv)).results,
      { requirePoster: false },
    );
  },

  async getUpcomingMovies(): Promise<Movie[]> {
    return (await tmdbRequest<PaginatedResponse<Movie>>(tmdb.endpoints.upcomingMovies)).results;
  },

  getMovieDetails(id: number): Promise<Movie> {
    return tmdbRequest(tmdb.endpoints.movieDetails(id));
  },

  getTvDetails(id: number): Promise<TvSeries> {
    return tmdbRequest(tmdb.endpoints.tvDetails(id));
  },

  getMovieCredits(id: number): Promise<CreditsResponse> {
    return tmdbRequest(tmdb.endpoints.movieCredits(id));
  },

  getTvCredits(id: number): Promise<CreditsResponse> {
    return tmdbRequest(tmdb.endpoints.tvCredits(id));
  },

  getMovieVideos(id: number): Promise<{ results: Video[] }> {
    return tmdbRequest(tmdb.endpoints.movieVideos(id));
  },

  getTvVideos(id: number): Promise<{ results: Video[] }> {
    return tmdbRequest(tmdb.endpoints.tvVideos(id));
  },

  async getMovieSimilar(id: number): Promise<Movie[]> {
    return filterReleased(
      (await tmdbRequest<PaginatedResponse<Movie>>(tmdb.endpoints.movieSimilar(id))).results,
      { requirePoster: false },
    );
  },

  async getTvSimilar(id: number): Promise<TvSeries[]> {
    return filterReleased(
      (await tmdbRequest<PaginatedResponse<TvSeries>>(tmdb.endpoints.tvSimilar(id))).results,
      { requirePoster: false },
    );
  },

  getMovieWatchProviders(id: number): Promise<{ results: Record<string, WatchProvidersResult> }> {
    return tmdbRequest(tmdb.endpoints.movieWatchProviders(id));
  },

  getTvWatchProviders(id: number): Promise<{ results: Record<string, WatchProvidersResult> }> {
    return tmdbRequest(tmdb.endpoints.tvWatchProviders(id));
  },

  getPersonDetails(id: number): Promise<Person> {
    return tmdbRequest(tmdb.endpoints.personDetails(id));
  },

  async getPersonCredits(id: number): Promise<{ cast: (Movie | TvSeries)[] }> {
    const response = await tmdbRequest<{ cast: (Movie | TvSeries)[] }>(tmdb.endpoints.personCredits(id));
    // Filmography / known-for: result-level filter, mocks filtered identically.
    return { cast: filterReleased(response.cast, { requirePoster: false }) };
  },

  async searchMulti(query: string): Promise<PaginatedResponse<Record<string, unknown>>> {
    const response = await tmdbRequest<PaginatedResponse<Record<string, unknown>>>('/search/multi', { query });
    const results = response.results.filter((r) => {
      if (r.media_type === 'person') return true;
      return filterReleased([r as unknown as never], { requirePoster: false }).length > 0;
    });
    return { ...response, results };
  },

  async getMovieGenres(): Promise<Genre[]> {
    return (await tmdbRequest<{ genres: Genre[] }>(tmdb.endpoints.genres.movie)).genres;
  },

  async getTvGenres(): Promise<Genre[]> {
    return (await tmdbRequest<{ genres: Genre[] }>(tmdb.endpoints.genres.tv)).genres;
  },

  async getLatest(mediaType: 'movie' | 'tv', filter: TmdbFilter): Promise<(Movie | TvSeries)[]> {
    const todayStr = getToday();
    const windowStart = shiftDate(todayStr, -site.settings.recency.latestDays);
    const base = withReleasedBounds(
      mediaType,
      { sort_by: 'primary_release_date.desc', ...toApiParams(filter) },
      todayStr,
    );
    if (mediaType === 'movie') {
      if (base['release_date.gte'] === undefined) base['release_date.gte'] = shiftYears(todayStr, -site.settings.recency.windowYears);
    } else {
      if (base['first_air_date.gte'] === undefined) base['first_air_date.gte'] = windowStart;
    }
    return discoverPaged<Movie | TvSeries>(tmdb.endpoints.discover[mediaType], base, { todayStr });
  },

  async getTopRated(mediaType: 'movie' | 'tv', filter: TmdbFilter): Promise<(Movie | TvSeries)[]> {
    const todayStr = getToday();
    const base = withReleasedBounds(
      mediaType,
      { sort_by: 'vote_average.desc', 'vote_count.gte': 50, ...toApiParams(filter) },
      todayStr,
    );
    return discoverPaged<Movie | TvSeries>(tmdb.endpoints.discover[mediaType], base, { todayStr });
  },

  async getBestOf(filter: TmdbFilter): Promise<TvSeries[]> {
    const todayStr = getToday();
    const base = withReleasedBounds(
      'tv',
      { sort_by: 'popularity.desc', ...toApiParams(filter) },
      todayStr,
    );
    return discoverPaged<TvSeries>(tmdb.endpoints.discover.tv, base, { todayStr });
  },

  async getDiscover(mediaType: 'movie' | 'tv', filter: TmdbFilter): Promise<(Movie | TvSeries)[]> {
    const todayStr = getToday();
    const base = withReleasedBounds(
      mediaType,
      { sort_by: 'popularity.desc', ...toApiParams(filter) },
      todayStr,
    );
    return discoverPaged<Movie | TvSeries>(tmdb.endpoints.discover[mediaType], base, { todayStr });
  },

  async getDiscoverMixed(filter: TmdbFilter): Promise<(Movie | TvSeries)[]> {
    const { with_networks, with_companies, ...rest } = filter;
    const base = { sort_by: 'popularity.desc', ...toApiParams(rest) };
    const hasCompany = with_companies !== undefined;
    // Networks are TV-only; companies are movie-oriented. Route accordingly.
    if (with_networks !== undefined && !hasCompany) {
      const response = await tmdbRequest<PaginatedResponse<TvSeries>>(
        tmdb.endpoints.discover.tv,
        { ...base, with_networks },
      );
      return response.results;
    }
    const response = await tmdbRequest<PaginatedResponse<Movie | TvSeries>>(
      tmdb.endpoints.discover.movie,
      { ...base, ...(with_networks !== undefined ? { with_networks } : {}), ...(hasCompany ? { with_companies } : {}) },
    );
    return response.results;
  },

  async getPersonMovieCredits(personId: number, job: 'Director' | 'Cast'): Promise<Movie[]> {
    const response = await tmdbRequest<{ cast: Movie[]; crew: (Movie & { job?: string })[] }>(
      tmdb.endpoints.personMovieCredits(personId),
    );
    const list = job === 'Director'
      ? response.crew.filter((m) => m.job === 'Director')
      : response.cast;
    const seen = new Set<number>();
    return filterReleased(list, { requirePoster: false })
      .filter((m) => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      })
      .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
  },

  async getCollection(id: number): Promise<{
    id: number;
    name: string;
    parts: (Movie & { release_date: string; vote_average: number; poster_path: string | null })[];
  }> {
    const collection = await tmdbRequest<{
      id: number;
      name: string;
      parts: (Movie & { release_date: string; vote_average: number; poster_path: string | null })[];
    }>(tmdb.endpoints.collection(id));
    // Collections / franchises: result-level filter, mocks filtered identically.
    return { ...collection, parts: filterReleased(collection.parts ?? [], { requirePoster: false }) };
  },

  async getClassics(mediaType: 'movie' | 'tv'): Promise<(Movie | TvSeries)[]> {
    const todayStr = getToday();
    const cutoff = shiftYears(todayStr, -site.settings.recency.windowYears);
    const base = withReleasedBounds(
      mediaType,
      {
        sort_by: site.settings.classics.sortBy,
        'vote_count.gte': site.settings.classics.minVotes,
      },
      todayStr,
    );
    if (mediaType === 'movie') {
      base['release_date.lte'] = cutoff < todayStr ? cutoff : todayStr;
    } else {
      base['first_air_date.lte'] = cutoff < todayStr ? cutoff : todayStr;
    }
    return discoverPaged<Movie | TvSeries>(tmdb.endpoints.discover[mediaType], base, { todayStr });
  },

  /**
   * Browse grid: discover with query-level released bounds + result-level
   * filter/dedupe. Upcoming stays exempt (it uses its own release_date.gte hooks).
   */
  async getBrowsePage(
    mediaType: 'movie' | 'tv',
    options: { page?: number; genre?: number; sortBy?: string; minRating?: number } = {},
  ): Promise<PaginatedResponse<Movie | TvSeries>> {
    const todayStr = getToday();
    const params = withReleasedBounds(
      mediaType,
      {
        sort_by: options.sortBy ?? 'popularity.desc',
        ...(options.genre ? { with_genres: options.genre } : {}),
        ...(options.minRating ? { 'vote_average.gte': options.minRating } : {}),
        page: options.page ?? 1,
      },
      todayStr,
    );
    const response = await tmdbRequest<PaginatedResponse<Movie | TvSeries>>(
      tmdb.endpoints.discover[mediaType],
      params,
    );
    const results = dedupeById(filterReleased(response.results ?? [], { requirePoster: false, todayStr }));
    return { ...response, results };
  },
};
