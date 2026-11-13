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
import { sharedLimiter, interactiveLimiter } from './requestLimiter';
import { today as getToday, shiftDate, shiftYears, filterReleased, dedupeById, getReleaseDate, type ReleaseDatedItem } from '../lib/releaseFilters';

const PROXY_BASE_URL = (import.meta.env.VITE_TMDB_PROXY_URL || '/api/tmdb').replace(/\/$/, '');

type Params = Record<string, string | number | boolean | undefined>;

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
export interface TmdbRequestOptions {
  /** Lets a caller cancel an in-flight request (e.g. a stale search keystroke). */
  signal?: AbortSignal;
  /** Use the interactive pool so typing is not blocked by background page loads. */
  interactive?: boolean;
}

export async function tmdbRequest<T>(endpoint: string, params?: Params, options?: TmdbRequestOptions): Promise<T> {
  const url = new URL(`${window.location.origin}${PROXY_BASE_URL}${endpoint}`);
  url.searchParams.set('language', 'en-US');

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value));
  });

  const execute = async () => {
    const response = await fetch(url.toString(), { signal: options?.signal });
    if (!response.ok) {
      const error = new Error(`TMDB API error: ${response.status}`) as Error & { status?: number; retryAfter?: string | null };
      error.status = response.status;
      error.retryAfter = response.headers.get('Retry-After');
      throw error;
    }

    return normalizeImages(await response.json()) as T;
  };

  return options?.interactive ? interactiveLimiter.run(execute) : sharedLimiter.run(execute);
}

function toApiParams(filter: TmdbFilter = {}): Params {
  const { mediaType: _mediaType, personId: _personId, personJob: _personJob, collectionIds: _collectionIds, classics: _classics, ...rest } = filter;
  const out: Params = {};
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
type Kind = 'movie' | 'tv';

/* ------------------------------------------------------------------ *
 * Curation: keeps rows presentable and on-category.
 * ------------------------------------------------------------------ */

export interface PagedItems<T> {
  results: T[];
  totalPages: number;
}

type Loose = {
  id: number;
  poster_path?: string | null;
  overview?: string;
  genre_ids?: number[];
  character?: string;
  media_type?: string;
  original_language?: string;
  origin_country?: string[];
};
const loose = (x: unknown) => x as Loose;

/** Genres that pollute general rows unless the row explicitly asks for them. */
const DEFAULT_EXCLUDED_GENRES: Record<Kind, number[]> = {
  movie: [99, 10770], // documentary, TV movie
  tv: [10767, 10763, 10764, 10766, 99], // talk, news, reality, soap, documentary
};
const TALK_NEWS_GENRES = [10767, 10763, 10764];

const ANIME_KEYWORD = '210024';
const ASIAN_LANGS = ['ja', 'ko', 'zh', 'cn', 'th', 'hi', 'ta', 'te', 'id', 'vi', 'ms', 'tl'];

function parseIds(spec: unknown): { ids: number[]; mode: 'and' | 'or' } {
  const raw = spec === undefined ? '' : String(spec);
  const mode = raw.includes('|') ? 'or' : 'and';
  const ids = raw.split(/[,|]/).map(Number).filter((n) => Number.isFinite(n) && n > 0);
  return { ids, mode };
}

/** Japanese animation = anime. */
function isAnimeItem(item: unknown): boolean {
  const i = loose(item);
  return (i.genre_ids ?? []).includes(16) && i.original_language === 'ja';
}

/** A row is an anime row only if it explicitly asks for Japanese animation. */
function isAnimeRow(params: Params): boolean {
  const langs = String(params.with_original_language ?? '').split(/[,|]/);
  const kw = String(params.with_keywords ?? '').split(/[,|]/);
  return (langs.includes('ja') && parseIds(params.with_genres).ids.includes(16)) || kw.includes(ANIME_KEYWORD);
}

/** Movie and TV use different genre IDs; translate so a "Action" filter works on both. */
const MOVIE_TO_TV: Record<number, number[]> = { 28: [10759], 12: [10759], 14: [10765], 878: [10765], 10752: [10768] };
const TV_TO_MOVIE: Record<number, number[]> = { 10759: [28, 12], 10765: [14, 878], 10768: [10752] };

function mapGenres(spec: unknown, mediaType: Kind): string {
  const { ids, mode } = parseIds(spec);
  const map = mediaType === 'tv' ? MOVIE_TO_TV : TV_TO_MOVIE;
  const expanded = ids.some((id) => (map[id]?.length ?? 0) > 1);
  const out = Array.from(new Set(ids.flatMap((id) => map[id] ?? [id])));
  return out.join(expanded || mode === 'or' ? '|' : ',');
}

/** Presentable = has a poster and a synopsis. */
function isPresentable(item: unknown): boolean {
  const i = loose(item);
  return Boolean(i.poster_path) && Boolean(i.overview && i.overview.trim().length > 10);
}

/** True when the item belongs to the requested genres/language/country and none of the excluded ones. */
function matchesGenreParams(item: unknown, params: Params, mediaType?: Kind): boolean {
  const genres = loose(item).genre_ids;
  if (!Array.isArray(genres)) return true;

  // Anime only appears in anime rows. Animation movie rows may keep anime films.
  if (!isAnimeRow(params) && isAnimeItem(item)) {
    const animationAsked = parseIds(params.with_genres).ids.includes(16);
    if (mediaType !== 'movie' || !animationAsked) return false;
  }

  const want = parseIds(params.with_genres);
  if (want.ids.length) {
    const ok = want.mode === 'or'
      ? want.ids.some((g) => genres.includes(g))
      : want.ids.every((g) => genres.includes(g));
    if (!ok) return false;
  }
  const avoid = parseIds(params.without_genres).ids;
  if (avoid.some((g) => genres.includes(g))) return false;

  // Language / country guards keep Anime and Asian rows from leaking other content.
  const it = loose(item);
  const langs = String(params.with_original_language ?? '').split(/[,|]/).filter(Boolean);
  if (langs.length && it.original_language && !langs.includes(it.original_language)) return false;
  const countries = String(params.with_origin_country ?? '').split(/[,|]/).filter(Boolean);
  if (countries.length && Array.isArray(it.origin_country) && it.origin_country.length
    && !it.origin_country.some((c) => countries.includes(c))) return false;
  return true;
}

function curate<T>(items: T[], params: Params, mediaType?: Kind): T[] {
  return items.filter((item) => isPresentable(item) && matchesGenreParams(item, params, mediaType));
}

/** Query-level bounds + quality defaults so discover returns released, on-category titles. */
function withReleasedBounds(
  mediaType: Kind,
  params: Params,
  todayStr: string = getToday(),
): Params {
  const out = { ...params };
  if (mediaType === 'tv') {
    if (out['first_air_date.lte'] === undefined) out['first_air_date.lte'] = todayStr;
    if (typeof out['first_air_date.lte'] === 'string' && (out['first_air_date.lte'] as string) > todayStr) {
      out['first_air_date.lte'] = todayStr;
    }
    delete out['release_date.lte'];
    delete out['release_date.gte'];
    delete out['primary_release_date.lte'];
    delete out['primary_release_date.gte'];
  } else {
    // TMDB /discover/movie expects primary_release_date bounds.
    if (out['primary_release_date.lte'] === undefined) out['primary_release_date.lte'] = todayStr;
    if (
      typeof out['primary_release_date.lte'] === 'string' &&
      (out['primary_release_date.lte'] as string) > todayStr
    ) {
      out['primary_release_date.lte'] = todayStr;
    }
    delete out['release_date.lte'];
    delete out['release_date.gte'];
    delete out['first_air_date.lte'];
    delete out['first_air_date.gte'];
    delete out['air_date.lte'];
    delete out['air_date.gte'];
    if (out['with_runtime.gte'] === undefined) out['with_runtime.gte'] = 60; // no shorts
  }

  out.include_adult = false;
  // Drop obscure, barely-voted titles.
  if (out['vote_count.gte'] === undefined) out['vote_count.gte'] = mediaType === 'movie' ? 15 : 8;

  if (out.with_genres !== undefined) {
    const mapped = mapGenres(out.with_genres, mediaType);
    if (mapped) out.with_genres = mapped; else delete out.with_genres;
  }

  // Keep talk shows, news, docs, etc. out unless the row asks for them.
  const requested = new Set(parseIds(out.with_genres).ids);
  const defaults = DEFAULT_EXCLUDED_GENRES[mediaType].filter((g) => !requested.has(g));
  const existing = parseIds(out.without_genres).ids;
  const merged = Array.from(new Set([...existing, ...defaults]));
  if (merged.length) out.without_genres = merged.join(',');

  return out;
}

/**
 * Paged discover with backfill: after curation a page may be short, so fetch
 * up to `extraPages` more pages and dedupe by id. When an explicit `page` is
 * given it is used as the starting TMDB page (full-list / paginated views).
 */
async function discoverPagedMeta<T extends ReleaseDatedItem & { id: number }>(
  endpoint: string,
  baseParams: Params,
  options: { target?: number; extraPages?: number; todayStr?: string; page?: number } = {},
): Promise<PagedItems<T>> {
  const todayStr = options.todayStr ?? getToday();
  const extraPages = options.extraPages ?? site.settings.releaseFilter.extraPages;
  const target = options.target ?? 20;
  const startPage = Math.max(1, options.page ?? 1);
  const mediaType: Kind = endpoint.includes('/tv') ? 'tv' : 'movie';
  const collected: T[] = [];
  const seen = new Set<number>();
  const maxPages = startPage + extraPages;
  let totalPages = Math.min(startPage, 500);
  for (let page = startPage; page <= maxPages; page++) {
    const response = await tmdbRequest<PaginatedResponse<T>>(endpoint, { ...baseParams, page });
    totalPages = Math.min(response.total_pages ?? page, 500);
    const filtered = curate(
      filterReleased(response.results ?? [], { requirePoster: true, todayStr }),
      baseParams,
      mediaType,
    );
    for (const item of filtered) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      collected.push(item as T);
    }
    if (collected.length >= target) break;
    if (!response.results || response.results.length < 20 || page >= totalPages) break;
  }
  return { results: dedupeById(collected), totalPages };
}

async function discoverPaged<T extends ReleaseDatedItem & { id: number }>(
  endpoint: string,
  baseParams: Params,
  options: { target?: number; extraPages?: number; todayStr?: string; page?: number } = {},
): Promise<T[]> {
  return (await discoverPagedMeta<T>(endpoint, baseParams, options)).results;
}

/** Result-level filter for non-discover endpoints. */
function cleanList<T extends ReleaseDatedItem>(items: T[] | undefined, mediaType?: Kind): T[] {
  return curate(filterReleased(items ?? [], { requirePoster: true }), {}, mediaType);
}

type Rated = { vote_average?: number; vote_count?: number; popularity?: number; order?: number };
const rated = (x: unknown) => x as Rated;

/** IMDb-style weighted rating: pulls low-vote titles toward the mean so niche 9.0s don't win. */
function weightedRating(item: unknown, minVotes = 500, mean = 6.8): number {
  const { vote_average: r = 0, vote_count: v = 0 } = rated(item);
  return (v / (v + minVotes)) * r + (minVotes / (v + minVotes)) * mean;
}

function byQuality<T>(items: T[], minVotes?: number): T[] {
  return [...items].sort((a, b) => weightedRating(b, minVotes) - weightedRating(a, minVotes));
}

type MixedMedia = (Movie | TvSeries) & { media_type: Kind };

/** Adds the media type so cards link to the right detail page. */
function tagMedia<T extends Movie | TvSeries>(items: T[], mediaType: Kind): (T & { media_type: Kind })[] {
  return items.map((item) => ({ ...item, media_type: mediaType }));
}

/** Tags movies/TV with their media type, dedupes, then applies the given ordering. */
function mergeMixed(
  movies: (Movie | TvSeries)[],
  tvShows: (Movie | TvSeries)[],
  compare: (a: MixedMedia, b: MixedMedia) => number,
): MixedMedia[] {
  const tagged: MixedMedia[] = [
    ...movies.map((item) => ({ ...item, media_type: 'movie' as const })),
    ...tvShows.map((item) => ({ ...item, media_type: 'tv' as const })),
  ];
  tagged.sort(compare);
  const seen = new Set<string>();
  return tagged.filter((item) => {
    const key = `${item.media_type}-${item.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const tmdbService = {
  /** Trending across movies AND TV (mixed home row). */
  async getTrending(window: 'day' | 'week' = 'week'): Promise<TrendingItem[]> {
    const pages = await Promise.all(
      [1, 2].map((page) => tmdbRequest<PaginatedResponse<TrendingItem>>(`/trending/all/${window}`, { page })),
    );
    const noise = [...TALK_NEWS_GENRES, 99, 10766]; // talk, news, reality, documentary, soap
    const seen = new Set<string>();
    // Keep TMDB's own trending order; only remove noise and unreleased/unpresentable items.
    return pages
      .flatMap((p) => p.results ?? [])
      .filter((r) => {
        if (r.media_type !== 'movie' && r.media_type !== 'tv') return false;
        const key = `${r.media_type}-${r.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        const i = r as unknown as Loose & { vote_count?: number };
        if ((i.vote_count ?? 0) < 20) return false;
        if (noise.some((g) => (i.genre_ids ?? []).includes(g))) return false;
        return isPresentable(r) && filterReleased([r as unknown as never], { requirePoster: true }).length > 0;
      });
  },

  /** Trending over the current month: titles released this month, most popular first. */
  async getTrendingThisMonth(): Promise<MixedMedia[]> {
    const todayStr = getToday();
    const monthStart = `${todayStr.slice(0, 7)}-01`;
    const [movies, tvShows] = await Promise.all([
      discoverPaged<Movie>(
        tmdb.endpoints.discover.movie,
        withReleasedBounds('movie', {
          sort_by: 'popularity.desc',
          'primary_release_date.gte': monthStart,
        }, todayStr),
        { todayStr },
      ),
      discoverPaged<TvSeries>(
        tmdb.endpoints.discover.tv,
        withReleasedBounds('tv', {
          sort_by: 'popularity.desc',
          'first_air_date.gte': monthStart,
        }, todayStr),
        { todayStr },
      ),
    ]);
    return mergeMixed(movies, tvShows, (a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
  },

  /** Trending for one category: movie, tv (no anime), anime (Japanese animation only), asian (no anime). */
  async getTrendingByCategory(
    category: 'movie' | 'tv' | 'anime' | 'asian',
    window: 'day' | 'week' = 'week',
  ): Promise<TrendingItem[]> {
    const todayStr = getToday();
    const endpoint = category === 'movie' ? `/trending/movie/${window}`
      : category === 'tv' ? `/trending/tv/${window}`
        : `/trending/all/${window}`;
    const noise = [...TALK_NEWS_GENRES, 99, 10766];

    const pages = await Promise.all(
      [1, 2, 3].map((page) => tmdbRequest<PaginatedResponse<TrendingItem>>(endpoint, { page }).catch(() => null)),
    );

    const fits = (r: TrendingItem) => {
      const anime = isAnimeItem(r);
      if (category === 'anime') return anime;
      if (anime) return false;
      if (category === 'asian') return ASIAN_LANGS.includes(loose(r).original_language ?? '');
      return true;
    };

    const seen = new Set<string>();
    const out: TrendingItem[] = [];
    const push = (r: TrendingItem) => {
      const type = r.media_type ?? (category === 'movie' ? 'movie' : 'tv');
      if (type !== 'movie' && type !== 'tv') return;
      const key = `${type}-${r.id}`;
      if (seen.has(key)) return;
      const i = r as unknown as Loose & { vote_count?: number };
      if ((i.vote_count ?? 0) < 20) return;
      if (noise.some((g) => (i.genre_ids ?? []).includes(g))) return;
      if (!isPresentable(r) || !filterReleased([r as unknown as never], { requirePoster: true }).length) return;
      if (!fits(r)) return;
      seen.add(key);
      out.push({ ...r, media_type: type });
    };
    pages.flatMap((p) => p?.results ?? []).forEach(push);

    // Anime and Asian are thin in global trending; backfill with most popular recent titles.
    if ((category === 'anime' || category === 'asian') && out.length < 12) {
      const extra: Params = category === 'anime'
        ? { with_genres: 16, with_original_language: 'ja', sort_by: 'popularity.desc' }
        : { with_origin_country: 'KR|CN|TH|IN|TW|HK|JP', sort_by: 'popularity.desc' };
      const [m, t] = await Promise.all([
        discoverPaged<Movie>(tmdb.endpoints.discover.movie, withReleasedBounds('movie', extra, todayStr), { todayStr }),
        discoverPaged<TvSeries>(tmdb.endpoints.discover.tv, withReleasedBounds('tv', extra, todayStr), { todayStr }),
      ]);
      mergeMixed(m, t, (a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
        .forEach((r) => push(r as TrendingItem));
    }
    return out.slice(0, 20);
  },

  async getPopularMovies(page = 1): Promise<PaginatedResponse<Movie>> {
    const response = await tmdbRequest<PaginatedResponse<Movie>>(tmdb.endpoints.popularMovies, { page });
    return { ...response, results: cleanList(response.results, 'movie') };
  },

  async getPopularTv(page = 1): Promise<PaginatedResponse<TvSeries>> {
    const response = await tmdbRequest<PaginatedResponse<TvSeries>>(tmdb.endpoints.popularTv, { page });
    // Drop talk shows / news / reality that rank high on popularity.
    const results = cleanList(response.results, 'tv').filter((t) => {
      const g = loose(t).genre_ids ?? [];
      return !TALK_NEWS_GENRES.some((id) => g.includes(id));
    });
    return { ...response, results };
  },

  /** Recent, well-voted top rated movies (not an all-time classics list; see getClassics). */
  async getTopRatedMovies(): Promise<Movie[]> {
    const todayStr = getToday();
    const floor = shiftYears(todayStr, -Math.max(site.settings.recency.windowYears, 10));
    const params = withReleasedBounds('movie', {
      sort_by: 'vote_average.desc',
      'vote_count.gte': 800,
      'primary_release_date.gte': floor,
    }, todayStr);
    return byQuality(await discoverPaged<Movie>(tmdb.endpoints.discover.movie, params, { todayStr, target: 40, extraPages: 3 }));
  },

  async getTopRatedTv(): Promise<TvSeries[]> {
    const todayStr = getToday();
    const floor = shiftYears(todayStr, -Math.max(site.settings.recency.windowYears, 10));
    const params = withReleasedBounds('tv', {
      sort_by: 'vote_average.desc',
      'vote_count.gte': 300,
      'first_air_date.gte': floor,
    }, todayStr);
    return byQuality(await discoverPaged<TvSeries>(tmdb.endpoints.discover.tv, params, { todayStr, target: 40, extraPages: 3 }), 300);
  },

  /** Truly upcoming only: strictly after today, with poster and synopsis. */
  async getUpcomingMovies(): Promise<Movie[]> {
    const todayStr = getToday();
    const response = await tmdbRequest<PaginatedResponse<Movie>>(tmdb.endpoints.upcomingMovies);
    return curate(response.results ?? [], {}, 'movie')
      .filter((m) => getReleaseDate(m) > todayStr)
      .sort((a, b) => getReleaseDate(a).localeCompare(getReleaseDate(b)));
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

  /** Uses /recommendations (far more relevant than /similar), falls back to /similar. */
  async getMovieSimilar(id: number): Promise<Movie[]> {
    const similar = tmdb.endpoints.movieSimilar(id);
    const rec = await tmdbRequest<PaginatedResponse<Movie>>(similar.replace(/\/similar$/, '/recommendations')).catch(() => null);
    const recs = cleanList(rec?.results, 'movie');
    if (recs.length >= 6) return recs;
    return cleanList((await tmdbRequest<PaginatedResponse<Movie>>(similar)).results, 'movie');
  },

  async getTvSimilar(id: number): Promise<TvSeries[]> {
    const similar = tmdb.endpoints.tvSimilar(id);
    const rec = await tmdbRequest<PaginatedResponse<TvSeries>>(similar.replace(/\/similar$/, '/recommendations')).catch(() => null);
    const recs = cleanList(rec?.results, 'tv');
    if (recs.length >= 6) return recs;
    return cleanList((await tmdbRequest<PaginatedResponse<TvSeries>>(similar)).results, 'tv');
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

  /** Filmography: no talk-show/news "Self" appearances, most popular first. */
  async getPersonCredits(id: number): Promise<{ cast: (Movie | TvSeries)[] }> {
    const response = await tmdbRequest<{ cast: (Movie | TvSeries)[] }>(tmdb.endpoints.personCredits(id));
    // Mixed movie/TV list: person pages keep anime credits, so no media type is passed.
    const cast = cleanList(response.cast).filter((item) => {
      const i = loose(item);
      const g = i.genre_ids ?? [];
      if (TALK_NEWS_GENRES.some((x) => g.includes(x))) return false;
      return !/\b(self|himself|herself|archive footage)\b/i.test(i.character ?? '');
    });
    cast.sort((a, b) => ((b as { popularity?: number }).popularity ?? 0) - ((a as { popularity?: number }).popularity ?? 0));
    return { cast: dedupeById(cast) };
  },

  async searchMulti(
    query: string,
    options?: Pick<TmdbRequestOptions, 'signal'>,
  ): Promise<PaginatedResponse<Record<string, unknown>>> {
    const response = await tmdbRequest<PaginatedResponse<Record<string, unknown>>>(
      '/search/multi',
      { query, include_adult: false },
      { ...options, interactive: true },
    );
    // Search should surface anything the user is likely typing, including
    // upcoming titles, so keep the relevance order and only drop unusable rows.
    const results = response.results.filter((r) => {
      if (r.media_type === 'person') return Boolean(r.profile_path);
      if (r.media_type !== 'movie' && r.media_type !== 'tv') return false;
      return Boolean(r.poster_path || r.backdrop_path);
    });
    return { ...response, results };
  },

  async getMovieGenres(): Promise<Genre[]> {
    return (await tmdbRequest<{ genres: Genre[] }>(tmdb.endpoints.genres.movie)).genres;
  },

  async getTvGenres(): Promise<Genre[]> {
    return (await tmdbRequest<{ genres: Genre[] }>(tmdb.endpoints.genres.tv)).genres;
  },

  /**
   * New and currently relevant: movies released in the recent window, series
   * that premiered in the last 2 years AND have aired recently. Ranked by popularity.
   */
  async getLatest(mediaType: Kind, filter: TmdbFilter, page?: number): Promise<PagedItems<Movie | TvSeries & { media_type: Kind }>> {
    const todayStr = getToday();
    const days = site.settings.recency.latestDays;
    const { sort_by: _ignored, ...rest } = toApiParams(filter);
    const base = withReleasedBounds(mediaType, { sort_by: 'popularity.desc', ...rest }, todayStr);
    if (mediaType === 'movie') {
      if (base['primary_release_date.gte'] === undefined) {
        base['primary_release_date.gte'] = shiftDate(todayStr, -Math.max(days, 120));
      }
    } else {
      if (base['air_date.gte'] === undefined) base['air_date.gte'] = shiftDate(todayStr, -days);
      base['air_date.lte'] = todayStr;
      if (base['first_air_date.gte'] === undefined) base['first_air_date.gte'] = shiftYears(todayStr, -2);
    }
    const pageOptions = page !== undefined
      ? { todayStr, page, extraPages: 0, target: 24 }
      : { todayStr };
    const response = await discoverPagedMeta<Movie | TvSeries>(tmdb.endpoints.discover[mediaType], base, pageOptions);
    return { results: tagMedia(response.results, mediaType), totalPages: response.totalPages };
  },

  /** Latest across both movies and TV (used for the Asian category). */
  async getLatestMixed(filter: TmdbFilter, page?: number): Promise<PagedItems<MixedMedia>> {
    const [movies, tvShows] = await Promise.all([
      this.getLatest('movie', { ...filter, mediaType: 'movie' }, page),
      this.getLatest('tv', { ...filter, mediaType: 'tv' }, page),
    ]);
    // Interleave by popularity so one media type does not bury the other.
    const pop = (x: MixedMedia) => x.popularity ?? 0;
    return {
      results: mergeMixed(movies.results, tvShows.results, (a, b) => pop(b) - pop(a)),
      totalPages: Math.min(movies.totalPages, tvShows.totalPages),
    };
  },

  /** Movies and series released during the current calendar year, newest first. */
  async getFreshThisYear(page?: number): Promise<PagedItems<MixedMedia>> {
    const todayStr = getToday();
    const yearStart = `${todayStr.slice(0, 4)}-01-01`;
    const pageOptions = page !== undefined
      ? { todayStr, page, extraPages: 0, target: 24 }
      : { todayStr };
    const [movies, tvShows] = await Promise.all([
      discoverPagedMeta<Movie>(
        tmdb.endpoints.discover.movie,
        withReleasedBounds('movie', {
          sort_by: 'primary_release_date.desc',
          'primary_release_date.gte': yearStart,
        }, todayStr),
        pageOptions,
      ),
      discoverPagedMeta<TvSeries>(
        tmdb.endpoints.discover.tv,
        withReleasedBounds('tv', {
          sort_by: 'first_air_date.desc',
          'first_air_date.gte': yearStart,
        }, todayStr),
        pageOptions,
      ),
    ]);
    return {
      results: mergeMixed(movies.results, tvShows.results, (a, b) => getReleaseDate(b).localeCompare(getReleaseDate(a))),
      totalPages: Math.min(movies.totalPages, tvShows.totalPages),
    };
  },

  async getTopRated(mediaType: Kind, filter: TmdbFilter, page?: number): Promise<PagedItems<Movie | TvSeries & { media_type: Kind }>> {
    const todayStr = getToday();
    const floor = shiftYears(todayStr, -Math.max(site.settings.recency.windowYears, 10));
    const dateKey = mediaType === 'movie' ? 'primary_release_date.gte' : 'first_air_date.gte';
    const base = withReleasedBounds(
      mediaType,
      {
        sort_by: 'vote_average.desc',
        'vote_count.gte': mediaType === 'movie' ? 500 : 200,
        [dateKey]: floor,
        ...toApiParams(filter),
      },
      todayStr,
    );
    const pageOptions = page !== undefined
      ? { todayStr, page, extraPages: 0, target: 24 }
      : { todayStr, target: 40, extraPages: 3 };
    const pool = await discoverPagedMeta<Movie | TvSeries>(tmdb.endpoints.discover[mediaType], base, pageOptions);
    return {
      results: tagMedia(byQuality(pool.results, mediaType === 'movie' ? 500 : 300), mediaType),
      totalPages: pool.totalPages,
    };
  },

  async getBestOf(filter: TmdbFilter): Promise<TvSeries[]> {
    const todayStr = getToday();
    const base = withReleasedBounds(
      'tv',
      {
        sort_by: 'popularity.desc',
        'vote_average.gte': 6.5,
        'vote_count.gte': 200,
        ...toApiParams(filter),
      },
      todayStr,
    );
    return tagMedia(await discoverPaged<TvSeries>(tmdb.endpoints.discover.tv, base, { todayStr }), 'tv');
  },

  async getDiscover(mediaType: Kind, filter: TmdbFilter, page?: number): Promise<PagedItems<Movie | TvSeries & { media_type: Kind }>> {
    const todayStr = getToday();
    const base = withReleasedBounds(
      mediaType,
      {
        sort_by: 'popularity.desc',
        'vote_average.gte': 6,
        'vote_count.gte': mediaType === 'movie' ? 200 : 100,
        ...toApiParams(filter),
      },
      todayStr,
    );
    const pageOptions = page !== undefined
      ? { todayStr, page, extraPages: 0, target: 24 }
      : { todayStr };
    const response = await discoverPagedMeta<Movie | TvSeries>(tmdb.endpoints.discover[mediaType], base, pageOptions);
    return { results: tagMedia(response.results, mediaType), totalPages: response.totalPages };
  },

  async getDiscoverMixed(filter: TmdbFilter, page?: number): Promise<PagedItems<MixedMedia>> {
    const { with_networks, with_companies, ...rest } = filter;
    const todayStr = getToday();
    const hasCompany = with_companies !== undefined;
    const pageOptions = page !== undefined
      ? { todayStr, page, extraPages: 0, target: 24 }
      : { todayStr };
    // Networks are TV-only; companies are movie-oriented. Route accordingly.
    if (with_networks !== undefined && !hasCompany) {
      const tvBase = withReleasedBounds('tv', { sort_by: 'popularity.desc', 'vote_average.gte': 6.5, 'vote_count.gte': 150, ...toApiParams(rest) }, todayStr);
      const response = await discoverPagedMeta<TvSeries>(tmdb.endpoints.discover.tv, { ...tvBase, with_networks }, pageOptions);
      return { results: tagMedia(response.results, 'tv'), totalPages: response.totalPages };
    }
    const base = withReleasedBounds('movie', { sort_by: 'popularity.desc', 'vote_average.gte': 6.5, 'vote_count.gte': 300, ...toApiParams(rest) }, todayStr);
    const response = await discoverPagedMeta<Movie | TvSeries>(
      tmdb.endpoints.discover.movie,
      { ...base, ...(with_networks !== undefined ? { with_networks } : {}), ...(hasCompany ? { with_companies } : {}) },
      pageOptions,
    );
    return { results: tagMedia(response.results, 'movie'), totalPages: response.totalPages };
  },

  async getPersonMovieCredits(personId: number, job: 'Director' | 'Cast'): Promise<Movie[]> {
    const response = await tmdbRequest<{ cast: Movie[]; crew: (Movie & { job?: string })[] }>(
      tmdb.endpoints.personMovieCredits(personId),
    );
    const list = job === 'Director'
      ? response.crew.filter((m) => m.job === 'Director')
      : response.cast.filter((m) => !/\b(self|himself|herself|archive footage)\b/i.test(loose(m).character ?? ''));
    const seen = new Set<number>();
    const pop = (m: Movie) => (m as { popularity?: number }).popularity ?? 0;
    // Person pages keep anime films: pass animation as asked so the anime guard is skipped.
    const curated = cleanList(list, 'movie')
      .filter((m) => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        const g = loose(m).genre_ids ?? [];
        if (DEFAULT_EXCLUDED_GENRES.movie.some((x) => g.includes(x))) return false;
        if (job === 'Cast' && (rated(m).order ?? 99) > 10) return false; // no cameos / bit parts
        return (rated(m).vote_count ?? 0) >= 150;
      })
      .sort((a, b) => pop(b) - pop(a));
    return tagMedia(curated, 'movie');
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
    // Franchise order: chronological.
    const parts = cleanList(collection.parts).sort((a, b) => a.release_date.localeCompare(b.release_date));
    return { ...collection, parts };
  },

  /** Acclaimed older titles: outside the recency window, heavily voted and highly rated. */
  async getClassics(mediaType: Kind, filter: TmdbFilter = {}, page?: number): Promise<PagedItems<Movie | TvSeries & { media_type: Kind }>> {
    const todayStr = getToday();
    const cutoff = shiftYears(todayStr, -site.settings.recency.windowYears);
    const base = withReleasedBounds(
      mediaType,
      {
        sort_by: site.settings.classics.sortBy,
        'vote_count.gte': site.settings.classics.minVotes,
        'vote_average.gte': 7.5,
        ...toApiParams(filter),
      },
      todayStr,
    );
    if (mediaType === 'movie') {
      base['primary_release_date.lte'] = cutoff < todayStr ? cutoff : todayStr;
    } else {
      base['first_air_date.lte'] = cutoff < todayStr ? cutoff : todayStr;
    }
    const pageOptions = page !== undefined
      ? { todayStr, page, extraPages: 0, target: 24 }
      : { todayStr };
    const response = await discoverPagedMeta<Movie | TvSeries>(tmdb.endpoints.discover[mediaType], base, pageOptions);
    return { results: tagMedia(response.results, mediaType), totalPages: response.totalPages };
  },

  /**
   * Browse grid: discover with released bounds, quality floor and genre check.
   * Upcoming stays exempt (it uses its own release_date.gte hooks).
   */
  async getBrowsePage(
    mediaType: Kind,
    options: { page?: number; genre?: number; sortBy?: string; minRating?: number } = {},
  ): Promise<PaginatedResponse<Movie | TvSeries>> {
    const todayStr = getToday();
    const sortBy = options.sortBy ?? 'popularity.desc';
    // TV has no primary_release_date; date sorts must use first_air_date.
    const resolvedSort = mediaType === 'tv'
      ? sortBy.replace('primary_release_date', 'first_air_date')
      : sortBy;
    const params = withReleasedBounds(
      mediaType,
      {
        sort_by: resolvedSort,
        ...(options.genre ? { with_genres: options.genre } : {}),
        ...(options.minRating ? { 'vote_average.gte': options.minRating } : {}),
        // Rating sorts need a real vote floor or obscure 10/10 titles surface.
        ...(sortBy.startsWith('vote_average') ? { 'vote_count.gte': mediaType === 'movie' ? 300 : 150 } : {}),
        page: options.page ?? 1,
      },
      todayStr,
    );
    const response = await tmdbRequest<PaginatedResponse<Movie | TvSeries>>(
      tmdb.endpoints.discover[mediaType],
      params,
    );
    const results = dedupeById(
      curate(filterReleased(response.results ?? [], { requirePoster: true, todayStr }), params, mediaType),
    );
    return { ...response, results };
  },
};