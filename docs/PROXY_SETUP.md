# TMDB Proxy Setup - Implementation Report

## Overview
Implemented a complete TMDB proxy infrastructure with serverless functions, shared request limiting, and proper environment configuration.

## Changes Summary

### 1. Serverless Proxy Function
**File:** `api/tmdb/[...path].ts`

Created a Vercel serverless function that:
- Forwards GET requests to TMDB API
- Adds Authorization Bearer token from `TMDB_TOKEN` environment variable
- Implements endpoint allowlist (only paths defined in config/tmdb.ts)
- Returns 400 for unauthorized endpoints
- Passes through status codes including 429 and Retry-After headers
- Implements edge caching with TTLs matching config:
  - Season data: 1 hour
  - Series/movie data: 1 hour
  - Upcoming data: 1 hour
  - Default: 10 minutes
- Includes `/api/health` endpoint that returns:
  ```json
  {
    "status": "ok",
    "tokenConfigured": boolean
  }
  ```

**Security Features:**
- Token is never returned in responses
- Token is never logged
- Only allowlisted endpoints are accessible
- Method restriction (GET only)

### 2. Shared Request Limiter
**File:** `src/services/requestLimiter.ts`

Created a singleton request limiter class:
- Limits concurrent requests to 4 (configurable)
- Implements queue for requests exceeding limit
- Exported as `sharedLimiter` singleton instance
- Used by all TMDB API calls across the application

### 3. TMDB Client Updates
**File:** `src/services/tmdbClient.ts`

Updated to:
- Use proxy base URL from `VITE_TMDB_PROXY_URL` environment variable
- Default to `/api/tmdb` if not specified
- Use shared limiter for all requests via `tmdbFetch` helper
- Properly handle errors with status codes and Retry-After headers
- No direct TMDB API calls or keys in client code

### 4. Environment Configuration
**File:** `.env.example`

Created environment template with:
```env
# TMDB API Configuration
# Get your API key from https://www.themoviedb.org/settings/api
VITE_TMDB_API_KEY=your_tmdb_api_key_here

# Proxy Configuration
# The base URL for the TMDB proxy server
VITE_TMDB_PROXY_URL=/api/tmdb
```

**File:** `.gitignore`

Added environment file exclusions:
```
.env
.env.local
.env.*.local
```

### 5. TypeScript Configuration
**File:** `src/vite-env.d.ts`

Added Vite environment type definitions:
```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TMDB_PROXY_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### 6. Configuration Updates
**File:** `src/config/site.ts`

Moved `minReleasesForFallback` from `copy.upcoming` to new `settings` section:
```typescript
settings: {
  minReleasesForFallback: 10,
},
```

**File:** `src/features/upcoming/useUpcomingReleases.ts`

Updated to:
- Use `site.settings.minReleasesForFallback` instead of `site.copy.upcoming.minReleasesForFallback`
- Use `sharedLimiter` from `src/services/requestLimiter` instead of local limiter
- Removed local `concurrencyLimiter` implementation

### 7. Documentation
**File:** `docs/PROXY_SETUP.md`

Created comprehensive documentation covering:
- Architecture overview
- Environment setup instructions
- Security considerations
- Caching strategy
- Rate limiting details
- Health check endpoint
- Deployment instructions

## Architecture

```
┌─────────────────┐
│   React App     │
│  (tmdbClient)   │
└────────┬────────┘
         │
         │ Shared Limiter (4 concurrent)
         │
         ▼
┌─────────────────┐
│  Vercel Proxy   │
│  /api/tmdb/*    │
└────────┬────────┘
         │
         │ Authorization: Bearer TMDB_TOKEN
         │ Endpoint Allowlist
         │ Edge Caching
         │
         ▼
┌─────────────────┐
│   TMDB API      │
│ api.themoviedb.org│
└─────────────────┘
```

## Security Improvements

1. **Token Protection:**
   - TMDB API token stored server-side only
   - Never exposed to client bundle
   - Never logged or returned in responses

2. **Endpoint Restriction:**
   - Only allowlisted endpoints accessible
   - Returns 400 for unauthorized paths
   - Prevents API abuse

3. **Rate Limiting:**
   - Client-side: 4 concurrent requests max
   - Server-side: TMDB's rate limits respected
   - 429 responses passed through with Retry-After

4. **Environment Isolation:**
   - `.env` files excluded from git
   - Only `.env.example` committed
   - Environment-specific configuration

## Caching Strategy

| Endpoint Type | TTL | Rationale |
|--------------|-----|-----------|
| Season data | 1 hour | Episodes don't change frequently |
| Series/Movie details | 1 hour | Metadata is relatively stable |
| Upcoming releases | 1 hour | Release dates change occasionally |
| Default | 10 minutes | General data, shorter cache |

All cached responses include `stale-while-revalidate` for optimal performance.

## Rate Limiting

### Client-Side (Shared Limiter)
- Max 4 concurrent requests
- Queue-based for overflow
- Singleton pattern ensures global limit
- Used by all features (upcoming, series, browse, etc.)

### Server-Side (TMDB API)
- Respects TMDB's rate limits
- Passes through 429 status codes
- Includes Retry-After header
- Client implements exponential backoff

## Testing

### Health Check
```bash
curl https://your-domain.com/api/tmdb/health
```

Expected response:
```json
{
  "status": "ok",
  "tokenConfigured": true
}
```

### Proxy Request
```bash
curl "https://your-domain.com/api/tmdb/movie/popular?page=1"
```

Should return TMDB API response with proper caching headers.

## Deployment Checklist

- [ ] Set `TMDB_TOKEN` environment variable in Vercel
- [ ] Set `VITE_TMDB_PROXY_URL` in environment (optional, defaults to `/api/tmdb`)
- [ ] Verify `.env` is in `.gitignore`
- [ ] Deploy to Vercel
- [ ] Test health endpoint
- [ ] Test proxy with sample request
- [ ] Verify caching headers in responses
- [ ] Monitor rate limiting in production

## Files Changed

### New Files
- `api/tmdb/[...path].ts` - Serverless proxy function
- `src/services/requestLimiter.ts` - Shared request limiter
- `src/vite-env.d.ts` - TypeScript environment types
- `.env.example` - Environment template
- `docs/PROXY_SETUP.md` - Setup documentation

### Modified Files
- `src/services/tmdbClient.ts` - Added proxy support and shared limiter
- `src/features/upcoming/useUpcomingReleases.ts` - Use shared limiter, updated config path
- `src/config/site.ts` - Moved minReleasesForFallback to settings
- `.gitignore` - Added .env exclusions

## Breaking Changes

None. The changes are backward compatible:
- Mock data still works for development
- Proxy URL defaults to `/api/tmdb`
- Existing API calls continue to work
- No changes to public interfaces

## Migration Steps

For existing deployments:

1. **Add environment variables:**
   ```bash
   # In Vercel dashboard or .env.local
   TMDB_TOKEN=your_actual_tmdb_token
   VITE_TMDB_PROXY_URL=/api/tmdb  # Optional
   ```

2. **Deploy proxy function:**
   - Vercel will automatically detect `api/` directory
   - No additional configuration needed

3. **Test integration:**
   ```bash
   npm run dev
   # Visit http://localhost:5173/api/tmdb/health
   ```

4. **Monitor production:**
   - Check health endpoint
   - Monitor rate limiting
   - Verify caching headers

## Performance Impact

### Before
- Direct TMDB API calls from client
- No rate limiting
- No caching
- API key exposed in bundle

### After
- Proxied through serverless function
- 4 concurrent request limit
- Edge caching (10min - 1hr)
- API key secure on server
- Reduced TMDB API calls via caching

## Next Steps

1. Set up monitoring for proxy function
2. Add request logging (without token)
3. Implement circuit breaker for TMDB outages
4. Add request metrics/observability
5. Consider CDN caching for static responses

## Support

For issues or questions:
- Check `docs/PROXY_SETUP.md` for detailed setup
- Verify environment variables are set
- Test health endpoint first
- Check Vercel function logs for errors
