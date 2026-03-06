import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Mic } from 'lucide-react';

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

/**
 * Gemini-style chat input bar.
 * Auto-resizes textarea, submits on Enter (Shift+Enter for newline).
 */
const ChatInput: React.FC<ChatInputProps> = ({
    value,
    onChange,
    onSubmit,
    disabled = false,
    placeholder = 'Ask me about Việt\'s experience…',
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        const trimmed = value.trim();
        if (!trimmed || disabled) return;
        onSubmit(trimmed);
    };

    const canSubmit = value.trim().length > 0 && !disabled;

    return (
        <div className="chat-input-wrapper">
            <div className="chat-input-container">
                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={1}
                    className="chat-input-textarea"
                    aria-label="Chat message input"
                />

                {/* Action buttons */}
                <div className="chat-input-actions">
                    {/* Send button */}
                    <motion.button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        whileHover={canSubmit ? { scale: 1.08 } : {}}
                        whileTap={canSubmit ? { scale: 0.92 } : {}}
                        className={`chat-send-btn ${canSubmit ? 'chat-send-btn-active' : 'chat-send-btn-inactive'}`}
                        aria-label="Send message"
                    >
                        <Send className="w-4 h-4" />
                    </motion.button>
                </div>
            </div>

            {/* Hint */}
            <p className="chat-input-hint">
                Press <kbd className="chat-kbd">Enter</kbd> to send · <kbd className="chat-kbd">Shift+Enter</kbd> for new line
            </p>
        </div>
    );
};

export default ChatInput;
