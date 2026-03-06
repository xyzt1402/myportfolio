import type { AnalyzeUrlResponse, TranslateResponse, ModelId } from '../types/translation';

const API_BASE_URL = ''; // Uses Vite proxy - /api/* routes to localhost:3001

/**
 * Analyze a URL and extract content
 */
export async function analyzeUrl(url: string): Promise<AnalyzeUrlResponse> {
    const response = await fetch(`${API_BASE_URL}/api/analyze-url`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
    });

    if (!response.ok) {
        throw new Error(`Failed to analyze URL: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Fetch available AI models
 */
export async function getAvailableModels(): Promise<{ status: string; models: Array<{ id: string; name: string; provider: string; description: string }> }> {
    const response = await fetch(`${API_BASE_URL}/api/models`);

    if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Translate text with the API
 */
export async function translateText(
    textChunk: string,
    context?: string,
    sourceLanguage: string = 'Chinese',
    targetLanguage: string = 'Vietnamese',
    model?: ModelId
): Promise<TranslateResponse> {
    const response = await fetch(`${API_BASE_URL}/api/translate-stream`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            textChunk,
            context,
            sourceLanguage,
            targetLanguage,
            model,
        }),
    });

    if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Check if the API server is running
 */
export async function checkServerHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        return response.ok;
    } catch {
        return false;
    }
}
