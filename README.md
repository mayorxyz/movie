# Movievault

Movievault — your cinematic universe. A fast, responsive catalogue for discovering movies and TV shows, checking what is trending or coming soon, exploring directors and actors, and keeping a personal watchlist.

Built with React, TypeScript, Vite and TanStack Query, powered by [TMDB](https://www.themoviedb.org/). The TMDB token is kept server-side and proxied through `/api/tmdb`, so it is never shipped to the browser.

## Features

- Home rows for trending (day/week/month), latest, fresh this year, top rated, best of, genres, franchises, classics, directors and actors.
- Full-list section pages with category tabs/dropdowns and pagination.
- Browse pages for movies and TV with genre, rating and sort filters plus numbered pagination.
- Movie and TV detail pages: cast, seasons/episodes, trailers, similar titles, watch providers.
- Upcoming calendar view with month navigation.
- Search across movies, TV shows and people, with recent searches.
- Watchlist and watched history persisted in `localStorage`.
- Responsive layout with safe-area support and a back-to-top control.

## Tech stack

- React 18 + TypeScript
- Vite 6
- Tailwind CSS 4
- TanStack Query (live data, retries, refetching)
- Zustand (persisted user state)
- React Router 7
- Framer Motion, Lucide icons

## Requirements

- Node.js 20+ (see `.nvmrc`)
- A TMDB account with a read access token: <https://www.themoviedb.org/settings/api>

## Getting started

```bash
npm ci
cp .env.example .env   # then fill in TMDB_TOKEN
npm run dev
```

The dev server runs at <http://localhost:3000>. Requests to `/api/tmdb?path=...` are proxied to TMDB by a Vite middleware, so the token stays on the server during development too.

## Environment variables

| Variable | Scope | Required | Description |
| --- | --- | --- | --- |
| `TMDB_TOKEN` | Server only | Yes | TMDB API read access token. **Never** prefix it with `VITE_`. |
| `VITE_TMDB_PROXY_URL` | Client | No | Public proxy path, defaults to `/api/tmdb`. |

Anything prefixed with `VITE_` is embedded in the public bundle. Only the proxy path belongs there.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with the local TMDB proxy. |
| `npm run build` | Production build to `dist/`. |
| `npm run preview` | Preview the production build (with the local proxy). |
| `npm run typecheck` | Run TypeScript without emitting files. |
| `npm test` | Run the Vitest suite. |

## Project structure

```
api/tmdb.ts              Serverless TMDB proxy (Vercel function)
public/                 Static assets (favicon)
src/
  components/           Layout, UI primitives and shared components
  config/               Site, TMDB endpoints, home sections, curated data
  features/             Page-level features (home, browse, movie, series,
                        upcoming, sections, person, watchlist, about)
  hooks/                Data and UI hooks
  lib/                  Helpers (release filters, formatting)
  services/             TMDB client, request limiter
  store/                Zustand stores (watchlist, watched, filters)
  types/                Shared TypeScript types
vercel.json             Build, SPA rewrites, caching and security headers
vite.config.js          Vite config and local TMDB proxy
```

## Data and persistence

- Content is always fetched live from TMDB through the proxy. React Query refetches on mount, focus and reconnect, so the app does not depend on baked-in data.
- User data (watchlist, watched history, recent searches, home media-type filter) is saved to `localStorage` and restored on load. Storage keys are prefixed with `movievault-`; legacy `cinevault-` keys are migrated automatically.

## Security

- `TMDB_TOKEN` is read only inside the serverless function and the Vite middleware.
- The proxy only allows `GET` requests to an allowlist of TMDB paths and rejects path traversal and credential-override query params (`api_key`, `access_token`, `token`, `authorization`).
- Responses include `nosniff` and `no-referrer` headers; the deployment adds CSP, frame and permissions headers.
- Secrets are git-ignored (`.env*` except `.env.example`). If a token is ever exposed, rotate it in the TMDB dashboard.

## Deploying to Vercel

1. Push the repository to GitHub/GitLab/Bitbucket and import it in Vercel.
2. Vercel detects Vite via `vercel.json` (`npm run build`, output `dist`).
3. Add `TMDB_TOKEN` under **Project Settings → Environment Variables** for Production, Preview and Development. Do not add it as a `VITE_` variable.
4. Deploy. The `api/tmdb.ts` and `api/health.ts` functions are deployed automatically, and the SPA rewrite serves `index.html` for client routes.

For other hosts, run `npm run build` and serve `dist/` as a single-page app, and deploy `api/tmdb.ts` as a serverless function (or provide an equivalent proxy) that sets `TMDB_TOKEN` in its environment.

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB. All title metadata and artwork are provided by TMDB.
