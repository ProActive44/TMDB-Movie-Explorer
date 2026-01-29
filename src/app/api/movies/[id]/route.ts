/**
 * GET /api/movies/[id]
 * 
 * Get detailed information about a specific movie
 * Includes: core details, genres, runtime, rating, top 5 cast, trailers, images
 * Cached for 60 seconds
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchTMDB, TMDBError } from "@/lib/tmdb";
import type {
    TMDBMovieDetailsResponse,
    TMDBConfigurationResponse,
    TMDBVideo
} from "@/types/tmdb";
import type { MovieDetailsResponse, CastMember, Trailer } from "@/types/api";

export const revalidate = 60; // 60 seconds

/**
 * Build image URL from TMDB configuration and image path
 */
function buildImageUrl(
    imagePath: string | null,
    baseUrl: string,
    size: string
): string {
    if (!imagePath) {
        return "";
    }
    return `${baseUrl}${size}${imagePath}`;
}

/**
 * Filter and format trailers (YouTube only)
 */
function formatTrailers(videos?: { results: TMDBVideo[] }): Trailer[] {
    if (!videos || !videos.results) {
        return [];
    }

    return videos.results
        .filter((video) => video.site === "YouTube" && video.type === "Trailer")
        .map((video) => ({
            id: video.id,
            key: video.key,
            name: video.name,
            site: video.site,
            type: video.type,
        }));
}

/**
 * Format top 5 cast members
 */
function formatCast(
    credits: TMDBMovieDetailsResponse["credits"],
    imageBaseUrl: string
): CastMember[] {
    if (!credits || !credits.cast) {
        return [];
    }

    return credits.cast
        .slice(0, 5) // Top 5 cast members
        .map((member) => ({
            id: member.id,
            name: member.name,
            character: member.character,
            profile_url: buildImageUrl(member.profile_path, imageBaseUrl, "w185"),
            order: member.order,
        }));
}

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function GET(
    request: NextRequest,
    context: RouteContext
) {
    const { id } = await context.params;

    // Validate ID is a number
    const movieId = parseInt(id, 10);
    if (isNaN(movieId) || movieId <= 0) {
        return NextResponse.json(
            {
                error: "Validation error",
                message: "Invalid movie ID. Must be a positive integer.",
            },
            { status: 400 }
        );
    }

    try {
        // Fetch configuration for image URLs (this will be cached for 24 hours)
        const config = await fetchTMDB<TMDBConfigurationResponse>("/configuration");
        const imageBaseUrl = config.images.secure_base_url;

        // Fetch movie details with credits and videos
        const movieDetails = await fetchTMDB<TMDBMovieDetailsResponse>(
            `/movie/${movieId}?append_to_response=videos,credits`
        );

        // Normalize response to match required contract
        const normalizedResponse: MovieDetailsResponse = {
            id: movieDetails.id,
            title: movieDetails.title,
            original_title: movieDetails.original_title,
            release_date: movieDetails.release_date || "",
            overview: movieDetails.overview || "",
            runtime: movieDetails.runtime,
            vote_average: movieDetails.vote_average,
            vote_count: movieDetails.vote_count,
            poster_url: buildImageUrl(
                movieDetails.poster_path,
                imageBaseUrl,
                "w500"
            ),
            backdrop_url: buildImageUrl(
                movieDetails.backdrop_path,
                imageBaseUrl,
                "w1280"
            ),
            genres: movieDetails.genres.map((genre) => ({
                id: genre.id,
                name: genre.name,
            })),
            cast: formatCast(movieDetails.credits, imageBaseUrl),
            trailers: formatTrailers(movieDetails.videos),
            tagline: movieDetails.tagline,
            status: movieDetails.status,
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

        // Handle 404 (movie not found)
        if (error instanceof TMDBError && error.statusCode === 404) {
            return NextResponse.json(
                {
                    error: "Not found",
                    message: `Movie with ID ${movieId} not found.`,
                },
                { status: 404 }
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
        console.error(`Unexpected error in /api/movies/${movieId}:`, error);
        return NextResponse.json(
            {
                error: "Internal server error",
                message: "Failed to fetch movie details",
            },
            { status: 500 }
        );
    }
}
