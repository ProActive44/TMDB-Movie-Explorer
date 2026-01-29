/**
 * Test 1: Route Handler Tests
 * Tests /api/movies/search endpoint with success and failure cases
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '@/app/api/movies/search/route';
import { NextRequest } from 'next/server';
import * as tmdb from '@/lib/tmdb';

// Mock environment variables
vi.mock('@/lib/env', () => ({
    env: {
        TMDB_READ_ACCESS_TOKEN: 'test-token',
    },
}));

// Mock the fetchTMDB function
vi.mock('@/lib/tmdb', async () => {
    const actual = await vi.importActual('@/lib/tmdb');
    return {
        ...actual,
        fetchTMDB: vi.fn(),
    };
});

describe('/api/movies/search Route Handler', () => {
    const mockFetchTMDB = vi.mocked(tmdb.fetchTMDB);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns normalized results for valid query (success)', async () => {
        // Mock configuration response
        const mockConfig = {
            images: {
                secure_base_url: 'https://image.tmdb.org/',
                poster_sizes: ['w500'],
                backdrop_sizes: ['w1280'],
                profile_sizes: ['w185'],
            },
        };

        // Mock search response
        const mockSearchResponse = {
            page: 1,
            total_pages: 5,
            total_results: 100,
            results: [
                {
                    id: 123,
                    title: 'Test Movie',
                    release_date: '2024-01-01',
                    overview: 'A test movie',
                    poster_path: '/test-poster.jpg',
                    vote_average: 8.5,
                    backdrop_path: '/backdrop.jpg',
                    vote_count: 1000,
                    popularity: 100,
                    adult: false,
                    genre_ids: [1, 2],
                    original_language: 'en',
                    original_title: 'Test Movie',
                    video: false,
                },
            ],
        };

        // Setup mock to return different responses for different endpoints
        mockFetchTMDB
            .mockResolvedValueOnce(mockConfig) // First call for config
            .mockResolvedValueOnce(mockSearchResponse); // Second call for search

        // Create mock request
        const request = new NextRequest(
            'http://localhost:3000/api/movies/search?q=batman&page=1'
        );

        // Call the handler
        const response = await GET(request);
        const data = await response.json();

        // Assertions
        expect(response.status).toBe(200);
        expect(data).toEqual({
            page: 1,
            total_pages: 5,
            total_results: 100,
            results: [
                {
                    id: 123,
                    title: 'Test Movie',
                    release_date: '2024-01-01',
                    overview: 'A test movie',
                    poster_url: 'https://image.tmdb.org/w500/test-poster.jpg',
                    vote_average: 8.5,
                },
            ],
        });

        // Verify fetchTMDB was called correctly
        expect(mockFetchTMDB).toHaveBeenCalledTimes(2);
        expect(mockFetchTMDB).toHaveBeenNthCalledWith(1, '/configuration');
        expect(mockFetchTMDB).toHaveBeenNthCalledWith(
            2,
            '/search/movie?query=batman&page=1'
        );
    });

    it('returns 429 when TMDB rate limit is hit (failure)', async () => {
        const mockConfig = {
            images: {
                secure_base_url: 'https://image.tmdb.org/',
                poster_sizes: ['w500'],
                backdrop_sizes: ['w1280'],
                profile_sizes: ['w185'],
            },
        };

        // Mock rate limit error
        const rateLimitError = new tmdb.TMDBError(
            'TMDB API rate limit exceeded. Please try again later.',
            429,
            true
        );

        mockFetchTMDB
            .mockResolvedValueOnce(mockConfig)
            .mockRejectedValueOnce(rateLimitError);

        const request = new NextRequest(
            'http://localhost:3000/api/movies/search?q=batman&page=1'
        );

        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(429);
        expect(data).toEqual({
            error: 'Rate limit exceeded',
            message: 'TMDB API rate limit exceeded. Please try again later.',
        });
    });
});
