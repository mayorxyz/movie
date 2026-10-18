export const site = {
  name: 'Cinevault',
  tagline: 'Your cinematic universe',
  nav: [
    { label: 'Movies', path: '/browse/movies' },
    { label: 'TV Shows', path: '/browse/tv' },
    { label: 'Search', path: '/search' },
    { label: 'Watchlist', path: '/watchlist' },
  ],
  footer: {
    tmdbAttribution: 'This product uses the TMDB API but is not endorsed or certified by TMDB.',
    copyright: `© ${new Date().getFullYear()} Cinevault. All rights reserved.`,
  },
} as const;
