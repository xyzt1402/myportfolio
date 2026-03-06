import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, ArrowRight, Loader2, AlertCircle, ChevronDown, RefreshCw, Cpu, Check } from 'lucide-react';
import { analyzeUrl, translateText, checkServerHealth } from '../services/translationApi';
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID } from '../types/translation';
import type { TranslationState, ModelId } from '../types/translation';

/**
 * Novel Translator Page
 * 
 * A minimalistic UI for translating web novels from Chinese to Vietnamese.
 * Features:
 * - URL input for novel chapters
 * - Automatic content extraction using Readability
 * - Chunked translation with context for consistency
 * - Streaming-ready architecture
 */

interface ModelSelectorProps {
    selectedModel: ModelId;
    onSelect: (model: ModelId) => void;
    disabled?: boolean;
}

function ModelSelector({ selectedModel, onSelect, disabled }: ModelSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedModelData = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[0];

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (modelId: ModelId) => {
        onSelect(modelId);
        setIsOpen(false);
    };

    return (
        <div ref={dropdownRef} className="relative">
            {/* Small selector button - positioned left and below */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed
                         dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800/50 text-gray-600 hover:text-gray-700 hover:bg-gray-100"
            >
                <Cpu className="w-3.5 h-3.5" />
                <span className="font-medium">{selectedModelData.name}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full mt-1 w-72 border rounded-lg shadow-xl overflow-hidden z-50 p-2
                                 dark:bg-gray-900 dark:border-gray-700 dark:shadow-black/50 bg-white border-gray-200 shadow-gray-900/10"
                    >
                        <div className="max-h-64 overflow-y-auto space-y-1">
                            {AVAILABLE_MODELS.map((model) => (
                                <button
                                    key={model.id}
                                    type="button"
                                    onClick={() => handleSelect(model.id as ModelId)}
                                    className={`w-full flex items-center gap-3 px-3 py-3 text-left rounded-md
                                             transition-colors
                                             ${selectedModel === model.id ? 'bg-indigo-500/10' :
                                            'dark:hover:bg-gray-800 hover:bg-gray-100'}`}
                                >
                                    <div className={`w-4 h-4 rounded flex items-center justify-center
                                                  ${selectedModel === model.id
                                            ? 'bg-indigo-500 text-white'
                                            : 'dark:border border-gray-600 border-gray-300'}`}>
                                        {selectedModel === model.id && <Check className="w-3 h-3" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-medium truncate
                                                           ${selectedModel === model.id ? 'text-indigo-400' :
                                                    'dark:text-gray-200 text-gray-700'}`}>
                                                {model.name}
                                            </span>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded text-gray-500 dark:bg-gray-800 bg-gray-100">
                                                {model.provider}
                                            </span>
                                        </div>
                                        <p className="text-xs truncate text-gray-500">
                                            {model.description}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function NovelTranslator() {
    const [url, setUrl] = useState('');
    const [state, setState] = useState<TranslationState>({
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
    });
    const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
    const [selectedModel, setSelectedModel] = useState<ModelId>(DEFAULT_MODEL_ID);

    // Check server status on mount
    useEffect(() => {
        const checkServer = async () => {
            const isOnline = await checkServerHealth();
            setServerStatus(isOnline ? 'online' : 'offline');
        };
        checkServer();
        const interval = setInterval(checkServer, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!url.trim()) return;

        // Reset state
        setState(prev => ({
            ...prev,
            status: 'analyzing',
            url,
            error: null,
            originalText: '',
            translatedText: '',
            title: '',
            nextChapterUrl: null,
            progress: 0,
        }));

        try {
            // Step 1: Analyze URL and extract content
            const analysisResult = await analyzeUrl(url);

            if (analysisResult.status === 'error') {
                setState(prev => ({
                    ...prev,
                    status: 'error',
                    error: analysisResult.error || 'Failed to analyze URL',
                }));
                return;
            }

            if (!analysisResult.rawText) {
                setState(prev => ({
                    ...prev,
                    status: 'error',
                    error: 'No content found on this page',
                }));
                return;
            }

            setState(prev => ({
                ...prev,
                originalText: analysisResult.rawText || '',
                title: analysisResult.metadata?.title || 'Untitled',
                nextChapterUrl: analysisResult.metadata?.nextChapterUrl || null,
            }));

            // Step 2: Translate the content
            setState(prev => ({ ...prev, status: 'translating' }));

            const translationResult = await translateText(analysisResult.rawText, undefined, 'Chinese', 'Vietnamese', selectedModel);

            if (translationResult.status === 'error') {
                setState(prev => ({
                    ...prev,
                    status: 'error',
                    error: translationResult.error || 'Translation failed',
                }));
                return;
            }

            setState(prev => ({
                ...prev,
                status: 'complete',
                translatedText: translationResult.translatedText || '',
                progress: 100,
                totalChunks: translationResult.chunks || 1,
            }));

        } catch (error) {
            setState(prev => ({
                ...prev,
                status: 'error',
                error: error instanceof Error ? error.message : 'An unexpected error occurred',
            }));
        }
    }, [url]);

    const handleNextChapter = useCallback(() => {
        if (state.nextChapterUrl) {
            setUrl(state.nextChapterUrl);
            // Trigger submit after setting URL
            setTimeout(() => {
                const form = document.getElementById('url-form');
                if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
            }, 0);
        }
    }, [state.nextChapterUrl]);

    const handleReset = useCallback(() => {
        setUrl('');
        setState({
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
        });
    }, []);

    return (
        <div className="min-h-screen dark:bg-[#0a0a0b] bg-gray-50 dark:text-gray-100 text-gray-900">
            {/* Header */}
            <header className="border-b dark:border-gray-800/50 dark:bg-[#0a0a0b]/80 border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <BookOpen className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-100">Novel Translator</h1>
                            <p className="text-xs text-gray-500">Chinese → Vietnamese</p>
                        </div>
                    </div>

                    {/* Server Status */}
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${serverStatus === 'online' ? 'bg-green-400' :
                            serverStatus === 'offline' ? 'bg-red-400' : 'bg-yellow-400'
                            }`} />
                        <span className="text-xs text-gray-500">
                            {serverStatus === 'online' ? 'Server Online' :
                                serverStatus === 'offline' ? 'Server Offline' : 'Checking...'}
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
                {/* URL Input Form */}
                <AnimatePresence mode="wait">
                    {state.status === 'idle' || state.status === 'error' ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-8"
                        >
                            <form id="url-form" onSubmit={handleSubmit} className="space-y-4">
                                <div className="relative">
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="Paste novel chapter URL here..."
                                        className="w-full px-4 py-4 border rounded-xl dark:text-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all pr-24 dark:bg-gray-900/50 bg-white dark:border-gray-800 border-gray-300"
                                        disabled={serverStatus === 'offline'}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!url.trim() || serverStatus === 'offline'}
                                        className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2`}
                                    >
                                        <span>Translate</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Model Selection - Small selector below input */}
                                <ModelSelector
                                    selectedModel={selectedModel}
                                    onSelect={setSelectedModel}
                                    disabled={serverStatus === 'offline'}
                                />

                                {/* Error Message */}
                                {state.status === 'error' && state.error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400"
                                    >
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        <span>{state.error}</span>
                                    </motion.div>
                                )}
                            </form>

                            {/* Instructions */}
                            <div className="mt-6 text-center text-sm text-gray-500">
                                <p>Paste a URL from any novel site to translate it to Vietnamese</p>
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>

                {/* Loading State */}
                {(state.status === 'analyzing' || state.status === 'translating') && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-20"
                    >
                        <div className="relative mb-6">
                            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
                            <div className="absolute inset-0 w-12 h-12 border-2 border-indigo-400/20 rounded-full" />
                        </div>
                        <h2 className="text-xl font-medium mb-2 dark:text-gray-200 text-gray-800">
                            {state.status === 'analyzing' ? 'Analyzing Page...' : 'Translating...'}
                        </h2>
                        <p className="dark:text-gray-500 text-gray-600">                            {state.status === 'analyzing'
                            ? 'Extracting content from the URL'
                            : 'Translating content to Vietnamese'
                        }
                        </p>
                        {state.title && (
                            <p className="mt-4 text-indigo-400 font-medium">{state.title}</p>
                        )}
                    </motion.div>
                )}

                {/* Translation Complete - Reading View */}
                {state.status === 'complete' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        {/* Chapter Header */}
                        <div className="flex items-center justify-between pb-4 border-b dark:border-gray-800/50 border-gray-200">
                            <div>
                                <h2 className="text-2xl font-semibold dark:text-gray-100 text-gray-900">{state.title}</h2>
                                <p className="text-sm mt-1 dark:text-gray-500 text-gray-600">
                                    Translated from Chinese to Vietnamese
                                </p>
                            </div>
                            <button
                                onClick={handleReset}
                                className="p-2 rounded-lg transition-colors dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-800/50 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                title="Start over"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Translated Content */}
                        <article className="prose dark:prose-invert prose-lg max-w-none">
                            <div className="whitespace-pre-wrap leading-relaxed dark:text-gray-300 text-gray-700">
                                {state.translatedText}
                            </div>
                        </article>

                        {/* Navigation */}
                        {state.nextChapterUrl && (
                            <div className="pt-8 border-t dark:border-gray-800/50 border-gray-200">
                                <button
                                    onClick={handleNextChapter}
                                    className="w-full py-4 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 hover:border-indigo-500/50 rounded-xl text-indigo-400 font-medium transition-all flex items-center justify-center gap-2 group"
                                >
                                    <span>Read Next Chapter</span>
                                    <ChevronDown className="w-5 h-5 -rotate-90 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </main>
        </div>
    );
}
