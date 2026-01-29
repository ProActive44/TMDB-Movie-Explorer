import Link from "next/link";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    query: string;
}

export function Pagination({ currentPage, totalPages, query }: PaginationProps) {
    // Limit total pages to 500 (TMDB API limit)
    const maxPages = Math.min(totalPages, 500);

    if (maxPages <= 1) {
        return null;
    }

    const createPageUrl = (page: number) => {
        return `/?q=${encodeURIComponent(query)}&page=${page}`;
    };

    // Calculate page range to show
    const getPageRange = () => {
        const delta = 2;
        const range: number[] = [];
        const rangeWithDots: (number | string)[] = [];

        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(maxPages - 1, currentPage + delta);
            i++
        ) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, "...");
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < maxPages - 1) {
            rangeWithDots.push("...", maxPages);
        } else if (maxPages > 1) {
            rangeWithDots.push(maxPages);
        }

        return rangeWithDots;
    };

    const pages = getPageRange();

    return (
        <nav className="flex items-center justify-center gap-2 mt-8">
            {/* Previous Button */}
            {currentPage > 1 ? (
                <Link
                    href={createPageUrl(currentPage - 1)}
                    className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    Previous
                </Link>
            ) : (
                <span className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-400 cursor-not-allowed">
                    Previous
                </span>
            )}

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
                {pages.map((page, index) => {
                    if (page === "...") {
                        return (
                            <span
                                key={`dots-${index}`}
                                className="px-3 py-2 text-zinc-500"
                            >
                                ...
                            </span>
                        );
                    }

                    const pageNum = page as number;
                    const isActive = pageNum === currentPage;

                    return (
                        <Link
                            key={pageNum}
                            href={createPageUrl(pageNum)}
                            className={`px-4 py-2 rounded-lg transition-colors ${isActive
                                    ? "bg-blue-600 text-white font-medium"
                                    : "border border-zinc-300 dark:border-zinc-700 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                }`}
                        >
                            {pageNum}
                        </Link>
                    );
                })}
            </div>

            {/* Next Button */}
            {currentPage < maxPages ? (
                <Link
                    href={createPageUrl(currentPage + 1)}
                    className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    Next
                </Link>
            ) : (
                <span className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-400 cursor-not-allowed">
                    Next
                </span>
            )}
        </nav>
    );
}
