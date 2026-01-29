/**
 * GET /api/config
 * 
 * Returns TMDB configuration data (primarily image configuration)
 * Cached aggressively (24 hours) since this data rarely changes
 */

import { NextResponse } from "next/server";
import { fetchTMDB, TMDBError } from "@/lib/tmdb";
import type { TMDBConfigurationResponse } from "@/types/tmdb";

export const revalidate = 86400; // 24 hours in seconds

export async function GET() {
    try {
        const config = await fetchTMDB<TMDBConfigurationResponse>("/configuration");

        return NextResponse.json({
            images: {
                base_url: config.images.secure_base_url,
                poster_sizes: config.images.poster_sizes,
                backdrop_sizes: config.images.backdrop_sizes,
                profile_sizes: config.images.profile_sizes,
            },
        });
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
        console.error("Unexpected error in /api/config:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                message: "Failed to fetch configuration",
            },
            { status: 500 }
        );
    }
}
