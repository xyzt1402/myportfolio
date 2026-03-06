import React from 'react';
import { motion } from 'motion/react';
import { User, Bot } from 'lucide-react';

export type MessageRole = 'user' | 'assistant';

export interface Message {
    id: string;
    role: MessageRole;
    content: string;
    timestamp: Date;
}

interface ChatMessageProps {
    message: Message;
    isLatest?: boolean;
}

/**
 * Renders a single chat message bubble.
 * User messages appear on the right; assistant messages on the left.
 * Supports basic markdown: **bold**, *italic*, bullet lists, numbered lists,
 * inline `code`, and line breaks.
 */
const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLatest = false }) => {
    const isUser = message.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start`}
        >
            {/* Avatar */}
            <div
                className={`chat-avatar shrink-0 ${isUser ? 'chat-avatar-user' : 'chat-avatar-bot'}`}
                aria-hidden="true"
            >
                {isUser
                    ? <User className="w-4 h-4" />
                    : <Bot className="w-4 h-4" />
                }
            </div>

            {/* Bubble */}
            <div className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-bot'}`}>
                <MarkdownContent content={message.content} />

                {/* Timestamp */}
                <p className="chat-timestamp">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </motion.div>
    );
};

/** Minimal markdown renderer — no external deps */
const MarkdownContent: React.FC<{ content: string }> = ({ content }) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Empty line → spacer
        if (line.trim() === '') {
            elements.push(<div key={`space-${i}`} className="h-2" />);
            i++;
            continue;
        }

        // Heading (## or ###)
        if (line.startsWith('### ')) {
            elements.push(
                <h4 key={i} className="chat-md-h4">
                    {renderInline(line.slice(4))}
                </h4>
            );
            i++;
            continue;
        }
        if (line.startsWith('## ')) {
            elements.push(
                <h3 key={i} className="chat-md-h3">
                    {renderInline(line.slice(3))}
                </h3>
            );
            i++;
            continue;
        }
        if (line.startsWith('# ')) {
            elements.push(
                <h2 key={i} className="chat-md-h2">
                    {renderInline(line.slice(2))}
                </h2>
            );
            i++;
            continue;
        }

        // Unordered list
        if (line.startsWith('- ') || line.startsWith('* ')) {
            const items: React.ReactNode[] = [];
            while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
                items.push(
                    <li key={i} className="chat-md-li">
                        {renderInline(lines[i].slice(2))}
                    </li>
                );
                i++;
            }
            elements.push(<ul key={`ul-${i}`} className="chat-md-ul">{items}</ul>);
            continue;
        }

        // Ordered list
        if (/^\d+\.\s/.test(line)) {
            const items: React.ReactNode[] = [];
            while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
                const text = lines[i].replace(/^\d+\.\s/, '');
                items.push(
                    <li key={i} className="chat-md-li">
                        {renderInline(text)}
                    </li>
                );
                i++;
            }
            elements.push(<ol key={`ol-${i}`} className="chat-md-ol">{items}</ol>);
            continue;
        }

        // Regular paragraph
        elements.push(
            <p key={i} className="chat-md-p">
                {renderInline(line)}
            </p>
        );
        i++;
    }

    return <div className="chat-md-root">{elements}</div>;
};

/**
 * Renders inline markdown: **bold**, *italic*, `code`, and emoji passthrough.
 */
function renderInline(text: string): React.ReactNode {
    const parts: React.ReactNode[] = [];
    // Pattern: **bold**, *italic*, `code`
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let keyCounter = 0;

    while ((match = regex.exec(text)) !== null) {
        // Text before match
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        if (match[0].startsWith('**')) {
            parts.push(<strong key={keyCounter++} className="chat-md-bold">{match[2]}</strong>);
        } else if (match[0].startsWith('*')) {
            parts.push(<em key={keyCounter++} className="chat-md-italic">{match[3]}</em>);
        } else if (match[0].startsWith('`')) {
            parts.push(<code key={keyCounter++} className="chat-md-code">{match[4]}</code>);
        }

        lastIndex = match.index + match[0].length;
    }

    // Remaining text
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    if (parts.length === 0) return text;
    if (parts.length === 1 && typeof parts[0] === 'string') return parts[0];
    return <>{parts}</>;
}

export default ChatMessage;
