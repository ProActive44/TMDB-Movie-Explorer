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

    describe('Success Cases', () => {
        it('should return normalized search results for valid query', async () => {
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

        it('should handle missing poster_path gracefully', async () => {
            const mockConfig = {
                images: {
                    secure_base_url: 'https://image.tmdb.org/',
                    poster_sizes: ['w500'],
                    backdrop_sizes: ['w1280'],
                    profile_sizes: ['w185'],
                },
            };

            const mockSearchResponse = {
                page: 1,
                total_pages: 1,
                total_results: 1,
                results: [
                    {
                        id: 456,
                        title: 'No Poster Movie',
                        release_date: '2024-01-01',
                        overview: 'Movie without poster',
                        poster_path: null,
                        vote_average: 7.0,
                        backdrop_path: null,
                        vote_count: 500,
                        popularity: 50,
                        adult: false,
                        genre_ids: [1],
                        original_language: 'en',
                        original_title: 'No Poster Movie',
                        video: false,
                    },
                ],
            };

            mockFetchTMDB
                .mockResolvedValueOnce(mockConfig)
                .mockResolvedValueOnce(mockSearchResponse);

            const request = new NextRequest(
                'http://localhost:3000/api/movies/search?q=test&page=1'
            );

            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.results[0].poster_url).toBe('');
        });
    });

    describe('Validation Failures', () => {
        it('should return 400 when query parameter is missing', async () => {
            const request = new NextRequest(
                'http://localhost:3000/api/movies/search?page=1'
            );

            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({
                error: 'Validation error',
                message: "Query parameter 'q' is required",
            });
            expect(mockFetchTMDB).not.toHaveBeenCalled();
        });

        it('should return 400 when query is too short', async () => {
            const request = new NextRequest(
                'http://localhost:3000/api/movies/search?q=a&page=1'
            );

            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({
                error: 'Validation error',
                message: 'Query must be at least 2 characters long',
            });
            expect(mockFetchTMDB).not.toHaveBeenCalled();
        });

        it('should return 400 when page is invalid', async () => {
            const request = new NextRequest(
                'http://localhost:3000/api/movies/search?q=batman&page=0'
            );

            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({
                error: 'Validation error',
                message: 'Page must be a positive integer',
            });
            expect(mockFetchTMDB).not.toHaveBeenCalled();
        });

        it('should trim whitespace from query', async () => {
            const mockConfig = {
                images: {
                    secure_base_url: 'https://image.tmdb.org/',
                    poster_sizes: ['w500'],
                    backdrop_sizes: ['w1280'],
                    profile_sizes: ['w185'],
                },
            };

            const mockSearchResponse = {
                page: 1,
                total_pages: 1,
                total_results: 0,
                results: [],
            };

            mockFetchTMDB
                .mockResolvedValueOnce(mockConfig)
                .mockResolvedValueOnce(mockSearchResponse);

            const request = new NextRequest(
                'http://localhost:3000/api/movies/search?q=%20%20batman%20%20&page=1'
            );

            const response = await GET(request);

            expect(response.status).toBe(200);
            expect(mockFetchTMDB).toHaveBeenNthCalledWith(
                2,
                '/search/movie?query=batman&page=1'
            );
        });
    });

    describe('Error Handling', () => {
        it('should handle rate limit errors (429)', async () => {
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

        it('should handle TMDB API errors', async () => {
            const mockConfig = {
                images: {
                    secure_base_url: 'https://image.tmdb.org/',
                    poster_sizes: ['w500'],
                    backdrop_sizes: ['w1280'],
                    profile_sizes: ['w185'],
                },
            };

            // Mock API error
            const apiError = new tmdb.TMDBError('Invalid API key', 401, false);

            mockFetchTMDB
                .mockResolvedValueOnce(mockConfig)
                .mockRejectedValueOnce(apiError);

            const request = new NextRequest(
                'http://localhost:3000/api/movies/search?q=batman&page=1'
            );

            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({
                error: 'TMDB API error',
                message: 'Invalid API key',
            });
        });

        it('should handle unexpected errors', async () => {
            const mockConfig = {
                images: {
                    secure_base_url: 'https://image.tmdb.org/',
                    poster_sizes: ['w500'],
                    backdrop_sizes: ['w1280'],
                    profile_sizes: ['w185'],
                },
            };

            // Mock unexpected error
            mockFetchTMDB
                .mockResolvedValueOnce(mockConfig)
                .mockRejectedValueOnce(new Error('Network error'));

            const request = new NextRequest(
                'http://localhost:3000/api/movies/search?q=batman&page=1'
            );

            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({
                error: 'Internal server error',
                message: 'Failed to search movies',
            });
        });
    });
});
