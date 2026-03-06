import type { Request, Response } from 'express';
import { analyzeUrl as extractContent } from '../services/extractor.js';
import { translateChunk, translateFullText, getAvailableModels } from '../services/translator.js';
import type { ModelId } from '../types.js';

/**
 * GET /api/models
 * 
 * Returns list of available AI models for translation
 */
export function getModels(_req: Request, res: Response): void {
    const models = getAvailableModels();
    res.json({
        status: 'success',
        models,
    });
}

/**
 * POST /api/analyze-url
 * 
 * Fetches HTML, identifies if it's an index or chapter,
 * and returns the raw text and metadata.
 */
export async function analyzeUrl(req: Request, res: Response): Promise<void> {
    try {
        const { url } = req.body;

        if (!url) {
            res.status(400).json({
                status: 'error',
                error: 'URL is required',
            });
            return;
        }

        // Validate URL
        try {
            new URL(url);
        } catch {
            res.status(400).json({
                status: 'error',
                error: 'Invalid URL format',
            });
            return;
        }

        console.log(`🔍 Analyzing URL: ${url}`);
        const result = await extractContent(url);

        res.json(result);
    } catch (error) {
        console.error('❌ Error in analyze-url:', error);
        res.status(500).json({
            status: 'error',
            error: error instanceof Error ? error.message : 'Failed to analyze URL',
        });
    }
}

/**
 * POST /api/translate-stream
 * 
 * Accepts a chunk of raw text, sends it to the AI,
 * and streams the translated text back to the client.
 */
export async function translateStream(req: Request, res: Response): Promise<void> {
    try {
        const { textChunk, context, sourceLanguage, targetLanguage, model } = req.body;

        if (!textChunk) {
            res.status(400).json({
                status: 'error',
                error: 'textChunk is required',
            });
            return;
        }

        // Set up SSE headers for streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');

        console.log(`🔄 Starting translation stream${model ? ` using model: ${model}` : ''}`);

        // Check if we should use streaming or complete translation
        const useStreaming = req.query.stream === 'true';

        if (useStreaming) {
            // Stream the translation using SSE
            const stream = await translateChunk(
                textChunk,
                context,
                sourceLanguage || 'Chinese',
                targetLanguage || 'Vietnamese',
                model as ModelId
            );

            // Send the complete translation
            res.json({
                status: 'success',
                translatedText: stream,
            });
        } else {
            // Non-streaming: translate the full text with chunking
            const result = await translateFullText(
                textChunk,
                sourceLanguage || 'Chinese',
                targetLanguage || 'Vietnamese',
                model as ModelId
            );

            res.json({
                status: 'success',
                translatedText: result.translatedText,
                chunks: result.chunks,
            });
        }
    } catch (error) {
        console.error('❌ Error in translate-stream:', error);

        // If response is not already sent
        if (!res.writableEnded) {
            res.status(500).json({
                status: 'error',
                error: error instanceof Error ? error.message : 'Translation failed',
            });
        }
    }
}
