// Minimal structural types so the function has no external type dependency.
interface ApiRequest {
  method?: string;
  url?: string;
}

interface ApiResponse {
  setHeader(name: string, value: string): void;
  status(code: number): ApiResponse;
  json(body: unknown): void;
}

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
  '/collection/',
  '/configuration',
];

// Query params that would let a caller override our credentials or probe auth.
const FORBIDDEN_QUERY_PARAMS = ['api_key', 'access_token', 'token', 'authorization'];

// Only plain TMDB paths: no traversal, protocols, backslashes or stray segments.
const SAFE_PATH = /^\/(?:[A-Za-z0-9_-]+\/?)+$/;

function normalizeTmdbPath(rawPath: string): string | null {
  if (!rawPath.startsWith('/')) return null;
  if (rawPath.includes('..') || rawPath.includes('\\') || rawPath.includes('//')) return null;
  if (!SAFE_PATH.test(rawPath)) return null;
  return rawPath;
}

function hasForbiddenParams(url: URL): boolean {
  for (const key of url.searchParams.keys()) {
    if (FORBIDDEN_QUERY_PARAMS.includes(key.toLowerCase())) return true;
  }
  return false;
}

function setSecurityHeaders(res: ApiResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-TMDB-Proxy', '1');
}

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
  return ALLOWED_ENDPOINTS.some((endpoint) => path.startsWith(endpoint));
}

// Accept the common names people use in Vercel so a correctly configured
// project works regardless of which label the token was saved under.
const TOKEN_ENV_NAMES = [
  'TMDB_TOKEN',
  'TMDB_API_READ_ACCESS_TOKEN',
  'TMDB_ACCESS_TOKEN',
  'TMDB_API_KEY',
  'TMDB_KEY',
];

function readToken(): string {
  for (const name of TOKEN_ENV_NAMES) {
    const raw = process.env[name];
    if (!raw) continue;
    const value = raw
      .trim()
      .replace(/^['"]|['"]$/g, '')
      .replace(/^Bearer\s+/i, '')
      .trim();
    if (value) return value;
  }
  return '';
}

/** v4 read tokens are JWTs; v3 API keys are passed as a query parameter. */
function isBearerToken(token: string): boolean {
  return token.startsWith('eyJ') || token.split('.').length === 3;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setSecurityHeaders(res);

  const requestUrl = new URL(req.url || '/', 'http://localhost');

  // Health check endpoint: never reveal whether secrets are configured.
  if (requestUrl.pathname === '/api/health') {
    return res.status(200).json({ status: 'ok' });
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (hasForbiddenParams(requestUrl)) {
    return res.status(400).json({ error: 'Invalid query parameters' });
  }

  // Get TMDB token from environment (server-only; never sent to the client)
  const tmdbToken = readToken();
  if (!tmdbToken) {
    console.error(`TMDB token not configured. Set one of: ${TOKEN_ENV_NAMES.join(', ')}`);
    return res.status(500).json({
      error: 'TMDB token not configured',
      expectedEnv: TOKEN_ENV_NAMES,
    });
  }

  // The TMDB path is passed as ?path=/trending/all/week so the function is a
  // single, exactly-matched route (/api/tmdb). Vercel does not reliably match
  // nested catch-all API files such as api/tmdb/[...path].ts.
  const rawPath = requestUrl.searchParams.get('path') || '';
  const tmdbPath = normalizeTmdbPath(rawPath);

  if (!tmdbPath || tmdbPath === '/') {
    return res.status(400).json({ error: 'No endpoint specified' });
  }

  // Check if endpoint is allowlisted
  if (!isAllowedEndpoint(tmdbPath)) {
    return res.status(400).json({ error: 'Endpoint not allowed' });
  }

  // Build the full TMDB URL with the remaining query parameters.
  const forwardedParams = new URLSearchParams(requestUrl.searchParams);
  forwardedParams.delete('path');
  const bearer = isBearerToken(tmdbToken);
  if (!bearer) forwardedParams.set('api_key', tmdbToken);
  const query = forwardedParams.toString();
  const tmdbUrl = `${TMDB_BASE_URL}${tmdbPath}${query ? `?${query}` : ''}`;

  try {
    // Forward request to TMDB API
    const response = await fetch(tmdbUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(bearer ? { 'Authorization': `Bearer ${tmdbToken}` } : {}),
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
    return res.status(500).json({ error: 'Failed to fetch from TMDB' });
  }
}
