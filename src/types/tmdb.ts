/**
 * TMDB API Response Types
 */

// Configuration API Response
export interface TMDBConfigurationResponse {
    images: {
        base_url: string;
        secure_base_url: string;
        backdrop_sizes: string[];
        logo_sizes: string[];
        poster_sizes: string[];
        profile_sizes: string[];
        still_sizes: string[];
    };
    change_keys: string[];
}

// Search Movies API Response
export interface TMDBSearchMoviesResponse {
    page: number;
    results: TMDBMovieSearchResult[];
    total_pages: number;
    total_results: number;
}

export interface TMDBMovieSearchResult {
    id: number;
    title: string;
    release_date: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average: number;
    vote_count: number;
    popularity: number;
    adult: boolean;
    genre_ids: number[];
    original_language: string;
    original_title: string;
    video: boolean;
}

// Movie Details API Response
export interface TMDBMovieDetailsResponse {
    id: number;
    title: string;
    original_title: string;
    overview: string;
    release_date: string;
    runtime: number | null;
    vote_average: number;
    vote_count: number;
    popularity: number;
    poster_path: string | null;
    backdrop_path: string | null;
    adult: boolean;
    budget: number;
    revenue: number;
    status: string;
    tagline: string | null;
    genres: TMDBGenre[];
    production_companies: TMDBProductionCompany[];
    production_countries: TMDBProductionCountry[];
    spoken_languages: TMDBSpokenLanguage[];
    // append_to_response fields
    videos?: TMDBVideosResponse;
    credits?: TMDBCreditsResponse;
}

export interface TMDBGenre {
    id: number;
    name: string;
}

export interface TMDBProductionCompany {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
}

export interface TMDBProductionCountry {
    iso_3166_1: string;
    name: string;
}

export interface TMDBSpokenLanguage {
    iso_639_1: string;
    name: string;
    english_name: string;
}

// Videos (Trailers)
export interface TMDBVideosResponse {
    results: TMDBVideo[];
}

export interface TMDBVideo {
    id: string;
    iso_639_1: string;
    iso_3166_1: string;
    key: string;
    name: string;
    site: string;
    size: number;
    type: string;
    official: boolean;
    published_at: string;
}

// Credits (Cast & Crew)
export interface TMDBCreditsResponse {
    cast: TMDBCastMember[];
    crew: TMDBCrewMember[];
}

export interface TMDBCastMember {
    id: number;
    name: string;
    original_name: string;
    character: string;
    credit_id: string;
    order: number;
    profile_path: string | null;
    adult: boolean;
    gender: number | null;
    known_for_department: string;
    popularity: number;
    cast_id: number;
}

export interface TMDBCrewMember {
    id: number;
    name: string;
    original_name: string;
    job: string;
    department: string;
    credit_id: string;
    profile_path: string | null;
    adult: boolean;
    gender: number | null;
    known_for_department: string;
    popularity: number;
}
