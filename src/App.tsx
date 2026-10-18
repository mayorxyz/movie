import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import { PageSkeleton } from './components/ui/Skeleton';
import { NotFoundPage, ErrorPage } from './features/errors/ErrorPages';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./features/home/HomePage'));
const MovieDetailPage = lazy(() => import('./features/movie/MovieDetailPage'));
const TvDetailPage = lazy(() => import('./features/series/TvDetailPage'));
const BrowsePage = lazy(() => import('./features/browse/BrowsePage'));
const SearchPage = lazy(() => import('./features/search/SearchPage'));
const PersonPage = lazy(() => import('./features/person/PersonPage'));
const WatchlistPage = lazy(() => import('./features/watchlist/WatchlistPage'));
const AboutPage = lazy(() => import('./features/about/AboutPage'));

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 6 * 30 * 24 * 60 * 60 * 1000, // 6 months
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Router
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'movie/:id',
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <MovieDetailPage />
          </Suspense>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: 'tv/:id',
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <TvDetailPage />
          </Suspense>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: 'browse/:type',
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <BrowsePage />
          </Suspense>
        ),
      },
      {
        path: 'browse',
        element: <Navigate to="/browse/movies" replace />,
      },
      {
        path: 'search',
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <SearchPage />
          </Suspense>
        ),
      },
      {
        path: 'person/:id',
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <PersonPage />
          </Suspense>
        ),
      },
      {
        path: 'watchlist',
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <WatchlistPage />
          </Suspense>
        ),
      },
      {
        path: 'about',
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <AboutPage />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
