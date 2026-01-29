"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-6"
        >
            <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
            </svg>
            Back
        </button>
    );
}
