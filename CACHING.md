# Caching Strategy Documentation

## Overview
This application implements a multi-layered caching strategy to optimize performance and reduce API calls to TMDB while respecting rate limits.

## Route Handler Caching (Backend)

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

**Status:** ✅ Implemented

### 2. Search Endpoint (`/api/movies/search`)
**Cache Duration:** 60 seconds
```typescript
export const revalidate = 60;
```

**Rationale:**
- Search results change more frequently than configuration
- 1-minute cache provides good balance between freshness and performance
- Reduces load during repeated searches
- Users expect relatively fresh search results

**Status:** ✅ Implemented

### 3. Movie Details Endpoint (`/api/movies/[id]`)
**Cache Duration:** 60 seconds
```typescript
export const revalidate = 60;
```

**Rationale:**
- Movie details (ratings, cast) can change but not frequently
- 1-minute cache reduces API load for popular movies
- Balances data freshness with performance
- Details pages are often shared/revisited

**Status:** ✅ Implemented

## Frontend Page Caching (Server Components)

### 1. Search & Listing Page (`/`)
**Cache Duration:** 60 seconds (matches API)
```typescript
const response = await fetch(url, {
  next: { revalidate: 60 }
});
```

**Rationale:**
- Matches backend cache duration for consistency
- Server-rendered pages benefit from same caching strategy
- Reduces server load for popular searches

**Status:** ✅ Implemented

### 2. Movie Detail Page (`/movie/[id]`)
**Cache Duration:** 60 seconds (matches API)
```typescript
const response = await fetch(url, {
  next: { revalidate: 60 }
});
```

**Rationale:**
- Matches backend cache duration for consistency
- Popular movies benefit from page-level caching
- Metadata generation is cached along with page data

**Status:** ✅ Implemented

## Next.js Built-in Caching

Next.js automatically caches:
- **Route Handlers** with `revalidate` export
- **Server Components** data fetching with `fetch()` and `next.revalidate` option
- **Metadata** generation (titles, descriptions)
- **Static Assets** (images, fonts, etc.)

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

**Frontend Handling:**
- Error states displayed to users
- Graceful degradation
- "Try again" messaging

## Cache Invalidation

Caches automatically revalidate after the specified duration. Manual invalidation can be done using:
- `revalidatePath()` - Revalidate specific path
- `revalidateTag()` - Revalidate by cache tag
- On-demand via API routes if needed

## Production Considerations

- ✅ All caching is server-side (no client-side cache pollution)
- ✅ Environment variables never exposed to client
- ✅ Proper error boundaries prevent cache poisoning
- ✅ Rate limit detection prevents cascade failures
- ✅ Consistent cache durations across frontend and backend
- ✅ CDN-friendly (Vercel Edge Network compatible)

## Summary

| Endpoint/Page | Cache Duration | Status |
|---------------|----------------|--------|
| `/api/config` | 24 hours | ✅ Implemented |
| `/api/movies/search` | 60 seconds | ✅ Implemented |
| `/api/movies/[id]` | 60 seconds | ✅ Implemented |
| `/` (Search Page) | 60 seconds | ✅ Implemented |
| `/movie/[id]` (Detail Page) | 60 seconds | ✅ Implemented |

All caching policies are production-ready and optimized for performance.
