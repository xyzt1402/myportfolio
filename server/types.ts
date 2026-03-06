/**
 * Analysis response types
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

/**
 * Available AI Models for translation
 */
export const AVAILABLE_MODELS = [
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', description: 'Best balance of quality and speed' },
    { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', description: 'Highest quality, slower' },
    { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', description: 'Excellent multilingual capabilities' },
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', description: 'Fast and cost-effective' },
    { id: 'google/gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', description: 'Great for long context' },
    { id: 'mistralai/mistral-large', name: 'Mistral Large', provider: 'Mistral', description: 'European quality model' },
    { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'Meta', description: 'Open source powerhouse' },
    { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek', description: 'Optimized for Chinese content' },
    { id: 'upstage/solar-pro-3:free', name: 'Solar Pro 3', provider: 'Upstage', description: 'Free tier model' },
] as const;

export type ModelId = typeof AVAILABLE_MODELS[number]['id'];

/**
 * Translation request types
 */
export interface TranslateStreamRequest {
    textChunk: string;
    context?: string;
    sourceLanguage?: string;
    targetLanguage?: string;
    model?: ModelId;
}

export interface TranslateStreamResponse {
    status: 'success' | 'error';
    translatedText?: string;
    error?: string;
}

/**
 * Chunk configuration
 */
export interface ChunkConfig {
    maxWords: number;
    overlapParagraphs: number;
}

/**
 * Streaming event types
 */
export interface StreamChunk {
    type: 'chunk' | 'done' | 'error';
    text?: string;
    error?: string;
    chunkIndex?: number;
    totalChunks?: number;
}

/**
 * Novel site patterns for detection
 */
export interface SitePatterns {
    chapterSelector: string;
    nextChapterSelector: string;
    titleSelector: string;
    indexUrlPattern?: RegExp;
}
