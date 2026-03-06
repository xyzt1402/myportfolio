import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Code2, GraduationCap, Briefcase, FolderOpen, Mail } from 'lucide-react';

interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
}

const navItems: NavItem[] = [
    { id: 'hero', label: 'Home', icon: Home },
    { id: 'expertise', label: 'Expertise', icon: Code2 },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'contact', label: 'Contact', icon: Mail },
];

interface NavbarProps {
    onSectionChange?: (section: string) => void;
    onVisibilityChange?: (visible: boolean) => void;
    isDarkMode?: boolean;
}

export function Navbar({
    onSectionChange,
    onVisibilityChange,
    isDarkMode = true,
}: NavbarProps) {
    const [activeSection, setActiveSection] = useState('hero');
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const scrollToSection = useCallback((sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (!element) {
            return;
        }
        const offset = 140; // header + subnav height
        const top = element.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    }, []);

    useEffect(() => {
        let inactivityTimer: ReturnType<typeof setTimeout>;

        const resetInactivity = () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => setIsVisible(false), 2500);
        };

        const handleActivity = () => {
            setIsVisible(true);
            resetInactivity();
        };

        const handleScroll = () => {
            const currentY = window.scrollY;

            setLastScrollY(currentY);

            // Determine active section
            const current = navItems.find(({ id }) => {
                const el = document.getElementById(id);
                if (!el) return false;
                const { top, bottom } = el.getBoundingClientRect();
                return top <= 160 && bottom >= 160;
            });

            if (current) {
                setActiveSection(current.id);
                onSectionChange?.(current.id);
            }

            resetInactivity();
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('mousemove', handleActivity, { passive: true });
        window.addEventListener('wheel', handleActivity, { passive: true });
        window.addEventListener('keydown', handleActivity);

        resetInactivity();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('wheel', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            clearTimeout(inactivityTimer);
        };
    }, [lastScrollY, onSectionChange]);

    useEffect(() => {
        onVisibilityChange?.(isVisible);
    }, [isVisible, onVisibilityChange]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.nav
                    initial={{ y: -60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -60, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="fixed top-14 left-0 right-0 z-40 py-2 backdrop-blur-xl border-b ds-transition-colors"
                    style={{
                        background: isDarkMode ? 'rgba(9,9,11,0.85)' : 'rgba(255,255,255,0.85)',
                        borderColor: 'var(--ds-border)',
                    }}
                    aria-label="Page sections"
                >
                    <div className="ds-container">
                        <div className="flex items-center justify-center">
                            <div className="flex items-center gap-0.5">
                                {navItems.map(({ id, label, icon: Icon }) => {
                                    const isActive = activeSection === id;

                                    return (
                                        <button
                                            key={id}
                                            onClick={() => scrollToSection(id)}
                                            className="ds-nav-item"
                                            data-active={isActive}
                                            aria-current={isActive ? 'true' : undefined}
                                        >
                                            <Icon className="w-4 h-4 shrink-0" />
                                            <span className="hidden sm:inline">{label}</span>

                                            {/* Animated active indicator */}
                                            {isActive && (
                                                <motion.span
                                                    layoutId="subnav-active"
                                                    className="ds-nav-indicator"
                                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </motion.nav>
            )}
        </AnimatePresence>
    );
}
