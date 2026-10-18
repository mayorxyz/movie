import type { VercelRequest, VercelResponse } from '@vercel/node';

// TMDB API base URL
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Allowlisted endpoint patterns (from config/tmdb.ts)
const ALLOWED_ENDPOINTS = [
  '/trending/',
  '/movie/',
  '/tv/',
  '/person/',
  '/search/',
  '/discover/',
  '/genre/',
  '/configuration',
];

// Cache TTLs in seconds (matching config/tmdb.ts cache settings)
const CACHE_TTLS = {
  default: 600, // 10 minutes
  series: 3600, // 1 hour
  season: 3600, // 1 hour
  upcoming: 3600, // 1 hour
};

function getCacheTTL(path: string): number {
  if (path.includes('/tv/') && path.includes('/season/')) {
    return CACHE_TTLS.season;
  }
  if (path.includes('/tv/') || path.includes('/movie/')) {
    return CACHE_TTLS.series;
  }
  if (path.includes('/upcoming')) {
    return CACHE_TTLS.upcoming;
  }
  return CACHE_TTLS.default;
}

function isAllowedEndpoint(path: string): boolean {
  return ALLOWED_ENDPOINTS.some(endpoint => path.startsWith(endpoint));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestUrl = new URL(req.url || '/', 'http://localhost');

  // Health check endpoint
  if (requestUrl.pathname === '/api/health' || requestUrl.pathname === '/api/tmdb/health') {
    const tokenConfigured = !!process.env.TMDB_TOKEN;
    return res.status(200).json({
      status: 'ok',
      tokenConfigured,
    });
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get TMDB token from environment
  const tmdbToken = process.env.TMDB_TOKEN;
  if (!tmdbToken) {
    console.error('TMDB_TOKEN environment variable is not set');
    return res.status(500).json({ error: 'TMDB token not configured' });
  }

  // Extract the path after /api/tmdb/
  const tmdbPath = requestUrl.pathname.replace(/^\/api\/tmdb/, '');
  
  if (!tmdbPath || tmdbPath === '/') {
    return res.status(400).json({ error: 'No endpoint specified' });
  }

  // Check if endpoint is allowlisted
  if (!isAllowedEndpoint(tmdbPath)) {
    return res.status(400).json({ 
      error: 'Endpoint not allowed',
      path: tmdbPath,
    });
  }

  // Build the full TMDB URL with query parameters
  const tmdbUrl = `${TMDB_BASE_URL}${tmdbPath}${requestUrl.search}`;

  try {
    // Forward request to TMDB API
    const response = await fetch(tmdbUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tmdbToken}`,
        'Accept': 'application/json',
      },
    });

    // Get response data
    const data = await response.json();

    // Set cache headers
    const ttl = getCacheTTL(tmdbPath);
    res.setHeader('Cache-Control', `s-maxage=${ttl}, stale-while-revalidate`);

    // Pass through rate limit headers if present
    if (response.headers.has('Retry-After')) {
      res.setHeader('Retry-After', response.headers.get('Retry-After')!);
    }

    // Return the response with TMDB's status code
    return res.status(response.status).json(data);

  } catch (error) {
    console.error('TMDB proxy error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch from TMDB',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
