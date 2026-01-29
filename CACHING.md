# Caching Strategy Documentation

## Overview
This application implements a multi-layered caching strategy to optimize performance and reduce API calls to TMDB while respecting rate limits.

## Route Handler Caching

### 1. Configuration Endpoint (`/api/config`)
**Cache Duration:** 24 hours (86400 seconds)
```typescript
export const revalidate = 86400;
```

**Rationale:**
- TMDB configuration data (image URLs, sizes) rarely changes
- Aggressive caching reduces unnecessary API calls
- 24-hour window balances freshness with performance
- Configuration is foundational data needed for all image rendering

### 2. Search Endpoint (`/api/movies/search`)
**Cache Duration:** 60 seconds (to be implemented in Step 3)
```typescript
export const revalidate = 60;
```

**Rationale:**
- Search results change more frequently than configuration
- 1-minute cache provides good balance between freshness and performance
- Reduces load during repeated searches
- Users expect relatively fresh search results

### 3. Movie Details Endpoint (`/api/movies/[id]`)
**Cache Duration:** 60 seconds (to be implemented in Step 4)
```typescript
export const revalidate = 60;
```

**Rationale:**
- Movie details (ratings, cast) can change but not frequently
- 1-minute cache reduces API load for popular movies
- Balances data freshness with performance
- Details pages are often shared/revisited

## Next.js Built-in Caching

Next.js automatically caches:
- **Route Handlers** with `revalidate` export
- **Server Components** data fetching with `fetch()` and `revalidate` option
- **Static Generation** for pages without dynamic data

## Rate Limit Handling

All endpoints detect and handle TMDB HTTP 429 responses:
```typescript
if (response.status === 429) {
  throw new TMDBError(
    "TMDB API rate limit exceeded. Please try again later.",
    429,
    true
  );
}
```

Error responses include:
- Structured JSON error format
- User-friendly error messages
- Proper HTTP status codes
- Rate limit flag for client-side handling

## Cache Invalidation

Caches automatically revalidate after the specified duration. Manual invalidation can be done using Next.js revalidation APIs if needed in the future.

## Production Considerations

- All caching is server-side (no client-side cache pollution)
- Environment variables never exposed to client
- Proper error boundaries prevent cache poisoning
- Rate limit detection prevents cascade failures
