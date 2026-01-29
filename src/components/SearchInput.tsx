"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, FormEvent } from "react";

export function SearchInput() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("q") || "");
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const trimmedQuery = query.trim();
        if (trimmedQuery.length < 2) {
            return;
        }

        startTransition(() => {
            router.push(`/?q=${encodeURIComponent(trimmedQuery)}&page=1`);
        });
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for movies..."
                    className="flex-1 px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isPending}
                    minLength={2}
                />
                <button
                    type="submit"
                    disabled={isPending || query.trim().length < 2}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-zinc-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isPending ? "Searching..." : "Search"}
                </button>
            </div>
            {query.trim().length > 0 && query.trim().length < 2 && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    Query must be at least 2 characters long
                </p>
            )}
        </form>
    );
}
