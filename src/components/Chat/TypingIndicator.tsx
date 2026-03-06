import React from 'react';
import { motion } from 'motion/react';
import { Bot } from 'lucide-react';

/**
 * Animated "bot is typing" indicator — three bouncing dots.
 */
const TypingIndicator: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="flex gap-3 items-start"
        >
            {/* Bot avatar */}
            <div className="chat-avatar chat-avatar-bot shrink-0" aria-hidden="true">
                <Bot className="w-4 h-4" />
            </div>

            {/* Typing bubble */}
            <div className="chat-bubble chat-bubble-bot">
                <div className="flex items-center gap-1.5 py-1">
                    {[0, 1, 2].map((i) => (
                        <motion.span
                            key={i}
                            className="typing-dot"
                            animate={{ y: [0, -6, 0] }}
                            transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.15,
                                ease: 'easeInOut',
                            }}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default TypingIndicator;
