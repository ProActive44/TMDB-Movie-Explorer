import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-black dark:text-white mb-4">
                    404
                </h1>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">
                    Movie Not Found
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 mb-8">
                    The movie you&apos;re looking for doesn&apos;t exist or has been removed.
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
