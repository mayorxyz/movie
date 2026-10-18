import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function localTmdbProxy(token) {
  const handleRequest = async (req, res, next) => {
    if (!req.url?.startsWith('/api/tmdb/')) return next();
    if (req.method !== 'GET') {
      res.statusCode = 405;
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }
    if (!token) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'TMDB_TOKEN environment variable is not set' }));
      return;
    }

    try {
      const tmdbPath = req.url.replace(/^\/api\/tmdb/, '');
      const response = await fetch(`https://api.themoviedb.org/3${tmdbPath}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      res.statusCode = response.status;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store');
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
