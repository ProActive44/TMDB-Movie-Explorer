# TMDB Movie Explorer

A production-ready movie discovery application built with Next.js 16, demonstrating Server-Side Rendering (SSR), Backend-for-Frontend (BFF) architecture, and modern web development best practices.

## 🎯 Project Overview

This application allows users to search and explore movies from The Movie Database (TMDB). It showcases:

- **Next.js App Router** with Server Components
- **Server-Side Rendering (SSR)** for optimal performance and SEO
- **Backend-for-Frontend (BFF)** pattern using Route Handlers
- **TypeScript** for type safety
- **Comprehensive caching** strategy
- **Rate limit handling**
- **Automated testing** with Vitest
- **Production deployment** ready

## 🚀 Live Demo

**[https://tmdb-movie-explorer-smoky.vercel.app/](https://tmdb-movie-explorer-smoky.vercel.app/)**

## ✨ Features

### Search & Discovery
- 🔍 Real-time movie search with TMDB database
- 📄 Paginated results (up to 500 pages)
- ⭐ Movie ratings and release years
- 🎬 Detailed movie information

### Movie Details
- 📝 Complete movie information (title, overview, runtime, genres)
- 👥 Top 5 cast members with photos
- 🎥 YouTube trailers embedded
- 🖼️ High-quality posters and backdrops
- 📊 Ratings and vote counts

### Technical Features
- ⚡ Server-Side Rendering for fast initial loads
- 🔒 Secure API key management (never exposed to client)
- 💾 Smart caching (60s for data, 24h for config)
- 🚦 Rate limit detection and handling
- 📱 Fully responsive design
- 🌙 Dark mode support
- ♿ SEO optimized with dynamic metadata

## 🛠️ Tech Stack

- **Framework:** Next.js 16.1.6
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Testing:** Vitest + Testing Library
- **API:** TMDB REST API
- **Deployment:** Vercel (recommended)

## 📋 Prerequisites

- Node.js 20+ 
- npm/yarn/pnpm
- TMDB API Read Access Token ([Get one here](https://www.themoviedb.org/settings/api))

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd tmdb-movie-explorer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your TMDB Read Access Token:
   ```env
   TMDB_READ_ACCESS_TOKEN=your_actual_token_here
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run type checking:
```bash
npm run typecheck
```

Run linting:
```bash
npm run lint
```

## 📦 Build & Deploy

### Build for Production

```bash
npm run build
```

### Start Production Server Locally

```bash
npm run start
```

### Deploy to Vercel

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set Environment Variables**
   
   In Vercel dashboard, add:
   - `TMDB_READ_ACCESS_TOKEN` (your TMDB token)
   - `NEXT_PUBLIC_BASE_URL` (your production URL)

4. **Redeploy**
   ```bash
   vercel --prod
   ```

### Alternative Deployment Platforms

- **Netlify:** Connect your Git repository and set environment variables
- **Railway:** Deploy via Git integration
- **AWS Amplify:** Use the Amplify Console

## 🏗️ Architecture

### Project Structure

```
tmdb-movie-explorer/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # Backend Route Handlers (BFF)
│   │   │   ├── config/           # TMDB configuration endpoint
│   │   │   └── movies/
│   │   │       ├── search/       # Movie search endpoint
│   │   │       └── [id]/         # Movie details endpoint
│   │   ├── movie/
│   │   │   └── [id]/             # Movie detail page
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Search & listing page
│   ├── components/               # React components
│   │   ├── BackButton.tsx        # Client component for navigation
│   │   ├── MovieCard.tsx         # Movie card display
│   │   ├── Pagination.tsx        # Pagination controls
│   │   └── SearchInput.tsx       # Search input (client)
│   ├── lib/                      # Utilities
│   │   ├── env.ts                # Environment validation
│   │   └── tmdb.ts               # TMDB API client
│   └── types/                    # TypeScript types
│       ├── api.ts                # API response types
│       └── tmdb.ts               # TMDB types
├── CACHING.md                    # Caching strategy docs
└── README.md                     # This file
```

### API Routes (BFF Pattern)

All TMDB API calls go through internal Route Handlers:

1. **`GET /api/config`**
   - Returns TMDB image configuration
   - Cached: 24 hours

2. **`GET /api/movies/search?q=<query>&page=<number>`**
   - Search movies by title
   - Validation: query min 2 chars, page >= 1
   - Cached: 60 seconds

3. **`GET /api/movies/[id]`**
   - Get movie details with cast and trailers
   - Cached: 60 seconds

### Caching Strategy

See [CACHING.md](./CACHING.md) for detailed caching documentation.

**Summary:**
- Configuration: 24 hours (rarely changes)
- Search results: 60 seconds (balance freshness/performance)
- Movie details: 60 seconds (popular movies benefit)
- Frontend pages: Match API cache durations

## 🧩 Key Design Decisions

### Server Components by Default
- Reduces client-side JavaScript
- Improves initial page load
- Better SEO

### Client Components Only When Needed
- Search input (controlled form state)
- Back button (browser history)

### Backend-for-Frontend (BFF)
- TMDB API key never exposed to client
- Normalized response format
- Rate limit handling
- Centralized error handling

### URL-Based State
- Search query and page in URL params
- Shareable URLs
- Browser back/forward works correctly

## 🔒 Security

- ✅ API keys stored server-side only
- ✅ Environment variables never exposed to client
- ✅ Input validation on all endpoints
- ✅ Rate limit detection and handling
- ✅ Proper error messages (no sensitive data leaked)

## 📊 Performance

- ✅ Server-Side Rendering for fast initial loads
- ✅ Image optimization with Next.js Image component
- ✅ Smart caching reduces API calls
- ✅ Minimal client-side JavaScript
- ✅ Code splitting and lazy loading

## 🧪 Test Coverage

- **Route Handler Tests:** 2 tests
  - Success case
  - Error handling (rate limits)

**Total:** 2 tests across 1 test files

## 📝 Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `TMDB_READ_ACCESS_TOKEN` | TMDB API Read Access Token | Yes | `eyJhbGc...` |
| `NEXT_PUBLIC_BASE_URL` | Base URL for API calls | No* | `https://your-app.vercel.app` |

*Defaults to `http://localhost:3000` in development

## 🐛 Troubleshooting

### Images not loading
- Check that `image.tmdb.org` is configured in `next.config.ts`
- Verify TMDB API token is valid

### API errors
- Ensure `TMDB_READ_ACCESS_TOKEN` is set correctly
- Check TMDB API status: https://status.themoviedb.org/

### Build failures
- Run `npm run typecheck` to check for TypeScript errors
- Run `npm run lint` to check for linting issues
- Ensure all environment variables are set

## 📚 Additional Documentation

- [Caching Strategy](./CACHING.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [TMDB API Documentation](https://developer.themoviedb.org/docs)

## 🤝 Contributing

This is a take-home assignment project. For production use, consider:
- Adding more comprehensive error boundaries
- Implementing user authentication
- Adding favorites/watchlist functionality
- Expanding test coverage
- Adding E2E tests with Playwright

## 📄 License

This project is for educational/demonstration purposes.

## 🙏 Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for the API
- [Next.js](https://nextjs.org/) team for the amazing framework
- [Vercel](https://vercel.com/) for hosting platform

---

**Built with ❤️ using Next.js 16**
