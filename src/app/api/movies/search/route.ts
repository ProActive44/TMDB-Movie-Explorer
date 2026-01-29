/**
 * GET /api/movies/search?q=<string>&page=<number>
 * 
 * Search for movies by title
 * Validates query parameters and returns normalized results
 * Cached for 60 seconds
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchTMDB, TMDBError } from "@/lib/tmdb";
import type { TMDBSearchMoviesResponse, TMDBConfigurationResponse } from "@/types/tmdb";
import type { SearchMoviesResponse } from "@/types/api";

export const revalidate = 60; // 60 seconds

/**
 * Validate and sanitize search query
 */
function validateSearchQuery(searchParams: URLSearchParams): {
    valid: boolean;
    error?: string;
    query?: string;
    page?: number;
} {
    // Get and trim query parameter
    const q = searchParams.get("q")?.trim();

    // Validate query exists
    if (!q) {
        return {
            valid: false,
            error: "Query parameter 'q' is required",
        };
    }

    // Validate minimum length
    if (q.length < 2) {
        return {
            valid: false,
            error: "Query must be at least 2 characters long",
        };
    }

    // Get and validate page parameter
    const pageParam = searchParams.get("page");
    const page = pageParam ? parseInt(pageParam, 10) : 1;

    if (isNaN(page) || page < 1) {
        return {
            valid: false,
            error: "Page must be a positive integer",
        };
    }

    return {
        valid: true,
        query: q,
        page,
    };
}

/**
 * Build poster URL from TMDB configuration and poster path
 */
function buildPosterUrl(
    posterPath: string | null,
    baseUrl: string
): string {
    if (!posterPath) {
        return ""; // Return empty string for missing posters
    }
    // Use w500 size for posters (good balance between quality and performance)
    return `${baseUrl}w500${posterPath}`;
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    // Validate query parameters
    const validation = validateSearchQuery(searchParams);
    if (!validation.valid) {
        return NextResponse.json(
            {
                error: "Validation error",
                message: validation.error,
            },
            { status: 400 }
        );
    }

    const { query, page } = validation;

    try {
        // Fetch configuration for image URLs (this will be cached for 24 hours)
        const config = await fetchTMDB<TMDBConfigurationResponse>("/configuration");
        const imageBaseUrl = config.images.secure_base_url;

        // Search for movies
        const searchResults = await fetchTMDB<TMDBSearchMoviesResponse>(
            `/search/movie?query=${encodeURIComponent(query!)}&page=${page}`
        );

        // Normalize response to match required contract
        const normalizedResponse: SearchMoviesResponse = {
            page: searchResults.page,
            total_pages: searchResults.total_pages,
            total_results: searchResults.total_results,
            results: searchResults.results.map((movie) => ({
                id: movie.id,
                title: movie.title,
                release_date: movie.release_date || "",
                overview: movie.overview || "",
                poster_url: buildPosterUrl(movie.poster_path, imageBaseUrl),
                vote_average: movie.vote_average,
            })),
        };

        return NextResponse.json(normalizedResponse);
    } catch (error) {
        // Handle rate limiting
        if (error instanceof TMDBError && error.isRateLimited) {
            return NextResponse.json(
                {
                    error: "Rate limit exceeded",
                    message: error.message,
                },
                { status: 429 }
            );
        }

        // Handle other TMDB errors
        if (error instanceof TMDBError) {
            return NextResponse.json(
                {
                    error: "TMDB API error",
                    message: error.message,
                },
                { status: error.statusCode || 500 }
            );
        }

        // Handle unexpected errors
        console.error("Unexpected error in /api/movies/search:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                message: "Failed to search movies",
            },
            { status: 500 }
        );
    }
}
