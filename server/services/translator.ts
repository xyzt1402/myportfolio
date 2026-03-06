import OpenAI from 'openai';
import type { TranslateStreamRequest, StreamChunk, ModelId, AVAILABLE_MODELS } from '../types.js';
import { splitIntoChunks } from './extractor.js';

// Default model if none specified
const DEFAULT_MODEL: ModelId = 'anthropic/claude-3.5-sonnet';

// Lazy initialization of OpenAI client
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
    if (!openaiClient) {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            throw new Error('OPENROUTER_API_KEY environment variable is not set');
        }
        openaiClient = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: apiKey,
            defaultHeaders: {
                'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
                'X-Title': process.env.OPENROUTER_APP_NAME || 'Novel Translator',
            },
        });
    }
    return openaiClient;
}

/**
 * System prompt for translation - strictly defined per spec
 */
const TRANSLATION_SYSTEM_PROMPT = `Translate Chinese web novels to Vietnamese.

Rules:
- Keep emotional tone (Wuxia, Xianxia, etc.)
- Translate accurately, no summarizing
- Use context for name/title consistency
- Output ONLY translated text, no filler`;

/**
 * Validate and get model ID
 */
function getModelId(model?: ModelId): ModelId {
    if (!model) return DEFAULT_MODEL;
    // Check if model is in available models
    const availableModelIds = [
        'anthropic/claude-3.5-sonnet',
        'anthropic/claude-3-opus',
        'openai/gpt-4o',
        'openai/gpt-4o-mini',
        'google/gemini-1.5-pro',
        'mistralai/mistral-large',
        'meta-llama/llama-3.1-70b-instruct',
        'deepseek/deepseek-chat',
        'upstage/solar-pro-3:free',
    ] as ModelId[];

    if (availableModelIds.includes(model)) {
        return model;
    }
    return DEFAULT_MODEL;
}

/**
 * Translate a single text chunk using OpenRouter
 */
export async function translateChunk(
    textChunk: string,
    context?: string,
    sourceLanguage: string = 'Chinese',
    targetLanguage: string = 'Vietnamese',
    model?: ModelId
): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY environment variable is not set');
    }

    const selectedModel = getModelId(model);

    // Build the user prompt with context (limit context to last 100 chars to save tokens)
    let userPrompt = `Translate to ${targetLanguage}:\n${textChunk}`;

    if (context) {
        const limitedContext = context.slice(-100); // Only last 100 chars for names/consistency
        userPrompt = `Context: ...${limitedContext}\n---\nTranslate:\n${textChunk}`;
    }

    try {
        const openai = getOpenAIClient();
        const completion = await openai.chat.completions.create({
            model: selectedModel,
            messages: [
                {
                    role: 'system',
                    content: TRANSLATION_SYSTEM_PROMPT,
                },
                {
                    role: 'user',
                    content: userPrompt,
                },
            ],
            max_tokens: 1333,
            temperature: 0.3,
        });

        // Extract the translated text from the response
        const translatedText = completion.choices[0]?.message?.content || '';

        return translatedText.trim();
    } catch (error) {
        console.error('❌ Translation error:', error);
        throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Translate text with streaming response using OpenRouter
 */
export async function translateWithStreaming(
    textChunk: string,
    context?: string,
    sourceLanguage: string = 'Chinese',
    targetLanguage: string = 'Vietnamese',
    model?: ModelId
): Promise<AsyncGenerator<StreamChunk>> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY environment variable is not set');
    }

    const selectedModel = getModelId(model);

    async function* generate(): AsyncGenerator<StreamChunk> {
        try {
            // Build the user prompt with context (limit context to last 100 chars to save tokens)
            let userPrompt = `Translate to ${targetLanguage}:\n${textChunk}`;

            if (context) {
                const limitedContext = context.slice(-100); // Only last 100 chars for names/consistency
                userPrompt = `Context: ...${limitedContext}\n---\nTranslate:\n${textChunk}`;
            }

            const openai = getOpenAIClient();
            const stream = await openai.chat.completions.create({
                model: selectedModel,
                messages: [
                    {
                        role: 'system',
                        content: TRANSLATION_SYSTEM_PROMPT,
                    },
                    {
                        role: 'user',
                        content: userPrompt,
                    },
                ],
                max_tokens: 1333,
                temperature: 0.3,
                stream: true,
            });

            for await (const chunk of stream) {
                const text = chunk.choices[0]?.delta?.content || '';
                if (text) {
                    yield {
                        type: 'chunk',
                        text: text,
                    };
                }
            }

            yield { type: 'done' };
        } catch (error) {
            console.error('❌ Streaming translation error:', error);
            yield {
                type: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    return generate();
}

/**
 * Translate full text with chunking and return complete translation
 */
export async function translateFullText(
    rawText: string,
    sourceLanguage: string = 'Chinese',
    targetLanguage: string = 'Vietnamese',
    model?: ModelId
): Promise<{ translatedText: string; chunks: number }> {
    const chunks = splitIntoChunks(rawText);
    console.log(`📝 Split text into ${chunks.length} chunks`);

    let translatedText = '';
    let previousContext = '';

    for (let i = 0; i < chunks.length; i++) {
        console.log(`  Translating chunk ${i + 1}/${chunks.length}...`);

        const translatedChunk = await translateChunk(
            chunks[i],
            previousContext,
            sourceLanguage,
            targetLanguage,
            model
        );

        // Keep only last 150 chars for context (names, terms consistency)
        previousContext = translatedChunk.slice(-150);

        translatedText += (translatedText ? '\n\n' : '') + translatedChunk;
    }

    return { translatedText, chunks: chunks.length };
}

/**
 * Process translation request and stream results
 */
export async function processTranslationRequest(
    request: TranslateStreamRequest
): Promise<{
    chunks: string[];
    translate: (index: number, context?: string) => Promise<AsyncGenerator<StreamChunk>>;
}> {
    const { textChunk, sourceLanguage = 'Chinese', targetLanguage = 'Vietnamese', model } = request;

    // Split into chunks
    const chunks = splitIntoChunks(textChunk);
    console.log(`📝 Split text into ${chunks.length} chunks for streaming`);

    // Return function to translate specific chunk with streaming
    const translate = async (index: number, context?: string): Promise<AsyncGenerator<StreamChunk>> => {
        if (index < 0 || index >= chunks.length) {
            throw new Error(`Invalid chunk index: ${index}`);
        }

        return translateWithStreaming(
            chunks[index],
            context,
            sourceLanguage,
            targetLanguage,
            model
        );
    };

    return { chunks, translate };
}

/**
 * Get available models
 */
export function getAvailableModels() {
    return [
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
}
