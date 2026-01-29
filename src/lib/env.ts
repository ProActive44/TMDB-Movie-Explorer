/**
 * Server-side environment variables
 * This file should NEVER be imported in client components
 */

function getEnvVar(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

export const env = {
    TMDB_READ_ACCESS_TOKEN: getEnvVar("TMDB_READ_ACCESS_TOKEN"),
} as const;
