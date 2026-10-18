import type { Movie, TvSeries, Person, PaginatedResponse, CreditsResponse, Video, WatchProvidersResult, Genre } from '../types';

// Mock data for demo purposes - in production, this would call TMDB API through a proxy
const MOCK_MOVIES: Movie[] = [
  { id: 1, title: 'The Last Horizon', original_title: 'The Last Horizon', overview: 'A lone astronaut discovers a signal from beyond the known universe, leading to a journey that challenges everything humanity believes about its place in the cosmos.', poster_path: '/mock-poster-1.jpg', backdrop_path: '/mock-backdrop-1.jpg', release_date: '2024-03-15', vote_average: 8.2, vote_count: 2847, genre_ids: [878, 18], popularity: 94.5, adult: false, runtime: 148, tagline: 'Beyond the stars, beyond ourselves.', genres: [{ id: 878, name: 'Science Fiction' }, { id: 18, name: 'Drama' }] },
  { id: 2, title: 'Midnight in Marseille', original_title: 'Midnight in Marseille', overview: 'A jazz musician in 1960s France becomes entangled in a web of espionage when a mysterious woman walks into his club one rainy night.', poster_path: '/mock-poster-2.jpg', backdrop_path: '/mock-backdrop-2.jpg', release_date: '2024-01-22', vote_average: 7.8, vote_count: 1923, genre_ids: [53, 18], popularity: 87.2, adult: false, runtime: 132, tagline: 'Some melodies hide secrets.', genres: [{ id: 53, name: 'Thriller' }, { id: 18, name: 'Drama' }] },
  { id: 3, title: 'Ember & Ash', original_title: 'Ember & Ash', overview: 'Two rival chefs are forced to collaborate on a once-in-a-lifetime restaurant opening, discovering that the secret ingredient was never in the kitchen.', poster_path: '/mock-poster-3.jpg', backdrop_path: '/mock-backdrop-3.jpg', release_date: '2024-06-10', vote_average: 7.5, vote_count: 1456, genre_ids: [35, 10749], popularity: 76.8, adult: false, runtime: 118, tagline: 'Fire makes everything better.', genres: [{ id: 35, name: 'Comedy' }, { id: 10749, name: 'Romance' }] },
  { id: 4, title: 'The Cartographer', original_title: 'The Cartographer', overview: 'In the age of exploration, a mapmaker with an impossible gift must chart a continent that shouldn\'t exist before empires tear it apart.', poster_path: '/mock-poster-4.jpg', backdrop_path: '/mock-backdrop-4.jpg', release_date: '2024-04-05', vote_average: 8.5, vote_count: 3201, genre_ids: [12, 18, 36], popularity: 102.3, adult: false, runtime: 156, tagline: 'Every line tells a story.', genres: [{ id: 12, name: 'Adventure' }, { id: 18, name: 'Drama' }, { id: 36, name: 'History' }] },
  { id: 5, title: 'Neon Requiem', original_title: 'Neon Requiem', overview: 'In a rain-soaked megacity, a retired enforcer is pulled back into the underworld when his daughter goes missing.', poster_path: '/mock-poster-5.jpg', backdrop_path: '/mock-backdrop-5.jpg', release_date: '2024-02-28', vote_average: 7.9, vote_count: 2156, genre_ids: [28, 53, 878], popularity: 91.7, adult: false, runtime: 127, tagline: 'The city never sleeps. Neither does justice.', genres: [{ id: 28, name: 'Action' }, { id: 53, name: 'Thriller' }, { id: 878, name: 'Science Fiction' }] },
  { id: 6, title: 'Whispers in the Garden', original_title: 'Whispers in the Garden', overview: 'A botanist inherits her grandmother\'s estate and discovers a garden that blooms with flowers that can heal any ailment — but at a terrible cost.', poster_path: '/mock-poster-6.jpg', backdrop_path: '/mock-backdrop-6.jpg', release_date: '2024-05-18', vote_average: 7.3, vote_count: 987, genre_ids: [14, 18, 9648], popularity: 65.4, adult: false, runtime: 112, tagline: 'Nature remembers everything.', genres: [{ id: 14, name: 'Fantasy' }, { id: 18, name: 'Drama' }, { id: 9648, name: 'Mystery' }] },
  { id: 7, title: 'Velocity', original_title: 'Velocity', overview: 'The world\'s fastest woman alive must outrun her past when a conspiracy threatens to erase everyone she\'s ever loved.', poster_path: '/mock-poster-7.jpg', backdrop_path: '/mock-backdrop-7.jpg', release_date: '2024-07-04', vote_average: 7.1, vote_count: 1678, genre_ids: [28, 53], popularity: 88.9, adult: false, runtime: 121, tagline: 'Speed is survival.', genres: [{ id: 28, name: 'Action' }, { id: 53, name: 'Thriller' }] },
  { id: 8, title: 'The Last Letter', original_title: 'The Last Letter', overview: 'A World War II widow discovers an unsent letter that reveals a love story spanning decades and two continents.', poster_path: '/mock-poster-8.jpg', backdrop_path: '/mock-backdrop-8.jpg', release_date: '2024-02-14', vote_average: 8.0, vote_count: 2345, genre_ids: [10749, 18, 36], popularity: 72.1, adult: false, runtime: 138, tagline: 'Love finds a way through time.', genres: [{ id: 10749, name: 'Romance' }, { id: 18, name: 'Drama' }, { id: 36, name: 'History' }] },
];

const MOCK_TV: TvSeries[] = [
  { id: 101, name: 'The Iron Crown', original_name: 'The Iron Crown', overview: 'In a fractured medieval kingdom, five noble houses vie for a throne built on blood and betrayal. Alliances shift like sand.', poster_path: '/mock-tv-1.jpg', backdrop_path: '/mock-tv-backdrop-1.jpg', first_air_date: '2024-01-10', vote_average: 8.7, vote_count: 4521, genre_ids: [18, 10759], popularity: 156.3, number_of_seasons: 3, number_of_episodes: 24, genres: [{ id: 18, name: 'Drama' }, { id: 10759, name: 'Action & Adventure' }], status: 'Returning Series', tagline: 'Every crown has a price.' },
  { id: 102, name: 'Signal Lost', original_name: 'Signal Lost', overview: 'A deep-space research station goes dark. The rescue team that arrives finds something that defies every law of physics.', poster_path: '/mock-tv-2.jpg', backdrop_path: '/mock-tv-backdrop-2.jpg', first_air_date: '2024-03-20', vote_average: 8.4, vote_count: 3102, genre_ids: [18, 96, 10765], popularity: 134.7, number_of_seasons: 1, number_of_episodes: 8, genres: [{ id: 18, name: 'Drama' }, { id: 96, name: 'Mystery' }, { id: 10765, name: 'Sci-Fi & Fantasy' }], status: 'Returning Series', tagline: 'What you find in the dark changes you.' },
  { id: 103, name: 'Kitchen Confidential', original_name: 'Kitchen Confidential', overview: 'Behind the pass of the world\'s most demanding restaurant, a brigade of chefs fights for Michelin stars, sanity, and their souls.', poster_path: '/mock-tv-3.jpg', backdrop_path: '/mock-tv-backdrop-3.jpg', first_air_date: '2023-09-15', vote_average: 8.1, vote_count: 2876, genre_ids: [18, 35], popularity: 98.5, number_of_seasons: 2, number_of_episodes: 16, genres: [{ id: 18, name: 'Drama' }, { id: 35, name: 'Comedy' }], status: 'Returning Series', tagline: 'Yes, chef.' },
  { id: 104, name: 'The Archivist', original_name: 'The Archivist', overview: 'A quiet librarian discovers that the books in her collection are rewriting reality, one page at a time.', poster_path: '/mock-tv-4.jpg', backdrop_path: '/mock-tv-backdrop-4.jpg', first_air_date: '2024-05-01', vote_average: 8.3, vote_count: 1987, genre_ids: [96, 10765, 18], popularity: 112.4, number_of_seasons: 1, number_of_episodes: 10, genres: [{ id: 96, name: 'Mystery' }, { id: 10765, name: 'Sci-Fi & Fantasy' }, { id: 18, name: 'Drama' }], status: 'Returning Series', tagline: 'Some stories are alive.' },
  { id: 105, name: 'Borderline', original_name: 'Borderline', overview: 'A border patrol agent uncovers a smuggling operation that reaches into the highest levels of government.', poster_path: '/mock-tv-5.jpg', backdrop_path: '/mock-tv-backdrop-5.jpg', first_air_date: '2024-02-08', vote_average: 7.8, vote_count: 2234, genre_ids: [80, 18], popularity: 89.2, number_of_seasons: 2, number_of_episodes: 16, genres: [{ id: 80, name: 'Crime' }, { id: 18, name: 'Drama' }], status: 'Returning Series', tagline: 'The line between law and justice is invisible.' },
  { id: 106, name: 'Wildfire', original_name: 'Wildfire', overview: 'An elite team of smokejumpers battles the largest wildfires in American history while confronting their own inner demons.', poster_path: '/mock-tv-6.jpg', backdrop_path: '/mock-tv-backdrop-6.jpg', first_air_date: '2024-06-15', vote_average: 7.6, vote_count: 1567, genre_ids: [18, 10759], popularity: 78.3, number_of_seasons: 1, number_of_episodes: 8, genres: [{ id: 18, name: 'Drama' }, { id: 10759, name: 'Action & Adventure' }], status: 'Returning Series', tagline: 'Into the fire.' },
];

const MOCK_PEOPLE: Person[] = [
  { id: 201, name: 'Elena Vasquez', biography: 'Elena Vasquez is an award-winning filmmaker known for her visually stunning narratives that explore the intersection of memory and identity. Born in Buenos Aires, she studied at the National Film School before moving to Los Angeles.', profile_path: '/mock-person-1.jpg', birthday: '1978-05-12', deathday: null, place_of_birth: 'Buenos Aires, Argentina', known_for_department: 'Directing', popularity: 45.6 },
  { id: 202, name: 'James Chen', biography: 'James Chen is a versatile actor whose range spans from intense dramatic roles to witty comedies. A former stage actor, he transitioned to film in the early 2010s and has since become one of the most sought-after performers in Hollywood.', profile_path: '/mock-person-2.jpg', birthday: '1985-09-23', deathday: null, place_of_birth: 'Vancouver, Canada', known_for_department: 'Acting', popularity: 67.8 },
  { id: 203, name: 'Amara Okafor', biography: 'Amara Okafor is a Nigerian-British screenwriter and producer whose work has been celebrated for its authentic portrayal of diaspora experiences. She won the BAFTA for Best Original Screenplay in 2023.', profile_path: '/mock-person-3.jpg', birthday: '1990-03-15', deathday: null, place_of_birth: 'London, United Kingdom', known_for_department: 'Writing', popularity: 34.2 },
  { id: 204, name: 'Marcus Webb', biography: 'Marcus Webb is a cinematographer whose work has defined the visual language of modern thrillers. His signature use of natural light and shadow has earned him three Academy Award nominations.', profile_path: '/mock-person-4.jpg', birthday: '1975-11-08', deathday: null, place_of_birth: 'Chicago, Illinois, USA', known_for_department: 'Camera', popularity: 28.9 },
];

const MOCK_GENRES: Genre[] = [
  { id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }, { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' }, { id: 80, name: 'Crime' }, { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' }, { id: 10751, name: 'Family' }, { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' }, { id: 27, name: 'Horror' }, { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' }, { id: 10749, name: 'Romance' }, { id: 878, name: 'Science Fiction' },
  { id: 53, name: 'Thriller' }, { id: 10752, name: 'War' }, { id: 37, name: 'Western' },
];

const TV_GENRES: Genre[] = [
  { id: 10759, name: 'Action & Adventure' }, { id: 16, name: 'Animation' }, { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' }, { id: 99, name: 'Documentary' }, { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' }, { id: 10762, name: 'Kids' }, { id: 96, name: 'Mystery' },
  { id: 10763, name: 'News' }, { id: 10764, name: 'Reality' }, { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10766, name: 'Soap' }, { id: 10767, name: 'Talk' }, { id: 10768, name: 'War & Politics' },
  { id: 37, name: 'Western' },
];

// Simulate network delay
function delay(ms: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate placeholder image URLs using picsum for demo
function getPlaceholderImage(seed: string, width: number, height: number): string {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

function enrichMovie(movie: Movie, imageWidth = 500): Movie {
  return {
    ...movie,
    poster_path: getPlaceholderImage(`movie-${movie.id}`, 500, 750),
    backdrop_path: getPlaceholderImage(`backdrop-${movie.id}`, 1280, 720),
  };
}

function enrichTv(tv: TvSeries): TvSeries {
  return {
    ...tv,
    poster_path: getPlaceholderImage(`tv-${tv.id}`, 500, 750),
    backdrop_path: getPlaceholderImage(`tv-backdrop-${tv.id}`, 1280, 720),
  };
}

function enrichPerson(person: Person): Person {
  return {
    ...person,
    profile_path: getPlaceholderImage(`person-${person.id}`, 300, 450),
  };
}

export const tmdbService = {
  async getTrending(window: 'day' | 'week' = 'week'): Promise<Movie[]> {
    await delay(200);
    const movies = window === 'day' ? [...MOCK_MOVIES].reverse() : [...MOCK_MOVIES];
    return movies.map(m => enrichMovie(m));
  },

  async getPopularMovies(page = 1): Promise<PaginatedResponse<Movie>> {
    await delay(200);
    const movies = [...MOCK_MOVIES, ...MOCK_MOVIES.map(m => ({ ...m, id: m.id + 100 }))].map(m => enrichMovie(m));
    return { page, results: movies.slice((page - 1) * 8, page * 8), total_pages: 5, total_results: 40 };
  },

  async getPopularTv(page = 1): Promise<PaginatedResponse<TvSeries>> {
    await delay(200);
    const tv = [...MOCK_TV, ...MOCK_TV.map(t => ({ ...t, id: t.id + 100 }))].map(t => enrichTv(t));
    return { page, results: tv.slice((page - 1) * 8, page * 8), total_pages: 5, total_results: 40 };
  },

  async getTopRatedMovies(): Promise<Movie[]> {
    await delay(200);
    return [...MOCK_MOVIES].sort((a, b) => b.vote_average - a.vote_average).map(m => enrichMovie(m));
  },

  async getTopRatedTv(): Promise<TvSeries[]> {
    await delay(200);
    return [...MOCK_TV].sort((a, b) => b.vote_average - a.vote_average).map(t => enrichTv(t));
  },

  async getUpcomingMovies(): Promise<Movie[]> {
    await delay(200);
    return [...MOCK_MOVIES].reverse().map(m => enrichMovie(m));
  },

  async getMovieDetails(id: number): Promise<Movie> {
    await delay(200);
    const movie = MOCK_MOVIES.find(m => m.id === id) || MOCK_MOVIES[0];
    return enrichMovie(movie);
  },

  async getTvDetails(id: number): Promise<TvSeries> {
    await delay(200);
    const tv = MOCK_TV.find(t => t.id === id) || MOCK_TV[0];
    return enrichTv(tv);
  },

  async getMovieCredits(_id: number): Promise<CreditsResponse> {
    await delay(150);
    return {
      cast: MOCK_PEOPLE.map((p, i) => ({ ...enrichPerson(p), character: `Character ${i + 1}`, order: i })) as any,
      crew: [],
    };
  },

  async getTvCredits(_id: number): Promise<CreditsResponse> {
    await delay(150);
    return {
      cast: MOCK_PEOPLE.map((p, i) => ({ ...enrichPerson(p), character: `Character ${i + 1}`, order: i })) as any,
      crew: [],
    };
  },

  async getMovieVideos(_id: number): Promise<{ results: Video[] }> {
    await delay(150);
    return { results: [{ id: 'v1', key: 'dQw4w9WgXcQ', name: 'Official Trailer', site: 'YouTube', type: 'Trailer', official: true }] };
  },

  async getTvVideos(_id: number): Promise<{ results: Video[] }> {
    await delay(150);
    return { results: [{ id: 'v2', key: 'dQw4w9WgXcQ', name: 'Season 1 Trailer', site: 'YouTube', type: 'Trailer', official: true }] };
  },

  async getMovieSimilar(_id: number): Promise<Movie[]> {
    await delay(200);
    return [...MOCK_MOVIES].sort(() => Math.random() - 0.5).slice(0, 6).map(m => enrichMovie(m));
  },

  async getTvSimilar(_id: number): Promise<TvSeries[]> {
    await delay(200);
    return [...MOCK_TV].sort(() => Math.random() - 0.5).slice(0, 6).map(t => enrichTv(t));
  },

  async getMovieWatchProviders(_id: number): Promise<{ results: Record<string, WatchProvidersResult> }> {
    await delay(100);
    return { results: { US: { flatrate: [{ provider_id: 8, provider_name: 'Netflix', logo_path: '/netflix.png', display_priority: 1 }] } } };
  },

  async getTvWatchProviders(_id: number): Promise<{ results: Record<string, WatchProvidersResult> }> {
    await delay(100);
    return { results: { US: { flatrate: [{ provider_id: 337, provider_name: 'Disney+', logo_path: '/disney.png', display_priority: 1 }] } } };
  },

  async getPersonDetails(id: number): Promise<Person> {
    await delay(200);
    const person = MOCK_PEOPLE.find(p => p.id === id) || MOCK_PEOPLE[0];
    return enrichPerson(person);
  },

  async getPersonCredits(_id: number): Promise<{ cast: (Movie | TvSeries)[] }> {
    await delay(200);
    return { cast: [...MOCK_MOVIES.slice(0, 4).map(m => enrichMovie(m)), ...MOCK_TV.slice(0, 4).map(t => enrichTv(t))] as any };
  },

  async searchMulti(query: string): Promise<PaginatedResponse<any>> {
    await delay(300);
    if (!query) return { page: 1, results: [], total_pages: 0, total_results: 0 };
    const q = query.toLowerCase();
    const movies = MOCK_MOVIES.filter(m => m.title.toLowerCase().includes(q)).map(m => ({ ...enrichMovie(m), media_type: 'movie' }));
    const tv = MOCK_TV.filter(t => t.name.toLowerCase().includes(q)).map(t => ({ ...enrichTv(t), media_type: 'tv' }));
    const people = MOCK_PEOPLE.filter(p => p.name.toLowerCase().includes(q)).map(p => ({ ...enrichPerson(p), media_type: 'person' }));
    return { page: 1, results: [...movies, ...tv, ...people], total_pages: 1, total_results: movies.length + tv.length + people.length };
  },

  async getMovieGenres(): Promise<Genre[]> {
    await delay(100);
    return MOCK_GENRES;
  },

  async getTvGenres(): Promise<Genre[]> {
    await delay(100);
    return TV_GENRES;
  },

  async getLatest(mediaType: 'movie' | 'tv', _filter: any): Promise<(Movie | TvSeries)[]> {
    await delay(200);
    if (mediaType === 'tv') {
      return [...MOCK_TV].sort((a, b) => new Date(b.first_air_date).getTime() - new Date(a.first_air_date).getTime()).map(t => enrichTv(t));
    }
    return [...MOCK_MOVIES].sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime()).map(m => enrichMovie(m));
  },

  async getTopRated(mediaType: 'movie' | 'tv', _filter: any): Promise<(Movie | TvSeries)[]> {
    await delay(200);
    if (mediaType === 'tv') {
      return [...MOCK_TV].sort((a, b) => b.vote_average - a.vote_average).map(t => enrichTv(t));
    }
    return [...MOCK_MOVIES].sort((a, b) => b.vote_average - a.vote_average).map(m => enrichMovie(m));
  },

  async getBestOf(_filter: any): Promise<TvSeries[]> {
    await delay(200);
    return [...MOCK_TV].sort((a, b) => b.popularity - a.popularity).map(t => enrichTv(t));
  },

  async getDiscover(mediaType: 'movie' | 'tv', _filter: any): Promise<(Movie | TvSeries)[]> {
    await delay(200);
    if (mediaType === 'tv') {
      return [...MOCK_TV].map(t => enrichTv(t));
    }
    return [...MOCK_MOVIES].map(m => enrichMovie(m));
  },
};
