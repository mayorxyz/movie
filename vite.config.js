import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const ALLOWED_ENDPOINTS = [
  '/trending/',
  '/movie/',
  '/tv/',
  '/person/',
  '/search/',
  '/discover/',
  '/genre/',
  '/collection/',
  '/configuration',
];
// Params that could override our server-side credentials.
const FORBIDDEN_QUERY_PARAMS = ['api_key', 'access_token', 'token', 'authorization'];
const SAFE_PATH = /^\/(?:[A-Za-z0-9_-]+\/?)+$/;

function parseTmdbPath(url) {
  let parsed;
  try {
    parsed = new URL(url, 'http://localhost');
  } catch {
    return null;
  }
  for (const key of parsed.searchParams.keys()) {
    if (FORBIDDEN_QUERY_PARAMS.includes(key.toLowerCase())) return null;
  }
  let decoded;
  try {
    decoded = decodeURIComponent(parsed.pathname);
  } catch {
    return null;
  }
  if (decoded.includes('..') || decoded.includes('\\') || decoded.includes('//')) return null;
  if (!SAFE_PATH.test(decoded)) return null;
  const tmdbPath = decoded.replace(/^\/api\/tmdb/, '');
  if (!tmdbPath || tmdbPath === '/') return null;
  if (!ALLOWED_ENDPOINTS.some((endpoint) => tmdbPath.startsWith(endpoint))) return null;
  return `${tmdbPath}${parsed.search}`;
}

function localTmdbProxy(token) {
  const handleRequest = async (req, res, next) => {
    if (!req.url?.startsWith('/api/tmdb/')) return next();
    if (req.method !== 'GET') {
      res.statusCode = 405;
      res.setHeader('Allow', 'GET');
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }
    if (!token) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'TMDB token not configured' }));
      return;
    }

    const tmdbPath = parseTmdbPath(req.url);
    if (!tmdbPath) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Invalid endpoint or query parameters' }));
      return;
    }

    try {
      const response = await fetch(`https://api.themoviedb.org/3${tmdbPath}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      res.statusCode = response.status;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Referrer-Policy', 'no-referrer');
      const retryAfter = response.headers.get('Retry-After');
      if (retryAfter) res.setHeader('Retry-After', retryAfter);
      res.end(await response.text());
    } catch (error) {
      console.error('TMDB proxy request failed:', error);
      res.statusCode = 502;
      res.end(JSON.stringify({ error: 'Failed to fetch from TMDB' }));
    }
  };

  return {
    name: 'local-tmdb-proxy',
    configureServer(server) {
      server.middlewares.use(handleRequest);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleRequest);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
  plugins: [react(), tailwindcss(), localTmdbProxy(env.TMDB_TOKEN)],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
  },
  };
});
