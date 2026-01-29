/**
 * Normalized API Response Types
 * These match the BFF contract defined in the assignment
 */

// Search Movies Response (Normalized)
export interface SearchMoviesResponse {
    page: number;
    total_pages: number;
    total_results: number;
    results: SearchMovieResult[];
}

export interface SearchMovieResult {
    id: number;
    title: string;
    release_date: string;
    overview: string;
    poster_url: string;
    vote_average: number;
}

// Movie Details Response (Normalized) - to be implemented in Step 4
export interface MovieDetailsResponse {
    id: number;
    title: string;
    original_title: string;
    release_date: string;
    overview: string;
    runtime: number | null;
    vote_average: number;
    vote_count: number;
    poster_url: string;
    backdrop_url: string;
    genres: Genre[];
    cast: CastMember[];
    trailers: Trailer[];
    tagline: string | null;
    status: string;
}

export interface Genre {
    id: number;
    name: string;
}

export interface CastMember {
    id: number;
    name: string;
    character: string;
    profile_url: string;
    order: number;
}

export interface Trailer {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
}

// Configuration Response (Normalized)
export interface ConfigResponse {
    images: {
        base_url: string;
        poster_sizes: string[];
        backdrop_sizes: string[];
        profile_sizes: string[];
    };
}

// Error Response
export interface ErrorResponse {
    error: string;
    message: string;
}
