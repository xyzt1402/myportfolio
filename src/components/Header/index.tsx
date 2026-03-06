import { NavLink, useLocation } from 'react-router';
import { Sun, Moon, Mail, FileText, MessageSquare, BookOpen } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'motion/react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { Navbar } from '../SubNav';


interface NavItem {
    to: string;
    label: string;
    icon: React.ElementType;
    match: string;
}

const navItems: NavItem[] = [
    { to: '/', label: 'Resume', icon: FileText, match: '' },
    { to: '/chat', label: 'ChatLTV', icon: MessageSquare, match: 'chat' },
    { to: '/translate', label: 'Translator', icon: BookOpen, match: 'translate' },
];

const Header = () => {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const isDark = theme === 'dark';

    return (
        <>
            <motion.header
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="fixed top-0 left-0 right-0 z-50 py-3 backdrop-blur-xl border-b ds-transition-colors"
                style={{
                    background: isDark ? 'rgba(9,9,11,0.85)' : 'rgba(255,255,255,0.85)',
                    borderColor: 'var(--ds-border)',
                }}
            >
                <div className="ds-container">
                    <div className="flex items-center justify-between">

                        {/* Logo */}
                        <motion.div
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                        >
                            <NavLink
                                to="/"
                                className="text-xl font-extrabold tracking-tight ds-gradient-text-neutral"
                                aria-label="LTV – Home"
                            >
                                LTV
                            </NavLink>
                        </motion.div>

                        {/* Navigation */}
                        <NavigationMenu.Root>
                            <NavigationMenu.List className="ds-nav-menu-list">
                                {navItems.map(({ to, label, icon: Icon, match }) => {
                                    const isActive = location.pathname.replace(/^\//, '') === match;

                                    return (
                                        <NavigationMenu.Item key={to}>
                                            <NavigationMenu.Link asChild>
                                                <NavLink to={to}>
                                                    <motion.span
                                                        className="ds-nav-item"
                                                        data-active={isActive}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.97 }}
                                                    >
                                                        <Icon className="w-4 h-4 shrink-0" />
                                                        <span className="hidden sm:inline">{label}</span>

                                                        {/* Animated active indicator */}
                                                        {isActive && (
                                                            <motion.span
                                                                layoutId="header-active"
                                                                className="ds-nav-indicator"
                                                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                                            />
                                                        )}
                                                    </motion.span>
                                                </NavLink>
                                            </NavigationMenu.Link>
                                        </NavigationMenu.Item>
                                    );
                                })}

                                {/* Contact CTA */}
                                <NavigationMenu.Item>
                                    <motion.a
                                        href="mailto:xyzt1402@gmail.com"
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.96 }}
                                        className="hidden md:inline-flex ds-btn ds-btn-primary ds-btn-sm ml-2"
                                    >
                                        <Mail className="w-3.5 h-3.5" />
                                        Contact
                                    </motion.a>
                                </NavigationMenu.Item>
                            </NavigationMenu.List>
                        </NavigationMenu.Root>

                        {/* Theme toggle */}
                        <motion.button
                            onClick={toggleTheme}
                            whileHover={{ scale: 1.08, rotate: 15 }}
                            whileTap={{ scale: 0.92 }}
                            className="ds-btn ds-btn-ghost ds-btn-icon"
                            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {isDark
                                ? <Sun className="w-5 h-5" style={{ color: 'var(--color-brand-300)' }} />
                                : <Moon className="w-5 h-5" style={{ color: 'var(--color-brand-700)' }} />
                            }
                        </motion.button>
                    </div>
                </div>
            </motion.header>

            {/* Sub-navigation bar — hidden on the chat and translate pages */}
            {location.pathname !== '/chat' && location.pathname !== '/translate' && <Navbar isDarkMode={isDark} />}
        </>
    );
};

export default Header;
