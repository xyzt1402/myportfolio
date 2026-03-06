import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Button from '../ui/Button';

interface ScrollIndicatorProps {
    /** Delay in milliseconds before showing initial scroll indicator */
    initialDelay?: number;
    /** Delay in milliseconds before showing end scroll indicator */
    endDelay?: number;
    /** Contact section ID to scroll to */
    contactId?: string;
}

const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
    initialDelay = 2500,
    endDelay = 2000,
    contactId = 'contact',
}) => {
    const [showScrollHint, setShowScrollHint] = useState(false);
    const [showContactHint, setShowContactHint] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(false);
    const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastActivityRef = useRef<number>(Date.now());

    const checkIfAtBottom = useCallback(() => {
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // Consider "at bottom" if within 50px of the bottom
        const atBottom = scrollTop + windowHeight >= documentHeight - 50;
        setIsAtBottom(atBottom);
        return atBottom;
    }, []);

    // Use similar logic to SubNav but inverted:
    // - Show scroll hint when there's no activity (SubNav is hidden)
    // - Hide scroll hint when user is active (SubNav is visible)
    const handleActivity = useCallback(() => {
        lastActivityRef.current = Date.now();
        setShowScrollHint(false);

        // Clear existing timer
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
        }

        // Set timer to show scroll hint after inactivity
        if (!checkIfAtBottom()) {
            inactivityTimerRef.current = setTimeout(() => {
                if (!checkIfAtBottom()) {
                    setShowScrollHint(true);
                }
            }, initialDelay);
        }
    }, [initialDelay, checkIfAtBottom]);

    useEffect(() => {
        // Initial timer to show scroll hint
        const initialTimer = setTimeout(() => {
            if (!checkIfAtBottom()) {
                setShowScrollHint(true);
            }
        }, initialDelay);

        // Check scroll position
        const scrollHandler = () => {
            if (checkIfAtBottom()) {
                setShowScrollHint(false);
            }
        };

        window.addEventListener('scroll', scrollHandler);

        // Also check on resize
        window.addEventListener('resize', checkIfAtBottom);

        return () => {
            clearTimeout(initialTimer);
            window.removeEventListener('scroll', scrollHandler);
            window.removeEventListener('resize', checkIfAtBottom);
        };
    }, [initialDelay, checkIfAtBottom]);

    // Watch for being at bottom to show contact hint
    useEffect(() => {
        if (!isAtBottom) {
            setShowContactHint(false);
            return;
        }

        // User is at bottom, show contact hint after delay
        const endTimer = setTimeout(() => {
            setShowContactHint(true);
        }, endDelay);

        return () => clearTimeout(endTimer);
    }, [isAtBottom, endDelay]);

    // Handle click on contact button
    const handleContactClick = () => {
        const contactElement = document.getElementById(contactId);
        if (contactElement) {
            contactElement.scrollIntoView({ behavior: 'smooth' });
        }
        setShowContactHint(false);
    };

    // Track user activity to show/hide scroll indicator (opposite of SubNav)
    useEffect(() => {
        const handleMouseMove = () => handleActivity();
        const handleWheel = () => handleActivity();
        const handleKeyDown = () => handleActivity();

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('wheel', handleWheel, { passive: true });
        window.addEventListener('keydown', handleKeyDown);

        // Start the inactivity timer
        handleActivity();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('keydown', handleKeyDown);
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
            }
        };
    }, [handleActivity]);

    return (
        <div
            className="fixed z-50 pointer-events-none"
            style={{
                bottom: showContactHint ? '24px' : '80px',
                left: '50%',
                transform: 'translateX(-50%)'
            }}
        >
            <AnimatePresence mode="wait">
                {showContactHint && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                        className="pointer-events-auto"
                    >
                        <div
                            className="flex flex-col items-center gap-2"
                            style={{
                                background: 'var(--ds-bg-overlay)',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                border: '1px solid var(--ds-border)'
                            }}
                        >
                            <span
                                className="text-sm font-medium"
                                style={{ color: 'var(--ds-text)' }}
                            >
                                👋 Reach out for collaborations!
                            </span>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleContactClick}
                                className="flex items-center gap-2"
                            >
                                <MessageCircle className="w-4 h-4" />
                                Contact Me
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showScrollHint && !isAtBottom && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center gap-1"
                        style={{
                            background: 'var(--ds-bg-overlay)',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                            border: '1px solid var(--ds-border)'
                        }}
                    >
                        <span
                            className="text-xs font-medium"
                            style={{ color: 'var(--ds-text-subtle)' }}
                        >
                            Scroll to explore
                        </span>
                        <motion.div
                            animate={{ y: [0, 5, 0] }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <ChevronDown
                                className="w-5 h-5"
                                style={{ color: 'var(--ds-accent-text)' }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ScrollIndicator;
