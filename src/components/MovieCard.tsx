import Link from "next/link";
import Image from "next/image";
import type { SearchMovieResult } from "@/types/api";

interface MovieCardProps {
    movie: SearchMovieResult;
}

export function MovieCard({ movie }: MovieCardProps) {
    const releaseYear = movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : "N/A";

    return (
        <Link
            href={`/movie/${movie.id}`}
            className="group block bg-white dark:bg-zinc-900 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-lg"
        >
            <div className="relative aspect-[2/3] bg-zinc-100 dark:bg-zinc-800">
                {movie.poster_url ? (
                    <Image
                        src={movie.poster_url}
                        alt={movie.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-zinc-400">
                        <svg
                            className="w-16 h-16"
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
            <div className="p-4">
                <h3 className="font-semibold text-black dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {movie.title}
                </h3>
                <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">{releaseYear}</span>
                    {movie.vote_average > 0 && (
                        <div className="flex items-center gap-1">
                            <svg
                                className="w-4 h-4 text-yellow-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                                {movie.vote_average.toFixed(1)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
