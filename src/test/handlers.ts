import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';

// Mock data
const mockAnalyzeResponse = {
    status: 'success',
    type: 'chapter' as const,
    metadata: {
        title: 'Chapter 1: The Beginning',
        nextChapterUrl: 'https://example.com/chapter-2',
    },
    rawText: 'This is the original Chinese text content that needs translation. It contains multiple paragraphs of story content.',
};

const mockTranslateResponse = {
    status: 'success',
    translatedText: 'Đây là nội dung văn bản gốc tiếng Trung cần dịch. Nó chứa nhiều đoạn văn của nội dung câu chuyện.',
    chunks: 1,
};

const mockErrorResponse = {
    status: 'error',
    error: 'Failed to analyze URL',
};

// API handlers
export const handlers = [
    // POST /api/analyze-url
    http.post('/api/analyze-url', async ({ request }) => {
        const body = await request.json() as { url: string };

        // Test different scenarios
        if (body.url.includes('error')) {
            return HttpResponse.json(mockErrorResponse, { status: 500 });
        }

        if (body.url.includes('empty')) {
            return HttpResponse.json({
                status: 'success',
                type: 'chapter' as const,
                metadata: {
                    title: 'Empty Chapter',
                    nextChapterUrl: null,
                },
                rawText: '',
            });
        }

        if (body.url.includes('no-next')) {
            return HttpResponse.json({
                status: 'success',
                type: 'chapter' as const,
                metadata: {
                    title: 'Last Chapter',
                    nextChapterUrl: null,
                },
                rawText: 'This is the last chapter content.',
            });
        }

        return HttpResponse.json(mockAnalyzeResponse);
    }),

    // POST /api/translate-stream
    http.post('/api/translate-stream', async ({ request }) => {
        const body = await request.json() as { textChunk: string; context?: string };

        // Test error scenarios
        if (body.textChunk.includes('error')) {
            return HttpResponse.json({
                status: 'error',
                error: 'Translation failed',
            }, { status: 500 });
        }

        // Test with context
        if (body.context) {
            return HttpResponse.json({
                ...mockTranslateResponse,
                contextUsed: true,
            });
        }

        return HttpResponse.json(mockTranslateResponse);
    }),

    // GET /api/health
    http.get('/api/health', () => {
        return HttpResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
    }),
];

// Create worker
export const worker = setupWorker(...handlers);
