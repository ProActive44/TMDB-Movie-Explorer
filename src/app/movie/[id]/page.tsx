import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import type { MovieDetailsResponse, ErrorResponse } from "@/types/api";
import { BackButton } from "@/components/BackButton";

interface PageProps {
    params: Promise<{ id: string }>;
}

async function fetchMovieDetails(
    id: string
): Promise<MovieDetailsResponse | ErrorResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const url = `${baseUrl}/api/movies/${id}`;

    try {
        const response = await fetch(url, {
            next: { revalidate: 60 }, // Match API cache duration
        });

        const data = await response.json();

        if (!response.ok) {
            return data as ErrorResponse;
        }

        return data as MovieDetailsResponse;
    } catch (error) {
        return {
            error: "Network error",
            message: "Failed to fetch movie details. Please try again.",
        };
    }
}

function isErrorResponse(
    data: MovieDetailsResponse | ErrorResponse
): data is ErrorResponse {
    return "error" in data;
}

// Generate metadata for SEO
export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { id } = await params;
    const data = await fetchMovieDetails(id);

    if (isErrorResponse(data)) {
        return {
            title: "Movie Not Found - TMDB Movie Explorer",
            description: "The requested movie could not be found.",
        };
    }

    return {
        title: `${data.title} (${data.release_date ? new Date(data.release_date).getFullYear() : "N/A"}) - TMDB Movie Explorer`,
        description: data.overview || `Details about ${data.title}`,
    };
}

export default async function MovieDetailPage({ params }: PageProps) {
    const { id } = await params;
    const data = await fetchMovieDetails(id);

    // Handle 404 - Movie not found
    if (isErrorResponse(data)) {
        if (data.error === "Not found") {
            notFound();
        }

        // Other errors
        return (
            <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
                <div className="text-center">
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
                    <h1 className="text-2xl font-bold text-black dark:text-white mb-2">
                        {data.error}
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                        {data.message}
                    </p>
                    <Link
                        href="/"
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Back to Search
                    </Link>
                </div>
            </div>
        );
    }

    const movie = data;
    const releaseYear = movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : "N/A";
    const runtime = movie.runtime
        ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
        : "N/A";

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            {/* Backdrop */}
            {movie.backdrop_url && (
                <div className="relative w-full h-[50vh] md:h-[60vh]">
                    <Image
                        src={movie.backdrop_url}
                        alt={movie.title}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-white/50 dark:via-black/50 to-transparent" />
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 py-8 -mt-32 relative z-10">
                {/* Back Button */}
                <BackButton />

                {/* Main Content */}
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Poster */}
                    <div className="flex-shrink-0">
                        <div className="relative w-full md:w-80 aspect-[2/3] bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden shadow-xl">
                            {movie.poster_url ? (
                                <Image
                                    src={movie.poster_url}
                                    alt={movie.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-zinc-400">
                                    <svg
                                        className="w-24 h-24"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                                        />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                        <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-2">
                            {movie.title}
                        </h1>

                        {movie.original_title !== movie.title && (
                            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-4">
                                {movie.original_title}
                            </p>
                        )}

                        {movie.tagline && (
                            <p className="text-xl italic text-zinc-700 dark:text-zinc-300 mb-6">
                                &quot;{movie.tagline}&quot;
                            </p>
                        )}

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            <div className="flex items-center gap-2">
                                <svg
                                    className="w-5 h-5 text-yellow-500"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-lg font-semibold text-black dark:text-white">
                                    {movie.vote_average.toFixed(1)}
                                </span>
                                <span className="text-zinc-600 dark:text-zinc-400">
                                    ({movie.vote_count.toLocaleString()} votes)
                                </span>
                            </div>

                            <span className="text-zinc-600 dark:text-zinc-400">•</span>
                            <span className="text-zinc-700 dark:text-zinc-300">
                                {releaseYear}
                            </span>

                            <span className="text-zinc-600 dark:text-zinc-400">•</span>
                            <span className="text-zinc-700 dark:text-zinc-300">
                                {runtime}
                            </span>

                            <span className="text-zinc-600 dark:text-zinc-400">•</span>
                            <span className="text-zinc-700 dark:text-zinc-300">
                                {movie.status}
                            </span>
                        </div>

                        {/* Genres */}
                        {movie.genres.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {movie.genres.map((genre) => (
                                    <span
                                        key={genre.id}
                                        className="px-3 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-full text-sm font-medium"
                                    >
                                        {genre.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Overview */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-black dark:text-white mb-3">
                                Overview
                            </h2>
                            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                {movie.overview || "No overview available."}
                            </p>
                        </div>

                        {/* Cast */}
                        {movie.cast.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
                                    Top Cast
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                    {movie.cast.map((member) => (
                                        <div key={member.id} className="text-center">
                                            <div className="relative w-full aspect-[2/3] bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden mb-2">
                                                {member.profile_url ? (
                                                    <Image
                                                        src={member.profile_url}
                                                        alt={member.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 50vw, 20vw"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-zinc-400">
                                                        <svg
                                                            className="w-12 h-12"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="font-semibold text-black dark:text-white text-sm line-clamp-2">
                                                {member.name}
                                            </p>
                                            <p className="text-zinc-600 dark:text-zinc-400 text-xs line-clamp-2">
                                                {member.character}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Trailers */}
                        {movie.trailers.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
                                    Trailers
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {movie.trailers.map((trailer) => (
                                        <div key={trailer.id}>
                                            <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
                                                <iframe
                                                    src={`https://www.youtube.com/embed/${trailer.key}`}
                                                    title={trailer.name}
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    className="absolute inset-0 w-full h-full"
                                                />
                                            </div>
                                            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                                                {trailer.name}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
