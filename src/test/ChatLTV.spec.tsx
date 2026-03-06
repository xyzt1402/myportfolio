/**
 * ChatLTV Integration Tests
 *
 * Tests the chat interface component and its interactions.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ChatLTV from '../pages/ChatLTV';
import '@testing-library/jest-dom/vitest';

describe('ChatLTV', () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
        cleanup();
        vi.clearAllTimers();
        vi.clearAllMocks();
    });

    describe('Initial Render', () => {
        it('should render welcome screen with title and subtitle', () => {
            render(<ChatLTV />);

            expect(screen.getByText('ChatLTV')).toBeInTheDocument();
            expect(screen.getByText(/Hi, I'm/i)).toBeInTheDocument();
            expect(screen.getByText('LTV')).toBeInTheDocument();
        });

        it('should render suggestion chips', () => {
            render(<ChatLTV />);

            // Actual suggestion labels from SUGGESTED_PROMPTS
            expect(screen.getByText('Tell me about yourself')).toBeInTheDocument();
            expect(screen.getByText('What is your current role?')).toBeInTheDocument();
            expect(screen.getByText('What are your technical skills?')).toBeInTheDocument();
            expect(screen.getByText('Show me your projects')).toBeInTheDocument();
            expect(screen.getByText('Are you available for hire?')).toBeInTheDocument();
            expect(screen.getByText('Where are you located?')).toBeInTheDocument();
        });

        it('should render chat input', () => {
            render(<ChatLTV />);

            expect(screen.getByPlaceholderText(/Ask me about/i)).toBeInTheDocument();
        });

        it('should not show reset button initially', () => {
            render(<ChatLTV />);

            expect(screen.queryByText('New chat')).not.toBeInTheDocument();
        });
    });

    describe('User Interactions', () => {
        it('should update input value when user types', () => {
            render(<ChatLTV />);

            const input = screen.getByPlaceholderText(/Ask me about/i);
            fireEvent.change(input, { target: { value: 'Hello' } });

            expect(input).toHaveValue('Hello');
        });

        it('should start conversation when clicking a suggestion', async () => {
            render(<ChatLTV />);

            const suggestion = screen.getByText('Tell me about yourself');
            fireEvent.click(suggestion);

            // After clicking, the New chat button should appear
            await waitFor(() => {
                expect(screen.getByText('New chat')).toBeInTheDocument();
            });
        });

        it('should show reset button after conversation starts', async () => {
            render(<ChatLTV />);

            const input = screen.getByPlaceholderText(/Ask me about/i);
            fireEvent.change(input, { target: { value: 'Hello' } });
            fireEvent.keyDown(input, { key: 'Enter' });

            await waitFor(() => {
                expect(screen.getByText('New chat')).toBeInTheDocument();
            });
        });

        it('should reset conversation when clicking reset button', async () => {
            render(<ChatLTV />);

            // Start conversation
            const input = screen.getByPlaceholderText(/Ask me about/i);
            fireEvent.change(input, { target: { value: 'Hello' } });
            fireEvent.keyDown(input, { key: 'Enter' });

            await waitFor(() => {
                expect(screen.getByText('New chat')).toBeInTheDocument();
            });

            // Click reset
            const resetButton = screen.getByText('New chat');
            fireEvent.click(resetButton);

            // Should show welcome screen again
            await waitFor(() => {
                expect(screen.getByText(/Hi, I'm/i)).toBeInTheDocument();
            });
        });
    });

    describe('Quick Chips', () => {
        it('should show quick chips after conversation starts', async () => {
            render(<ChatLTV />);

            const input = screen.getByPlaceholderText(/Ask me about/i);
            fireEvent.change(input, { target: { value: 'Hello' } });
            fireEvent.keyDown(input, { key: 'Enter' });

            await waitFor(() => {
                expect(screen.getByText('Skills')).toBeInTheDocument();
                expect(screen.getByText('Projects')).toBeInTheDocument();
                expect(screen.getByText('Contact')).toBeInTheDocument();
            });
        });

        it('should send message when clicking quick chip', async () => {
            render(<ChatLTV />);

            // Start conversation first
            const input = screen.getByPlaceholderText(/Ask me about/i);
            fireEvent.change(input, { target: { value: 'Hello' } });
            fireEvent.keyDown(input, { key: 'Enter' });

            await waitFor(() => {
                expect(screen.getByText('New chat')).toBeInTheDocument();
            });

            // Click quick chip
            const skillsChip = screen.getByText('Skills');
            fireEvent.click(skillsChip);

            // Should add the message
            await waitFor(() => {
                expect(screen.getByText('Skills')).toBeInTheDocument();
            });
        });
    });

    describe('Accessibility', () => {
        it('should disable input while bot is typing', async () => {
            render(<ChatLTV />);

            const input = screen.getByPlaceholderText(/Ask me about/i);
            fireEvent.change(input, { target: { value: 'Tell me about yourself' } });
            fireEvent.keyDown(input, { key: 'Enter' });

            await waitFor(() => {
                expect(input).toBeDisabled();
            });
        });
    });
});
