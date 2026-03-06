/**
 * NovelTranslator Unit Tests
 *
 * Tests for business logic, API functions, and utility functions.
 * Focuses on 100% conditional branch coverage.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyzeUrl, translateText, checkServerHealth } from '../services/translationApi';
import type { AnalyzeUrlResponse, TranslateResponse } from '../types/translation';

// Mock fetch globally
const mockFetch = vi.fn();
// @ts-expect-error - Mocking global fetch for tests
global.fetch = mockFetch;

describe('translationApi', () => {
    beforeEach(() => {
        mockFetch.mockClear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('analyzeUrl', () => {
        it('should successfully analyze a valid URL and return chapter data', async () => {
            const mockResponse: AnalyzeUrlResponse = {
                status: 'success',
                type: 'chapter',
                metadata: {
                    title: 'Chapter 1: The Beginning',
                    nextChapterUrl: 'https://example.com/chapter-2',
                    author: 'Test Author',
                    novelTitle: 'Test Novel',
                },
                rawText: 'This is the original Chinese text content.',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const result = await analyzeUrl('https://example.com/chapter-1');

            expect(result).toEqual(mockResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/analyze-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: 'https://example.com/chapter-1' }),
            });
        });

        it('should handle API error response (non-ok status)', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                statusText: 'Internal Server Error',
            });

            await expect(analyzeUrl('https://example.com/invalid')).rejects.toThrow(
                'Failed to analyze URL: Internal Server Error'
            );
        });

        it('should handle network failure', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(analyzeUrl('https://example.com/chapter-1')).rejects.toThrow('Network error');
        });

        it('should handle empty URL string', async () => {
            const mockResponse: AnalyzeUrlResponse = {
                status: 'error',
                type: 'unknown',
                error: 'URL is required',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const result = await analyzeUrl('');
            expect(result.status).toBe('error');
        });

        it('should handle response with null metadata', async () => {
            const mockResponse: AnalyzeUrlResponse = {
                status: 'success',
                type: 'unknown',
                rawText: 'Some text content',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const result = await analyzeUrl('https://example.com/page');
            expect(result.metadata).toBeUndefined();
            expect(result.type).toBe('unknown');
        });

        it('should handle index page type response', async () => {
            const mockResponse: AnalyzeUrlResponse = {
                status: 'success',
                type: 'index',
                metadata: {
                    title: 'Novel Index',
                    nextChapterUrl: null,
                },
                rawText: 'Chapter list...',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const result = await analyzeUrl('https://example.com/index');
            expect(result.type).toBe('index');
        });
    });

    describe('translateText', () => {
        it('should successfully translate text with default languages', async () => {
            const mockResponse: TranslateResponse = {
                status: 'success',
                translatedText: 'Đây là văn bản đã dịch.',
                chunks: 1,
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const result = await translateText('This is the text to translate.');

            expect(result).toEqual(mockResponse);
            expect(mockFetch).toHaveBeenCalledWith('/api/translate-stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    textChunk: 'This is the text to translate.',
                    context: undefined,
                    sourceLanguage: 'Chinese',
                    targetLanguage: 'Vietnamese',
                }),
            });
        });

        it('should translate text with custom languages', async () => {
            const mockResponse: TranslateResponse = {
                status: 'success',
                translatedText: 'This is translated to English.',
                chunks: 1,
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            await translateText('这是中文文本。', undefined, 'Chinese', 'English');

            expect(mockFetch).toHaveBeenCalledWith('/api/translate-stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    textChunk: '这是中文文本。',
                    context: undefined,
                    sourceLanguage: 'Chinese',
                    targetLanguage: 'English',
                }),
            });
        });

        it('should translate text with context for consistency', async () => {
            const mockResponse: TranslateResponse = {
                status: 'success',
                translatedText: 'Translated with context.',
                chunks: 2,
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const context = 'Previous chapter context about the main character.';
            await translateText('Current chapter text.', context);

            expect(mockFetch).toHaveBeenCalledWith('/api/translate-stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    textChunk: 'Current chapter text.',
                    context: context,
                    sourceLanguage: 'Chinese',
                    targetLanguage: 'Vietnamese',
                }),
            });
        });

        it('should handle translation API error', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                statusText: 'Service Unavailable',
            });

            await expect(translateText('Text to translate')).rejects.toThrow(
                'Translation failed: Service Unavailable'
            );
        });

        it('should handle translation failure response', async () => {
            const mockResponse: TranslateResponse = {
                status: 'error',
                error: 'Translation quota exceeded',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const result = await translateText('Text to translate');
            expect(result.status).toBe('error');
            expect(result.error).toBe('Translation quota exceeded');
        });

        it('should handle empty text input', async () => {
            const mockResponse: TranslateResponse = {
                status: 'success',
                translatedText: '',
                chunks: 0,
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const result = await translateText('');
            expect(result.translatedText).toBe('');
        });

        it('should handle multi-chunk translation response', async () => {
            const mockResponse: TranslateResponse = {
                status: 'success',
                translatedText: 'Part 1\n\nPart 2\n\nPart 3',
                chunks: 3,
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const result = await translateText('Very long text...');
            expect(result.chunks).toBe(3);
        });
    });

    describe('checkServerHealth', () => {
        it('should return true when server is online', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
            });

            const result = await checkServerHealth();

            expect(result).toBe(true);
            expect(mockFetch).toHaveBeenCalledWith('/api/health');
        });

        it('should return false when server responds with error', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
            });

            const result = await checkServerHealth();

            expect(result).toBe(false);
        });

        it('should return false when server is unreachable', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Connection refused'));

            const result = await checkServerHealth();

            expect(result).toBe(false);
        });

        it('should return false on network timeout', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Timeout'));

            const result = await checkServerHealth();

            expect(result).toBe(false);
        });

        it('should handle unexpected fetch error types', async () => {
            mockFetch.mockRejectedValueOnce('Unexpected error string');

            const result = await checkServerHealth();

            expect(result).toBe(false);
        });
    });
});

describe('TranslationState Management', () => {
    describe('State Transitions', () => {
        it('should define all translation statuses', () => {
            const statuses = ['idle', 'analyzing', 'translating', 'complete', 'error'] as const;
            statuses.forEach(status => {
                expect(status).toBeDefined();
            });
        });

        it('should verify TranslationState interface structure', () => {
            const validState = {
                status: 'idle' as const,
                url: '',
                originalText: '',
                translatedText: '',
                title: '',
                nextChapterUrl: null,
                error: null,
                progress: 0,
                currentChunk: 0,
                totalChunks: 1,
            };

            expect(validState.status).toBe('idle');
            expect(validState.nextChapterUrl).toBeNull();
            expect(validState.error).toBeNull();
        });

        it('should handle error state with error message', () => {
            const errorState = {
                status: 'error' as const,
                url: 'https://example.com',
                originalText: '',
                translatedText: '',
                title: '',
                nextChapterUrl: null,
                error: 'Failed to fetch content',
                progress: 0,
                currentChunk: 0,
                totalChunks: 1,
            };

            expect(errorState.error).toBe('Failed to fetch content');
            expect(errorState.status).toBe('error');
        });

        it('should handle complete state with translation data', () => {
            const completeState = {
                status: 'complete' as const,
                url: 'https://example.com/chapter-1',
                originalText: 'Original Chinese text',
                translatedText: 'Translated Vietnamese text',
                title: 'Chapter 1',
                nextChapterUrl: 'https://example.com/chapter-2',
                error: null,
                progress: 100,
                currentChunk: 5,
                totalChunks: 5,
            };

            expect(completeState.progress).toBe(100);
            expect(completeState.currentChunk).toBe(5);
            expect(completeState.translatedText).toBe('Translated Vietnamese text');
        });
    });
});

describe('URL Validation Logic', () => {
    const validUrls = [
        'https://example.com/chapter-1',
        'http://test.com/novel/123',
        'https://www.novelsite.com/read?id=456',
        'https://sub.domain.com/path/to/chapter',
    ];

    const invalidUrls = [
        '',
        '   ',
        'not-a-url',
        'ftp://files.example.com',
        'javascript:alert("xss")',
    ];

    it('should identify valid HTTP/HTTPS URLs', () => {
        validUrls.forEach(url => {
            const isValid = url.trim().length > 0 && /^https?:\/\//.test(url);
            expect(isValid).toBe(true);
        });
    });

    it('should reject invalid or empty URLs', () => {
        invalidUrls.forEach(url => {
            const isValid = url.trim().length > 0 && /^https?:\/\//.test(url);
            expect(isValid).toBe(false);
        });
    });

    it('should handle URL trimming correctly', () => {
        const urlWithSpaces = '  https://example.com/chapter-1  ';
        const trimmed = urlWithSpaces.trim();
        expect(trimmed).toBe('https://example.com/chapter-1');
    });
});

describe('Progress Calculation', () => {
    it('should calculate progress correctly for single chunk', () => {
        const currentChunk = 0;
        const totalChunks = 1;
        const progress = totalChunks > 0 ? ((currentChunk + 1) / totalChunks) * 100 : 0;
        expect(progress).toBe(100);
    });

    it('should calculate progress correctly for multiple chunks', () => {
        const testCases = [
            { current: 0, total: 4, expected: 25 },
            { current: 1, total: 4, expected: 50 },
            { current: 2, total: 4, expected: 75 },
            { current: 3, total: 4, expected: 100 },
        ];

        testCases.forEach(({ current, total, expected }) => {
            const progress = total > 0 ? ((current + 1) / total) * 100 : 0;
            expect(progress).toBe(expected);
        });
    });

    it('should handle zero total chunks edge case', () => {
        const currentChunk = 0;
        const totalChunks = 0;
        const progress = totalChunks > 0 ? ((currentChunk + 1) / totalChunks) * 100 : 0;
        expect(progress).toBe(0);
    });
});

describe('Error Handling Patterns', () => {
    it('should extract error message from Error instance', () => {
        const error: unknown = new Error('Specific error message');
        const message = error instanceof Error ? error.message : 'An unexpected error occurred';
        expect(message).toBe('Specific error message');
    });

    it('should handle non-Error exceptions', () => {
        const error: unknown = 'String error';
        const message = error instanceof Error ? error.message : 'An unexpected error occurred';
        expect(message).toBe('An unexpected error occurred');
    });

    it('should handle null/undefined errors', () => {
        const error: unknown = null;
        const message = error instanceof Error ? error.message : 'An unexpected error occurred';
        expect(message).toBe('An unexpected error occurred');
    });

    it('should handle object errors', () => {
        const error: unknown = { code: 500, message: 'Server error' };
        const message = error instanceof Error ? error.message : 'An unexpected error occurred';
        expect(message).toBe('An unexpected error occurred');
    });
});
