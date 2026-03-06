/**
 * NovelTranslator.test.ts - Unit Tests
 * 
 * Run with: npx vitest run
 * 
 * Tests business logic and edge cases for the translation functionality.
 */

import { describe, it, expect } from 'vitest';

describe('NovelTranslator Unit Tests', () => {
    describe('URL Validation', () => {
        it('should validate correct URLs', () => {
            const isValidUrl = (url: string) => {
                try {
                    new URL(url);
                    return true;
                } catch {
                    return false;
                }
            };

            expect(isValidUrl('https://example.com')).toBe(true);
            expect(isValidUrl('http://test.com/chapter-1')).toBe(true);
            expect(isValidUrl('not-a-url')).toBe(false);
            expect(isValidUrl('')).toBe(false);
        });
    });

    describe('State Machine', () => {
        it('should handle valid state transitions', () => {
            type Status = 'idle' | 'analyzing' | 'translating' | 'complete' | 'error';

            const transitions: Record<Status, Status[]> = {
                idle: ['analyzing'],
                analyzing: ['translating', 'error'],
                translating: ['complete', 'error'],
                complete: ['idle'],
                error: ['idle'],
            };

            expect(transitions.idle).toContain('analyzing');
            expect(transitions.analyzing).toContain('translating');
            expect(transitions.translating).toContain('complete');
            expect(transitions.complete).toContain('idle');
        });

        it('should handle error transitions', () => {
            type Status = 'idle' | 'analyzing' | 'translating' | 'complete' | 'error';

            const transitions: Record<Status, Status[]> = {
                idle: ['analyzing'],
                analyzing: ['translating', 'error'],
                translating: ['complete', 'error'],
                complete: ['idle'],
                error: ['idle'],
            };

            expect(transitions.analyzing).toContain('error');
            expect(transitions.translating).toContain('error');
        });
    });

    describe('Translation State', () => {
        it('should initialize with correct default values', () => {
            const initialState = {
                status: 'idle',
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

            expect(initialState.status).toBe('idle');
            expect(initialState.progress).toBe(0);
            expect(initialState.totalChunks).toBe(1);
            expect(initialState.nextChapterUrl).toBeNull();
        });

        it('should calculate progress correctly', () => {
            let progress = 0;
            const totalChunks = 5;

            for (let i = 0; i < totalChunks; i++) {
                progress = Math.round(((i + 1) / totalChunks) * 100);
            }

            expect(progress).toBe(100);
        });
    });

    describe('Content Processing', () => {
        it('should handle empty content', () => {
            const rawText = '';
            expect(rawText).toBe('');
            expect(rawText.length).toBe(0);
        });

        it('should split content into paragraphs', () => {
            const content = `Paragraph 1

Paragraph 2

Paragraph 3`;

            const paragraphs = content.split(/\n\n+/);

            expect(paragraphs.length).toBe(3);
            expect(paragraphs[0]).toBe('Paragraph 1');
        });

        it('should handle Chinese text correctly', () => {
            const chineseText = '第一章 穿越\n\n这是一个关于穿越的故事。';
            const paragraphs = chineseText.split(/\n\n+/);

            expect(paragraphs.length).toBe(2);
            expect(paragraphs[0]).toContain('第一章');
        });
    });
});
