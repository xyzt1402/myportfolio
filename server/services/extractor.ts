import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import * as cheerio from 'cheerio';
import type { AnalyzeUrlResponse, PageMetadata } from '../types.js';

/**
 * Configuration for chunk size
 */
const CHUNK_CONFIG = {
    maxWords: 400,  // Reduced from 1000 to stay within token limits
    overlapParagraphs: 1,  // Reduced overlap
};

/**
 * Common selectors for novel sites (can be extended)
 */
const SITE_SELECTORS = {
    // Common chapter navigation selectors
    nextChapter: [
        'a[rel="next"]',
        'a.next-chapter',
        'a.next',
        '.next-chapter a',
        '#next-chapter',
        '[data-next-chapter]',
        'a:contains("Next Chapter")',
        'a:contains("Tiếp theo")',
    ].join(', '),

    // Common title selectors
    title: [
        'h1.chapter-title',
        '.chapter-title',
        'h1.title',
        '.novel-title',
        'h1',
    ].join(', '),

    // Index page indicators
    indexIndicators: [
        '.chapter-list',
        '#chapter-list',
        '.novel-chapters',
        '[data-chapter-list]',
    ].join(', '),
};

/**
 * Fetch HTML from a URL with error handling
 */
async function fetchHtml(url: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.text();
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Request timeout - the server took too long to respond');
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Extract content from HTML using Readability
 */
function extractWithReadability(html: string, url: string): {
    title: string;
    content: string;
    excerpt?: string;
} {
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
        throw new Error('Failed to parse article content');
    }

    return {
        title: article.title || 'Untitled',
        content: article.textContent || '',
        excerpt: article.excerpt ?? undefined,
    };
}

/**
 * Find next chapter URL from the page
 */
function findNextChapterUrl(html: string, baseUrl: string): string | null {
    const $ = cheerio.load(html);

    // Try common selectors
    const nextLink = $(SITE_SELECTORS.nextChapter).first();

    if (nextLink.length) {
        const href = nextLink.attr('href');
        if (href) {
            // Handle relative URLs
            return new URL(href, baseUrl).href;
        }
    }

    // Try finding links with "next" or "chapter" in text
    let foundUrl: string | null = null;
    $('a').each(function (_: number, el: any) {
        if (foundUrl) return; // Already found
        const text = $(el).text().toLowerCase();
        const href = $(el).attr('href');

        if (
            (text.includes('next') || text.includes('tiếp') || text.includes('chương sau')) &&
            href
        ) {
            const resolved = new URL(href, baseUrl).href;
            // Only return if it looks like a chapter URL
            if (resolved.includes('chapter') || resolved.includes('chuong') || resolved.includes('chapters')) {
                foundUrl = resolved;
            }
        }
    });

    return foundUrl;
}

/**
 * Detect if a page is an index/chapter list page
 */
function isIndexPage(html: string): boolean {
    const $ = cheerio.load(html);
    return $(SITE_SELECTORS.indexIndicators).length > 0;
}

/**
 * Find first chapter link from index page
 */
function findFirstChapterUrl(html: string, baseUrl: string): string | null {
    const $ = cheerio.load(html);

    // Look for chapter list items
    const chapterLinks = $('a[href*="chapter"], a[href*="chuong"], a[href*="chapters"]');

    if (chapterLinks.length) {
        const href = chapterLinks.first().attr('href');
        if (href) {
            return new URL(href, baseUrl).href;
        }
    }

    // Fallback: first substantial link in chapter list
    const listItems = $('.chapter-list a, #chapter-list a, .chapters a');
    if (listItems.length) {
        const href = listItems.first().attr('href');
        if (href) {
            return new URL(href, baseUrl).href;
        }
    }

    return null;
}

/**
 * Main function to analyze URL and extract content
 */
export async function analyzeUrl(url: string): Promise<AnalyzeUrlResponse> {
    try {
        console.log(`📥 Fetching URL: ${url}`);
        const html = await fetchHtml(url);

        // Check if it's an index page
        if (isIndexPage(html)) {
            const firstChapterUrl = findFirstChapterUrl(html, url);

            if (firstChapterUrl) {
                console.log(`📋 Index page detected, found first chapter: ${firstChapterUrl}`);

                // Fetch the first chapter content
                const chapterHtml = await fetchHtml(firstChapterUrl);
                const extracted = extractWithReadability(chapterHtml, firstChapterUrl);
                const nextChapterUrl = findNextChapterUrl(chapterHtml, firstChapterUrl);

                return {
                    status: 'success',
                    type: 'chapter',
                    metadata: {
                        title: extracted.title,
                        nextChapterUrl,
                    },
                    rawText: extracted.content,
                };
            }

            return {
                status: 'success',
                type: 'index',
                error: 'Index page detected but no chapter links found',
            };
        }

        // It's a chapter page
        console.log(`📄 Chapter page detected`);
        const extracted = extractWithReadability(html, url);
        const nextChapterUrl = findNextChapterUrl(html, url);

        const metadata: PageMetadata = {
            title: extracted.title,
            nextChapterUrl,
        };

        return {
            status: 'success',
            type: 'chapter',
            metadata,
            rawText: extracted.content,
        };
    } catch (error) {
        console.error('❌ Error analyzing URL:', error);

        return {
            status: 'error',
            type: 'unknown',
            error: error instanceof Error ? error.message : 'Failed to analyze URL',
        };
    }
}

/**
 * Split text into chunks for translation
 */
export function splitIntoChunks(text: string, maxWords: number = CHUNK_CONFIG.maxWords): string[] {
    const paragraphs = text.split(/\n\n+/);
    const chunks: string[] = [];
    let currentChunk: string[] = [];
    let currentWordCount = 0;

    for (const paragraph of paragraphs) {
        const wordCount = paragraph.split(/\s+/).filter(Boolean).length;

        if (currentWordCount + wordCount > maxWords && currentChunk.length > 0) {
            chunks.push(currentChunk.join('\n\n'));
            // Keep last few paragraphs for context overlap
            const overlapCount = Math.min(CHUNK_CONFIG.overlapParagraphs, currentChunk.length);
            currentChunk = currentChunk.slice(-overlapCount);
            currentWordCount = currentChunk.join(' ').split(/\s+/).filter(Boolean).length;
        }

        currentChunk.push(paragraph);
        currentWordCount += wordCount;
    }

    // Add remaining chunk
    if (currentChunk.length > 0) {
        chunks.push(currentChunk.join('\n\n'));
    }

    return chunks;
}

export { CHUNK_CONFIG };
