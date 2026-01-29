import { Suspense } from "react";
import { SearchInput } from "@/components/SearchInput";
import { MovieCard } from "@/components/MovieCard";
import { Pagination } from "@/components/Pagination";
import type { SearchMoviesResponse, ErrorResponse } from "@/types/api";

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

async function fetchMovies(
  query: string,
  page: number
): Promise<SearchMoviesResponse | ErrorResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const url = `${baseUrl}/api/movies/search?q=${encodeURIComponent(query)}&page=${page}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 60 }, // Match API cache duration
    });

    const data = await response.json();

    if (!response.ok) {
      return data as ErrorResponse;
    }

    return data as SearchMoviesResponse;
  } catch (error) {
    return {
      error: "Network error",
      message: "Failed to fetch movies. Please try again.",
    };
  }
}

function isErrorResponse(
  data: SearchMoviesResponse | ErrorResponse
): data is ErrorResponse {
  return "error" in data;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const page = parseInt(params.page || "1", 10);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
            TMDB Movie Explorer
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Search and discover movies from The Movie Database
          </p>
        </header>

        {/* Search Input */}
        <div className="mb-8">
          <Suspense fallback={<SearchInputSkeleton />}>
            <SearchInput />
          </Suspense>
        </div>

        {/* Content */}
        {!query ? (
          // Empty State - No Search Query
          <div className="text-center py-16">
            <svg
              className="w-24 h-24 mx-auto text-zinc-300 dark:text-zinc-700 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">
              Start Your Search
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Enter a movie title to discover films from TMDB
            </p>
          </div>
        ) : query.length < 2 ? (
          // Validation Error State
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-black dark:text-white mb-2">
              Query Too Short
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Please enter at least 2 characters to search
            </p>
          </div>
        ) : (
          <Suspense fallback={<LoadingState />}>
            <MovieResults query={query} page={page} />
          </Suspense>
        )}
      </div>
    </div>
  );
}

async function MovieResults({ query, page }: { query: string; page: number }) {
  const data = await fetchMovies(query, page);

  // Error State
  if (isErrorResponse(data)) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
          <svg
            className="w-8 h-8 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-black dark:text-white mb-2">
          {data.error}
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">{data.message}</p>
      </div>
    );
  }

  // Empty Results State
  if (data.results.length === 0) {
    return (
      <div className="text-center py-16">
        <svg
          className="w-24 h-24 mx-auto text-zinc-300 dark:text-zinc-700 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">
          No Results Found
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          No movies found for &quot;{query}&quot;. Try a different search term.
        </p>
      </div>
    );
  }

  // Success State - Display Results
  return (
    <div>
      <div className="mb-6">
        <p className="text-zinc-600 dark:text-zinc-400">
          Found <span className="font-semibold text-black dark:text-white">{data.total_results.toLocaleString()}</span> results for &quot;{query}&quot;
        </p>
      </div>

      {/* Movie Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {data.results.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={data.total_pages}
        query={query}
      />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="text-center py-16">
      <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-zinc-600 dark:text-zinc-400">Loading movies...</p>
    </div>
  );
}

function SearchInputSkeleton() {
  return (
    <div className="w-full max-w-2xl">
      <div className="flex gap-2">
        <div className="flex-1 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse"></div>
        <div className="w-24 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
}
