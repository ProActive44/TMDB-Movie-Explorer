/**
 * TMDB API Client (Server-side only)
 * This module should NEVER be imported in client components
 */

import { env } from "./env";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export class TMDBError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public isRateLimited: boolean = false
    ) {
        super(message);
        this.name = "TMDBError";
    }
}

/**
 * Fetch data from TMDB API with proper authentication
 */
export async function fetchTMDB<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const url = `${TMDB_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                Authorization: `Bearer ${env.TMDB_READ_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
                ...options?.headers,
            },
        });

        // Handle rate limiting (429)
        if (response.status === 429) {
            throw new TMDBError(
                "TMDB API rate limit exceeded. Please try again later.",
                429,
                true
            );
        }

        // Handle other HTTP errors
        if (!response.ok) {
            const errorText = await response.text().catch(() => "Unknown error");
            throw new TMDBError(
                `TMDB API error: ${response.statusText} - ${errorText}`,
                response.status,
                false
            );
        }

        return await response.json();
    } catch (error) {
        // Re-throw TMDBError as-is
        if (error instanceof TMDBError) {
            throw error;
        }

        // Wrap other errors
        throw new TMDBError(
            `Failed to fetch from TMDB: ${error instanceof Error ? error.message : "Unknown error"}`,
            undefined,
            false
        );
    }
}
