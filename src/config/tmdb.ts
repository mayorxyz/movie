export const tmdb = {
  baseUrl: 'https://api.themoviedb.org/3',
  imageBaseUrl: 'https://image.tmdb.org/t/p',
  imageSizes: {
    poster: {
      sm: 'w185',
      md: 'w342',
      lg: 'w500',
    },
    backdrop: {
      sm: 'w780',
      md: 'w1280',
      lg: 'original',
    },
    profile: {
      sm: 'w185',
      md: 'h632',
    },
    still: {
      sm: 'w185',
      md: 'w300',
      lg: 'original',
    },
  },
  cache: {
    seriesDetails: 60 * 60 * 1000, // 1 hour
    seriesDetailsOngoing: 10 * 60 * 1000, // 10 min for ongoing shows
    seasonData: 60 * 60 * 1000, // 1 hour
    seasonDataOngoing: 10 * 60 * 1000, // 10 min for ongoing shows
    upcomingCalendar: 60 * 60 * 1000, // 1 hour
  },
  endpoints: {
    trending: '/trending/all/week',
    trendingMovies: '/trending/movie/week',
    trendingTv: '/trending/tv/week',
    popularMovies: '/movie/popular',
    popularTv: '/tv/popular',
    topRatedMovies: '/movie/top_rated',
    topRatedTv: '/tv/top_rated',
    upcomingMovies: '/movie/upcoming',
    movieDetails: (id: number) => `/movie/${id}`,
    tvDetails: (id: number) => `/tv/${id}`,
    tvSeason: (id: number, seasonNumber: number) => `/tv/${id}/season/${seasonNumber}`,
    movieCredits: (id: number) => `/movie/${id}/credits`,
    tvCredits: (id: number) => `/tv/${id}/credits`,
    movieSimilar: (id: number) => `/movie/${id}/similar`,
    tvSimilar: (id: number) => `/tv/${id}/similar`,
    movieVideos: (id: number) => `/movie/${id}/videos`,
    tvVideos: (id: number) => `/tv/${id}/videos`,
    movieWatchProviders: (id: number) => `/movie/${id}/watch/providers`,
    tvWatchProviders: (id: number) => `/tv/${id}/watch/providers`,
    personDetails: (id: number) => `/person/${id}`,
    personCredits: (id: number) => `/person/${id}/combined_credits`,
    personImages: (id: number) => `/person/${id}/images`,
    searchMulti: '/search/multi',
    searchMovies: '/search/movie',
    searchTv: '/search/tv',
    searchPerson: '/search/person',
    discoverMovies: '/discover/movie',
    discoverTv: '/discover/tv',
    discover: {
      movie: '/discover/movie',
      tv: '/discover/tv',
    },
    genres: {
      movie: '/genre/movie/list',
      tv: '/genre/tv/list',
    },
  },
} as const;
