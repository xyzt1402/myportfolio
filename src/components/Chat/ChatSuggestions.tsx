import React from 'react';
import { motion } from 'motion/react';
import { SUGGESTED_PROMPTS } from '../../data/chatKnowledge';

interface ChatSuggestionsProps {
    onSelect: (prompt: string) => void;
}

/**
 * Gemini-style suggestion chips shown on the empty state.
 * Clicking a chip sends the prompt immediately.
 */
const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({ onSelect }) => {
    return (
        <div className="chat-suggestions-grid">
            {SUGGESTED_PROMPTS.map((prompt, i) => (
                <motion.button
                    key={prompt.label}
                    onClick={() => onSelect(prompt.label)}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="chat-suggestion-chip"
                >
                    <span className="chat-suggestion-icon" aria-hidden="true">
                        {prompt.icon}
                    </span>
                    <span className="chat-suggestion-label">{prompt.label}</span>
                </motion.button>
            ))}
        </div>
    );
};

export default ChatSuggestions;
