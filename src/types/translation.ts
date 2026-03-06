/**
 * AI Model Types
 */
export interface AIModel {
    id: string;
    name: string;
    provider: string;
    description: string;
}

export const AVAILABLE_MODELS: AIModel[] = [
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', description: 'Best balance of quality and speed' },
    { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', description: 'Highest quality, slower' },
    { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', description: 'Excellent multilingual capabilities' },
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', description: 'Fast and cost-effective' },
    { id: 'google/gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', description: 'Great for long context' },
    { id: 'mistralai/mistral-large', name: 'Mistral Large', provider: 'Mistral', description: 'European quality model' },
    { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'Meta', description: 'Open source powerhouse' },
    { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek', description: 'Optimized for Chinese content' },
    { id: 'upstage/solar-pro-3:free', name: 'Solar Pro 3', provider: 'Upstage', description: 'Free tier model' },
];

export type ModelId = typeof AVAILABLE_MODELS[number]['id'];

export const DEFAULT_MODEL_ID: ModelId = 'anthropic/claude-3.5-sonnet';

/**
 * Translation API types
 */

export interface AnalyzeUrlRequest {
    url: string;
}

export interface PageMetadata {
    title: string;
    nextChapterUrl: string | null;
    author?: string;
    novelTitle?: string;
}

export interface AnalyzeUrlResponse {
    status: 'success' | 'error';
    type: 'chapter' | 'index' | 'unknown';
    metadata?: PageMetadata;
    rawText?: string;
    error?: string;
}

export interface TranslateRequest {
    textChunk: string;
    context?: string;
    sourceLanguage?: string;
    targetLanguage?: string;
}

export interface TranslateResponse {
    status: 'success' | 'error';
    translatedText?: string;
    chunks?: number;
    error?: string;
}

export type TranslationStatus = 'idle' | 'analyzing' | 'translating' | 'complete' | 'error';

export interface TranslationState {
    status: TranslationStatus;
    url: string;
    originalText: string;
    translatedText: string;
    title: string;
    nextChapterUrl: string | null;
    error: string | null;
    progress: number;
    currentChunk: number;
    totalChunks: number;
}
