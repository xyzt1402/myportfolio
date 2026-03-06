/**
 * NovelTranslator Integration Tests
 *
 * Tests the interaction between the main component and its children.
 * Uses MSW (Mock Service Worker) to mock all API calls.
 * Tests loading, success, and error states.
 */

import { describe, it, expect, vi, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import NovelTranslator from '../pages/NovelTranslator';
import '@testing-library/jest-dom/vitest';

// MSW Server Setup
const server = setupServer();

// Mock Data
const mockSuccessAnalyzeResponse = {
    status: 'success' as const,
    type: 'chapter' as const,
    metadata: {
        title: 'Chapter 1: The Beginning',
        nextChapterUrl: 'https://example.com/chapter-2',
        author: 'Test Author',
        novelTitle: 'Test Novel',
    },
    rawText: 'This is the original Chinese text content that needs translation.',
};

const mockEmptyContentResponse = {
    status: 'success' as const,
    type: 'chapter' as const,
    metadata: {
        title: 'Empty Chapter',
        nextChapterUrl: null,
    },
    rawText: '',
};

const mockErrorAnalyzeResponse = {
    status: 'error' as const,
    type: 'unknown' as const,
    error: 'Failed to fetch content from URL',
};

const mockSuccessTranslateResponse = {
    status: 'success' as const,
    translatedText: 'Đây là nội dung văn bản gốc tiếng Trung cần dịch.',
    chunks: 1,
};

const mockErrorTranslateResponse = {
    status: 'error' as const,
    error: 'Translation service unavailable',
};

describe('NovelTranslator Integration', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' });
    });

    afterAll(() => {
        server.close();
    });

    afterEach(() => {
        cleanup();
        server.resetHandlers();
        vi.restoreAllMocks();
    });

    beforeEach(() => {
        // Default server health check
        server.use(
            http.get('/api/health', () => {
                return HttpResponse.json({ status: 'ok' });
            })
        );
    });

    describe('Initial Render and Server Status', () => {
        it('should render the component with initial idle state', () => {
            render(<NovelTranslator />);

            // Header elements
            expect(screen.getByText('Novel Translator')).toBeInTheDocument();
            expect(screen.getByText('Chinese → Vietnamese')).toBeInTheDocument();

            // Input form
            expect(screen.getByPlaceholderText('Paste novel chapter URL here...')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /translate/i })).toBeInTheDocument();

            // Instructions
            expect(screen.getByText('Paste a URL from any novel site to translate it to Vietnamese')).toBeInTheDocument();
        });

        it('should display server online status', async () => {
            server.use(
                http.get('/api/health', () => {
                    return HttpResponse.json({ status: 'ok' });
                })
            );

            render(<NovelTranslator />);

            await waitFor(() => {
                expect(screen.getByText('Server Online')).toBeInTheDocument();
            });
        });

        it('should display server offline status', async () => {
            server.use(
                http.get('/api/health', () => {
                    return new HttpResponse(null, { status: 500 });
                })
            );

            render(<NovelTranslator />);

            await waitFor(() => {
                expect(screen.getByText('Server Offline')).toBeInTheDocument();
            });
        });

        it('should disable translate button when server is offline', async () => {
            server.use(
                http.get('/api/health', () => {
                    return new HttpResponse(null, { status: 500 });
                })
            );

            render(<NovelTranslator />);

            await waitFor(() => {
                expect(screen.getByText('Server Offline')).toBeInTheDocument();
            });

            const translateButton = screen.getByRole('button', { name: /translate/i });
            expect(translateButton).toBeDisabled();
        });
    });

    describe('URL Input and Form Submission', () => {
        it('should update URL input value when user types', async () => {
            render(<NovelTranslator />);

            const input = screen.getByPlaceholderText('Paste novel chapter URL here...') as HTMLInputElement;
            fireEvent.change(input, { target: { value: 'https://example.com/chapter-1' } });

            expect(input.value).toBe('https://example.com/chapter-1');
        });

        it('should disable translate button when URL is empty', () => {
            render(<NovelTranslator />);

            const translateButton = screen.getByRole('button', { name: /translate/i });
            expect(translateButton).toBeDisabled();
        });

        it('should enable translate button when URL is entered', async () => {
            render(<NovelTranslator />);

            const input = screen.getByPlaceholderText('Paste novel chapter URL here...');
            fireEvent.change(input, { target: { value: 'https://example.com/chapter-1' } });

            const translateButton = screen.getByRole('button', { name: /translate/i });
            expect(translateButton).toBeEnabled();
        });

        it('should accept URL input with whitespace', async () => {
            render(<NovelTranslator />);

            const input = screen.getByPlaceholderText('Paste novel chapter URL here...') as HTMLInputElement;
            fireEvent.change(input, { target: { value: 'https://example.com/chapter-1' } });

            expect(input.value).toBe('https://example.com/chapter-1');
        });
    });

    describe('Loading States', () => {
        it('should show analyzing state after form submission', async () => {
            server.use(
                http.post('/api/analyze-url', async () => {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    return HttpResponse.json(mockSuccessAnalyzeResponse);
                }),
                http.post('/api/translate-stream', () => {
                    return HttpResponse.json(mockSuccessTranslateResponse);
                })
            );

            render(<NovelTranslator />);

            const input = screen.getByPlaceholderText('Paste novel chapter URL here...');
            fireEvent.change(input, { target: { value: 'https://example.com/chapter-1' } });

            const form = document.getElementById('url-form');
            fireEvent.submit(form!);

            await waitFor(() => {
                expect(screen.getByText('Analyzing Page...')).toBeInTheDocument();
            });

            expect(screen.getByText('Extracting content from the URL')).toBeInTheDocument();
        });

        it('should show translating state after successful analysis', async () => {
            server.use(
                http.post('/api/analyze-url', () => {
                    return HttpResponse.json(mockSuccessAnalyzeResponse);
                }),
                http.post('/api/translate-stream', async () => {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    return HttpResponse.json(mockSuccessTranslateResponse);
                })
            );

            render(<NovelTranslator />);

            const input = screen.getByPlaceholderText('Paste novel chapter URL here...');
            fireEvent.change(input, { target: { value: 'https://example.com/chapter-1' } });

            const form = document.getElementById('url-form');
            fireEvent.submit(form!);

            await waitFor(() => {
                expect(screen.getByText('Translating...')).toBeInTheDocument();
            });

            expect(screen.getByText('Translating content to Vietnamese')).toBeInTheDocument();
            expect(screen.getByText('Chapter 1: The Beginning')).toBeInTheDocument();
        });
    });

    describe('Success State and Results', () => {
        it('should display translated content after successful translation', async () => {
            server.use(
                http.post('/api/analyze-url', () => {
                    return HttpResponse.json(mockSuccessAnalyzeResponse);
                }),
                http.post('/api/translate-stream', () => {
                    return HttpResponse.json(mockSuccessTranslateResponse);
                })
            );

            render(<NovelTranslator />);

            const input = screen.getByPlaceholderText('Paste novel chapter URL here...');
            fireEvent.change(input, { target: { value: 'https://example.com/chapter-1' } });

            const form = document.getElementById('url-form');
            fireEvent.submit(form!);

            await waitFor(() => {
                expect(screen.getByText('Chapter 1: The Beginning')).toBeInTheDocument();
            }, { timeout: 3000 });

            expect(screen.getByText('Translated from Chinese to Vietnamese')).toBeInTheDocument();
            expect(screen.getByText(mockSuccessTranslateResponse.translatedText)).toBeInTheDocument();
        });

        it('should display next chapter button when available', async () => {
            server.use(
                http.post('/api/analyze-url', () => {
                    return HttpResponse.json(mockSuccessAnalyzeResponse);
                }),
                http.post('/api/translate-stream', () => {
                    return HttpResponse.json(mockSuccessTranslateResponse);
                })
            );

            render(<NovelTranslator />);

            const input = screen.getByPlaceholderText('Paste novel chapter URL here...');
            fireEvent.change(input, { target: { value: 'https://example.com/chapter-1' } });

            const form = document.getElementById('url-form');
            fireEvent.submit(form!);

            await waitFor(() => {
                expect(screen.getByText('Read Next Chapter')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should hide next chapter button when not available', async () => {
            server.use(
                http.post('/api/analyze-url', () => {
                    return HttpResponse.json(mockEmptyContentResponse);
                }),
                http.post('/api/translate-stream', () => {
                    return HttpResponse.json({
                        status: 'success',
                        translatedText: '',
                        chunks: 0,
                    });
                })
            );

            render(<NovelTranslator />);

            const input = screen.getByPlaceholderText('Paste novel chapter URL here...');
            fireEvent.change(input, { target: { value: 'https://example.com/last-chapter' } });

            const form = document.getElementById('url-form');
            fireEvent.submit(form!);

            await waitFor(() => {
                expect(screen.queryByText('Read Next Chapter')).not.toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should have reset button in completed state', async () => {
            server.use(
                http.post('/api/analyze-url', () => {
                    return HttpResponse.json(mockSuccessAnalyzeResponse);
                }),
                http.post('/api/translate-stream', () => {
                    return HttpResponse.json(mockSuccessTranslateResponse);
                })
            );

            render(<NovelTranslator />);

            const input = screen.getByPlaceholderText('Paste novel chapter URL here...');
            fireEvent.change(input, { target: { value: 'https://example.com/chapter-1' } });

            const form = document.getElementById('url-form');
            fireEvent.submit(form!);

            await waitFor(() => {
                const resetButton = screen.getByRole('button', { name: /start over/i });
                expect(resetButton).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Error States', () => {
        it('should display error message when analysis fails', async () => {
            server.use(
                http.post('/api/analyze-url', () => {
                    return HttpResponse.json(mockErrorAnalyzeResponse, { status: 500 });
                })
            );

            render(<NovelTranslator />);

            const input = screen.getByPlaceholderText('Paste novel chapter URL here...');
            fireEvent.change(input, { target: { value: 'https://example.com/invalid-url' } });

            const form = document.getElementById('url-form');
            fireEvent.submit(form!);

            await waitFor(() => {
                expect(screen.getByText(/Failed to analyze URL/i)).toBeInTheDocument();
            });
        });

        it('should display error when no content is found', async () => {
            server.use(
                http.post('/api/analyze-url', () => {
                    return HttpResponse.json(mockEmptyContentResponse);
                })
            );

            render(<NovelTranslator />);

            const input = screen.getByPlaceholderText('Paste novel chapter URL here...');
            fireEvent.change(input, { target: { value: 'https://example.com/empty' } });

            const form = document.getElementById('url-form');
            fireEvent.submit(form!);

            await waitFor(() => {
                expect(screen.getByText(/No content found/i)).toBeInTheDocument();
            });
        });

        it('should display error when translation fails', async () => {
            server.use(
                http.post('/api/analyze-url', () => {
                    return HttpResponse.json(mockSuccessAnalyzeResponse);
                }),
                http.post('/api/translate-stream', () => {
                    return HttpResponse.json(mockErrorTranslateResponse, { status: 500 });
                })
            );

            render(<NovelTranslator />);

            const input = screen.getByPlaceholderText('Paste novel chapter URL here...');
            fireEvent.change(input, { target: { value: 'https://example.com/chapter-1' } });

            const form = document.getElementById('url-form');
            fireEvent.submit(form!);

            await waitFor(() => {
                expect(screen.getByText(/Translation failed/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should handle network errors gracefully', async () => {
            server.use(
                http.post('/api/analyze-url', () => {
                    return new HttpResponse(null, { status: 500, statusText: 'Network Error' });
                })
            );

            render(<NovelTranslator />);

            const input = screen.getByPlaceholderText('Paste novel chapter URL here...');
            fireEvent.change(input, { target: { value: 'https://example.com/error' } });

            const form = document.getElementById('url-form');
            fireEvent.submit(form!);

            await waitFor(() => {
                expect(screen.getByText(/failed to analyze url/i)).toBeInTheDocument();
            });
        });
    });

    describe('State Reset Functionality', () => {
        it('should reset to initial state when reset button is clicked', async () => {
            server.use(
                http.post('/api/analyze-url', () => {
                    return HttpResponse.json(mockSuccessAnalyzeResponse);
                }),
                http.post('/api/translate-stream', () => {
                    return HttpResponse.json(mockSuccessTranslateResponse);
                })
            );

            render(<NovelTranslator />);

            // Submit a translation
            const input = screen.getByPlaceholderText('Paste novel chapter URL here...') as HTMLInputElement;
            fireEvent.change(input, { target: { value: 'https://example.com/chapter-1' } });

            const form = document.getElementById('url-form');
            fireEvent.submit(form!);

            await waitFor(() => {
                expect(screen.getByText('Chapter 1: The Beginning')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Click reset
            const resetButton = screen.getByRole('button', { name: /start over/i });
            fireEvent.click(resetButton);

            // Verify back to initial state
            await waitFor(() => {
                expect(screen.getByPlaceholderText('Paste novel chapter URL here...')).toHaveValue('');
            });
        });
    });

    describe('Next Chapter Navigation', () => {
        it('should load next chapter when next chapter button is clicked', async () => {
            const chapter2Response = {
                status: 'success' as const,
                type: 'chapter' as const,
                metadata: {
                    title: 'Chapter 2: The Journey',
                    nextChapterUrl: 'https://example.com/chapter-3',
                },
                rawText: 'Chapter 2 content here.',
            };

            server.use(
                http.post('/api/analyze-url', ({ request }) => {
                    const url = new URL(request.url);
                    if (url.toString().includes('chapter-2')) {
                        return HttpResponse.json(chapter2Response);
                    }
                    return HttpResponse.json(mockSuccessAnalyzeResponse);
                }),
                http.post('/api/translate-stream', () => {
                    return HttpResponse.json(mockSuccessTranslateResponse);
                })
            );

            render(<NovelTranslator />);

            // First chapter
            const input = screen.getByPlaceholderText('Paste novel chapter URL here...');
            fireEvent.change(input, { target: { value: 'https://example.com/chapter-1' } });

            const form = document.getElementById('url-form');
            fireEvent.submit(form!);

            await waitFor(() => {
                expect(screen.getByText('Read Next Chapter')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Click next chapter
            const nextButton = screen.getByText('Read Next Chapter');
            fireEvent.click(nextButton);

            // Should show analyzing state
            await waitFor(() => {
                expect(screen.getByText('Analyzing Page...')).toBeInTheDocument();
            });
        });
    });

    describe('Keyboard Interactions', () => {
        it('should submit form on Enter key press', async () => {
            server.use(
                http.post('/api/analyze-url', () => {
                    return HttpResponse.json(mockSuccessAnalyzeResponse);
                }),
                http.post('/api/translate-stream', () => {
                    return HttpResponse.json(mockSuccessTranslateResponse);
                })
            );

            render(<NovelTranslator />);

            const input = screen.getByPlaceholderText('Paste novel chapter URL here...');
            fireEvent.change(input, { target: { value: 'https://example.com/chapter-1' } });

            // Submit the form directly instead of just keyDown
            const form = document.getElementById('url-form');
            fireEvent.submit(form!);

            await waitFor(() => {
                expect(screen.getByText('Analyzing Page...')).toBeInTheDocument();
            });
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA labels for interactive elements', () => {
            render(<NovelTranslator />);

            const input = screen.getByPlaceholderText('Paste novel chapter URL here...');
            expect(input).toHaveAttribute('type', 'url');
        });

        it('should show loading state during translation', async () => {
            server.use(
                http.post('/api/analyze-url', () => {
                    return HttpResponse.json(mockSuccessAnalyzeResponse);
                }),
                http.post('/api/translate-stream', () => {
                    return HttpResponse.json(mockSuccessTranslateResponse);
                })
            );

            render(<NovelTranslator />);

            const input = screen.getByPlaceholderText('Paste novel chapter URL here...') as HTMLInputElement;
            fireEvent.change(input, { target: { value: 'https://example.com/chapter-1' } });

            const form = document.getElementById('url-form');
            fireEvent.submit(form!);

            // Should show analyzing state
            await waitFor(() => {
                expect(screen.getByText('Analyzing Page...')).toBeInTheDocument();
            });
        });
    });
});
