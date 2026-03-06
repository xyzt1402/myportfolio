import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RotateCcw, ChevronDown, ArrowUp } from 'lucide-react';
import ChatMessage, { type Message } from '../components/Chat/ChatMessage';
import ChatInput from '../components/Chat/ChatInput';
import ChatSuggestions from '../components/Chat/ChatSuggestions';
import TypingIndicator from '../components/Chat/TypingIndicator';
import { findResponse, PERSONA_FULL_NAME } from '../data/chatKnowledge';

/** Simulated typing delay range (ms) */
const TYPING_DELAY_MIN = 600;
const TYPING_DELAY_MAX = 1400;

function randomDelay() {
    return Math.floor(Math.random() * (TYPING_DELAY_MAX - TYPING_DELAY_MIN) + TYPING_DELAY_MIN);
}

function generateId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const ChatLTV: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    // Scroll state
    const [showScrollDown, setShowScrollDown] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const scrollTopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    /** Check scroll position and update indicators */
    const updateScrollIndicators = useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el) return;

        const { scrollTop, scrollHeight, clientHeight } = el;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        const isAtBottom = distanceFromBottom < 40;
        // Only consider scrollable if there's meaningful overflow (> 80px)
        const isScrollable = scrollHeight > clientHeight + 80;

        // Show scroll-down arrow only during conversation when content is below
        setShowScrollDown(isScrollable && !isAtBottom);

        // Show scroll-to-top only during conversation when at bottom and scrollable
        if (isAtBottom && isScrollable) {
            if (scrollTopTimerRef.current) clearTimeout(scrollTopTimerRef.current);
            scrollTopTimerRef.current = setTimeout(() => setShowScrollTop(true), 800);
        } else {
            if (scrollTopTimerRef.current) clearTimeout(scrollTopTimerRef.current);
            setShowScrollTop(false);
        }
    }, []);

    // Scroll to bottom whenever messages change
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, scrollToBottom]);

    // Attach scroll listener
    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        el.addEventListener('scroll', updateScrollIndicators, { passive: true });
        updateScrollIndicators();
        return () => {
            el.removeEventListener('scroll', updateScrollIndicators);
            if (scrollTopTimerRef.current) clearTimeout(scrollTopTimerRef.current);
        };
    }, [updateScrollIndicators]);

    // Re-check after messages update
    useEffect(() => {
        // Small delay to let DOM settle after new messages
        const t = setTimeout(updateScrollIndicators, 100);
        return () => clearTimeout(t);
    }, [messages, isTyping, updateScrollIndicators]);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || isTyping) return;

        const userMessage: Message = {
            id: generateId(),
            role: 'user',
            content: text.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);
        setHasStarted(true);

        // Simulate bot "thinking" delay
        await new Promise((resolve) => setTimeout(resolve, randomDelay()));

        const responseText = findResponse(text);

        const botMessage: Message = {
            id: generateId(),
            role: 'assistant',
            content: responseText,
            timestamp: new Date(),
        };

        setIsTyping(false);
        setMessages((prev) => [...prev, botMessage]);
    }, [isTyping]);

    const handleSuggestionSelect = useCallback((prompt: string) => {
        sendMessage(prompt);
    }, [sendMessage]);

    const handleReset = useCallback(() => {
        setMessages([]);
        setInputValue('');
        setIsTyping(false);
        setHasStarted(false);
        setShowScrollDown(false);
        setShowScrollTop(false);
    }, []);

    const handleScrollDown = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const handleScrollTop = useCallback(() => {
        scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        setShowScrollTop(false);
    }, []);

    return (
        <div className="chat-page">
            {/* ── Header bar ── */}
            <div className="chat-header">
                <div className="chat-header-inner">
                    <div className="flex items-center gap-2.5">
                        <div className="chat-header-icon">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <h1 className="chat-header-title">ChatLTV</h1>
                            <p className="chat-header-subtitle">Ask about {PERSONA_FULL_NAME}'s experience</p>
                        </div>
                    </div>

                    {hasStarted && (
                        <motion.button
                            onClick={handleReset}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="chat-reset-btn"
                            aria-label="Start new conversation"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            New chat
                        </motion.button>
                    )}
                </div>
            </div>

            {/* ── Messages area (relative for scroll indicators) ── */}
            <div className="chat-scroll-wrapper">
                <div
                    ref={scrollContainerRef}
                    className="chat-messages-area"
                >
                    <div className="chat-messages-inner">
                        <AnimatePresence mode="popLayout">
                            {!hasStarted ? (
                                /* Empty state — welcome screen */
                                <motion.div
                                    key="welcome"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                    className="chat-welcome"
                                >
                                    {/* Animated logo */}
                                    <motion.div
                                        className="chat-welcome-icon"
                                        animate={{
                                            boxShadow: [
                                                '0 0 0 0 rgba(6,182,212,0)',
                                                '0 0 0 12px rgba(6,182,212,0.15)',
                                                '0 0 0 0 rgba(6,182,212,0)',
                                            ],
                                        }}
                                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                                    >
                                        <Sparkles className="w-7 h-7" style={{ color: 'var(--ds-accent)' }} />
                                    </motion.div>

                                    <motion.h2
                                        className="chat-welcome-title"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                    >
                                        Hi, I'm <span style={{ color: 'var(--ds-accent-text)' }}>LTV</span>
                                    </motion.h2>

                                    <motion.p
                                        className="chat-welcome-subtitle"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                    >
                                        Ask me anything about <strong>{PERSONA_FULL_NAME}</strong>'s professional background,
                                        skills, and projects.
                                    </motion.p>

                                    {/* Suggestion chips */}
                                    <ChatSuggestions onSelect={handleSuggestionSelect} />
                                </motion.div>
                            ) : (
                                /* Conversation */
                                <motion.div
                                    key="conversation"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="chat-conversation"
                                >
                                    {messages.map((msg, idx) => (
                                        <ChatMessage
                                            key={msg.id}
                                            message={msg}
                                            isLatest={idx === messages.length - 1}
                                        />
                                    ))}

                                    {/* Typing indicator */}
                                    <AnimatePresence>
                                        {isTyping && <TypingIndicator key="typing" />}
                                    </AnimatePresence>

                                    {/* Scroll anchor */}
                                    <div ref={messagesEndRef} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── Scroll-down indicator (content below) ── */}
                <AnimatePresence>
                    {showScrollDown && (
                        <motion.button
                            key="scroll-down"
                            onClick={handleScrollDown}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.2 }}
                            className="chat-scroll-indicator chat-scroll-down"
                            aria-label="Scroll to latest message"
                        >
                            <ChevronDown className="w-4 h-4" />
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* ── Scroll-to-top button (shown after reaching bottom) ── */}
                <AnimatePresence>
                    {showScrollTop && (
                        <motion.button
                            key="scroll-top"
                            onClick={handleScrollTop}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="chat-scroll-indicator chat-scroll-top"
                            aria-label="Scroll to top"
                        >
                            <ArrowUp className="w-4 h-4" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Input bar ── */}
            <div className="chat-input-bar">
                <div className="chat-input-bar-inner">
                    {/* Suggestion chips (compact row) shown after conversation starts */}
                    {hasStarted && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="chat-quick-chips"
                        >
                            {['Skills', 'Projects', 'Contact', 'Experience'].map((chip) => (
                                <button
                                    key={chip}
                                    onClick={() => sendMessage(chip)}
                                    disabled={isTyping}
                                    className="chat-quick-chip"
                                >
                                    {chip}
                                </button>
                            ))}
                        </motion.div>
                    )}

                    <ChatInput
                        value={inputValue}
                        onChange={setInputValue}
                        onSubmit={sendMessage}
                        disabled={isTyping}
                    />

                    <p className="chat-disclaimer">
                        ChatLTV may make mistakes. Verify important information directly with Việt.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatLTV;
