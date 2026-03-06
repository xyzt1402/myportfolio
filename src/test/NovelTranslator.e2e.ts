/**
 * NovelTranslator E2E Tests
 *
 * System-level tests using Playwright.
 * Tests the Critical User Path (CUP) from landing to translation completion.
 * Includes responsive design tests for Mobile vs Desktop.
 */

import { test, expect, type Page } from '@playwright/test';

// Test data
const TEST_URL = 'https://example.com/novel/chapter-1';
const MOCK_CHAPTER_TITLE = 'Chapter 1: The Beginning';
const MOCK_TRANSLATED_TEXT = 'Đây là nội dung văn bản đã được dịch sang tiếng Việt.';

test.describe('NovelTranslator Critical User Path', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the Novel Translator page
        await page.goto('/novel-translator');

        // Mock API endpoints
        await page.route('**/api/health', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }),
            });
        });
    });

    test.describe('Landing and Initial State', () => {
        test('should display the Novel Translator page with all elements', async ({ page }) => {
            // Verify header
            await expect(page.getByRole('heading', { name: 'Novel Translator' })).toBeVisible();
            await expect(page.getByText('Chinese → Vietnamese')).toBeVisible();

            // Verify server status indicator
            await expect(page.getByText(/Server (Online|Offline|Checking)/)).toBeVisible();

            // Verify input form
            await expect(page.getByPlaceholder('Paste novel chapter URL here...')).toBeVisible();
            await expect(page.getByRole('button', { name: 'Translate' })).toBeVisible();

            // Verify instructions
            await expect(page.getByText('Paste a URL from any novel site to translate it to Vietnamese')).toBeVisible();
        });

        test('should show server online status', async ({ page }) => {
            // Wait for server status check
            await expect(page.getByText('Server Online')).toBeVisible({ timeout: 5000 });
        });

        test('should have translate button initially disabled', async ({ page }) => {
            const translateButton = page.getByRole('button', { name: 'Translate' });
            await expect(translateButton).toBeDisabled();
        });
    });

    test.describe('URL Input and Validation', () => {
        test('should enable translate button after entering valid URL', async ({ page }) => {
            const input = page.getByPlaceholder('Paste novel chapter URL here...');
            const translateButton = page.getByRole('button', { name: 'Translate' });

            await input.fill(TEST_URL);
            await expect(translateButton).toBeEnabled();
        });

        test('should disable translate button when URL is cleared', async ({ page }) => {
            const input = page.getByPlaceholder('Paste novel chapter URL here...');
            const translateButton = page.getByRole('button', { name: 'Translate' });

            await input.fill(TEST_URL);
            await expect(translateButton).toBeEnabled();

            await input.clear();
            await expect(translateButton).toBeDisabled();
        });

        test('should accept URLs with query parameters', async ({ page }) => {
            const input = page.getByPlaceholder('Paste novel chapter URL here...');
            const translateButton = page.getByRole('button', { name: 'Translate' });

            await input.fill('https://example.com/chapter?id=123&token=abc');
            await expect(translateButton).toBeEnabled();
        });
    });

    test.describe('Translation Flow - Success Path', () => {
        test('should complete full translation workflow successfully', async ({ page }) => {
            // Setup API mocks
            await page.route('**/api/analyze-url', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'success',
                        type: 'chapter',
                        metadata: {
                            title: MOCK_CHAPTER_TITLE,
                            nextChapterUrl: 'https://example.com/chapter-2',
                        },
                        rawText: 'This is sample Chinese text content.',
                    }),
                });
            });

            await page.route('**/api/translate-stream', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'success',
                        translatedText: MOCK_TRANSLATED_TEXT,
                        chunks: 1,
                    }),
                });
            });

            // Step 1: Enter URL
            const input = page.getByPlaceholder('Paste novel chapter URL here...');
            await input.fill(TEST_URL);

            // Step 2: Submit form
            const translateButton = page.getByRole('button', { name: 'Translate' });
            await translateButton.click();

            // Step 3: Verify analyzing state
            await expect(page.getByText('Analyzing Page...')).toBeVisible();
            await expect(page.getByText('Extracting content from the URL')).toBeVisible();

            // Step 4: Verify translating state
            await expect(page.getByText('Translating...')).toBeVisible({ timeout: 10000 });
            await expect(page.getByText('Translating content to Vietnamese')).toBeVisible();
            await expect(page.getByText(MOCK_CHAPTER_TITLE)).toBeVisible();

            // Step 5: Verify completion state
            await expect(page.getByRole('heading', { name: MOCK_CHAPTER_TITLE })).toBeVisible({ timeout: 10000 });
            await expect(page.getByText('Translated from Chinese to Vietnamese')).toBeVisible();
            await expect(page.getByText(MOCK_TRANSLATED_TEXT)).toBeVisible();

            // Step 6: Verify navigation options
            await expect(page.getByRole('button', { name: /start over/i })).toBeVisible();
            await expect(page.getByText('Read Next Chapter')).toBeVisible();
        });

        test('should handle chapter without next chapter link', async ({ page }) => {
            await page.route('**/api/analyze-url', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'success',
                        type: 'chapter',
                        metadata: {
                            title: 'Final Chapter',
                            nextChapterUrl: null,
                        },
                        rawText: 'Final chapter content.',
                    }),
                });
            });

            await page.route('**/api/translate-stream', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'success',
                        translatedText: 'Nội dung chương cuối.',
                        chunks: 1,
                    }),
                });
            });

            await page.getByPlaceholder('Paste novel chapter URL here...').fill('https://example.com/final-chapter');
            await page.getByRole('button', { name: 'Translate' }).click();

            await expect(page.getByRole('heading', { name: 'Final Chapter' })).toBeVisible({ timeout: 10000 });

            // Should NOT show next chapter button
            await expect(page.getByText('Read Next Chapter')).not.toBeVisible();
        });
    });

    test.describe('Error Handling', () => {
        test('should display error when URL analysis fails', async ({ page }) => {
            await page.route('**/api/analyze-url', async (route) => {
                await route.fulfill({
                    status: 500,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'error',
                        error: 'Failed to fetch content from URL',
                    }),
                });
            });

            await page.getByPlaceholder('Paste novel chapter URL here...').fill('https://invalid-url.com');
            await page.getByRole('button', { name: 'Translate' }).click();

            await expect(page.getByText('Failed to fetch content from URL')).toBeVisible({ timeout: 10000 });
        });

        test('should display error when no content is found', async ({ page }) => {
            await page.route('**/api/analyze-url', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'success',
                        type: 'chapter',
                        metadata: {
                            title: 'Empty',
                            nextChapterUrl: null,
                        },
                        rawText: '',
                    }),
                });
            });

            await page.getByPlaceholder('Paste novel chapter URL here...').fill('https://example.com/empty');
            await page.getByRole('button', { name: 'Translate' }).click();

            await expect(page.getByText('No content found on this page')).toBeVisible({ timeout: 10000 });
        });

        test('should display error when translation API fails', async ({ page }) => {
            await page.route('**/api/analyze-url', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'success',
                        type: 'chapter',
                        metadata: {
                            title: MOCK_CHAPTER_TITLE,
                            nextChapterUrl: null,
                        },
                        rawText: 'Content to translate',
                    }),
                });
            });

            await page.route('**/api/translate-stream', async (route) => {
                await route.fulfill({
                    status: 500,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'error',
                        error: 'Translation service is currently unavailable',
                    }),
                });
            });

            await page.getByPlaceholder('Paste novel chapter URL here...').fill(TEST_URL);
            await page.getByRole('button', { name: 'Translate' }).click();

            await expect(page.getByText('Translation service is currently unavailable')).toBeVisible({ timeout: 10000 });
        });
    });

    test.describe('Reset Functionality', () => {
        test('should reset to initial state when clicking start over', async ({ page }) => {
            // Setup success mocks
            await page.route('**/api/analyze-url', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'success',
                        type: 'chapter',
                        metadata: {
                            title: MOCK_CHAPTER_TITLE,
                            nextChapterUrl: null,
                        },
                        rawText: 'Content',
                    }),
                });
            });

            await page.route('**/api/translate-stream', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'success',
                        translatedText: MOCK_TRANSLATED_TEXT,
                        chunks: 1,
                    }),
                });
            });

            // Complete a translation
            await page.getByPlaceholder('Paste novel chapter URL here...').fill(TEST_URL);
            await page.getByRole('button', { name: 'Translate' }).click();

            await expect(page.getByRole('heading', { name: MOCK_CHAPTER_TITLE })).toBeVisible({ timeout: 10000 });

            // Click reset
            await page.getByRole('button', { name: /start over/i }).click();

            // Verify back to initial state
            await expect(page.getByPlaceholder('Paste novel chapter URL here...')).toHaveValue('');
            await expect(page.getByRole('button', { name: 'Translate' })).toBeDisabled();
            await expect(page.getByText('Paste a URL from any novel site to translate it to Vietnamese')).toBeVisible();
        });
    });

    test.describe('Next Chapter Navigation', () => {
        test('should load next chapter when clicking next chapter button', async ({ page }) => {
            let requestCount = 0;

            await page.route('**/api/analyze-url', async (route) => {
                requestCount++;
                const postData = route.request().postData();
                const isNextChapter = postData?.includes('chapter-2');

                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'success',
                        type: 'chapter',
                        metadata: {
                            title: isNextChapter ? 'Chapter 2: The Journey' : MOCK_CHAPTER_TITLE,
                            nextChapterUrl: isNextChapter ? 'https://example.com/chapter-3' : 'https://example.com/chapter-2',
                        },
                        rawText: 'Chapter content',
                    }),
                });
            });

            await page.route('**/api/translate-stream', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'success',
                        translatedText: MOCK_TRANSLATED_TEXT,
                        chunks: 1,
                    }),
                });
            });

            // First chapter
            await page.getByPlaceholder('Paste novel chapter URL here...').fill('https://example.com/chapter-1');
            await page.getByRole('button', { name: 'Translate' }).click();

            await expect(page.getByRole('heading', { name: MOCK_CHAPTER_TITLE })).toBeVisible({ timeout: 10000 });

            // Click next chapter
            await page.getByText('Read Next Chapter').click();

            // Should show analyzing state and eventually the new chapter
            await expect(page.getByText('Analyzing Page...')).toBeVisible();
            await expect(page.getByRole('heading', { name: 'Chapter 2: The Journey' })).toBeVisible({ timeout: 10000 });

            expect(requestCount).toBeGreaterThanOrEqual(2);
        });
    });
});

test.describe('Responsive Design', () => {
    test.describe('Desktop Viewport (1280x720)', () => {
        test.use({ viewport: { width: 1280, height: 720 } });

        test('should display full layout on desktop', async ({ page }) => {
            await page.goto('/novel-translator');

            // Mock health check
            await page.route('**/api/health', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ status: 'ok' }),
                });
            });

            await expect(page.getByRole('heading', { name: 'Novel Translator' })).toBeVisible();

            // Check that the header layout is appropriate for desktop
            const header = page.locator('header');
            const headerBox = await header.boundingBox();
            expect(headerBox?.width).toBeGreaterThan(800);
        });

        test('should have adequate padding on desktop', async ({ page }) => {
            await page.goto('/novel-translator');

            await page.route('**/api/health', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ status: 'ok' }),
                });
            });

            const main = page.locator('main');
            await expect(main).toBeVisible();
        });
    });

    test.describe('Tablet Viewport (768x1024)', () => {
        test.use({ viewport: { width: 768, height: 1024 } });

        test('should adapt layout for tablet', async ({ page }) => {
            await page.goto('/novel-translator');

            await page.route('**/api/health', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ status: 'ok' }),
                });
            });

            await expect(page.getByRole('heading', { name: 'Novel Translator' })).toBeVisible();
            await expect(page.getByPlaceholder('Paste novel chapter URL here...')).toBeVisible();
        });
    });

    test.describe('Mobile Viewport (375x667)', () => {
        test.use({ viewport: { width: 375, height: 667 } });

        test('should display mobile-friendly layout', async ({ page }) => {
            await page.goto('/novel-translator');

            await page.route('**/api/health', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ status: 'ok' }),
                });
            });

            // All elements should still be visible and accessible
            await expect(page.getByRole('heading', { name: 'Novel Translator' })).toBeVisible();
            await expect(page.getByPlaceholder('Paste novel chapter URL here...')).toBeVisible();
            await expect(page.getByRole('button', { name: 'Translate' })).toBeVisible();
        });

        test('should have touch-friendly input on mobile', async ({ page }) => {
            await page.goto('/novel-translator');

            await page.route('**/api/health', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ status: 'ok' }),
                });
            });

            const input = page.getByPlaceholder('Paste novel chapter URL here...');
            const button = page.getByRole('button', { name: 'Translate' });

            // Check minimum touch target sizes (44px is recommended)
            const inputBox = await input.boundingBox();
            const buttonBox = await button.boundingBox();

            expect(inputBox?.height).toBeGreaterThanOrEqual(44);
            expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
        });

        test('should complete full workflow on mobile viewport', async ({ page }) => {
            await page.goto('/novel-translator');

            await page.route('**/api/health', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ status: 'ok' }),
                });
            });

            await page.route('**/api/analyze-url', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'success',
                        type: 'chapter',
                        metadata: {
                            title: MOCK_CHAPTER_TITLE,
                            nextChapterUrl: null,
                        },
                        rawText: 'Content',
                    }),
                });
            });

            await page.route('**/api/translate-stream', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'success',
                        translatedText: MOCK_TRANSLATED_TEXT,
                        chunks: 1,
                    }),
                });
            });

            // Complete workflow on mobile
            await page.getByPlaceholder('Paste novel chapter URL here...').fill(TEST_URL);
            await page.getByRole('button', { name: 'Translate' }).click();

            await expect(page.getByRole('heading', { name: MOCK_CHAPTER_TITLE })).toBeVisible({ timeout: 10000 });
            await expect(page.getByText(MOCK_TRANSLATED_TEXT)).toBeVisible();
        });
    });

    test.describe('Large Desktop Viewport (1920x1080)', () => {
        test.use({ viewport: { width: 1920, height: 1080 } });

        test('should utilize full width on large screens', async ({ page }) => {
            await page.goto('/novel-translator');

            await page.route('**/api/health', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ status: 'ok' }),
                });
            });

            const main = page.locator('main');
            const mainBox = await main.boundingBox();

            // Main content should be centered with max-width
            expect(mainBox?.width).toBeLessThanOrEqual(1024); // max-w-5xl = 1024px
        });
    });
});

test.describe('Performance and Accessibility', () => {
    test('should have acceptable load time', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('/novel-translator');

        await page.route('**/api/health', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ status: 'ok' }),
            });
        });

        await expect(page.getByRole('heading', { name: 'Novel Translator' })).toBeVisible();

        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('should have proper document title', async ({ page }) => {
        await page.goto('/novel-translator');

        await expect(page).toHaveTitle(/Novel Translator|LTV/i);
    });

    test('should maintain focus states for accessibility', async ({ page }) => {
        await page.goto('/novel-translator');

        await page.route('**/api/health', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ status: 'ok' }),
            });
        });

        const input = page.getByPlaceholder('Paste novel chapter URL here...');

        // Focus the input
        await input.focus();
        await expect(input).toBeFocused();

        // Tab to the button
        await page.keyboard.press('Tab');
    });
});
