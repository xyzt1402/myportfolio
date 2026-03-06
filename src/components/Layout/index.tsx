import { Outlet, useLocation } from 'react-router';
import Header from '../Header';
import { ThemeProvider } from '../../context/ThemeContext';
import { TooltipProvider } from '../ui/Tooltip';

/**
 * Root layout — wraps every page with:
 *  - ThemeProvider (dark/light mode)
 *  - Radix UI TooltipProvider (required for all Tooltip components)
 *  - Header (fixed top navigation)
 *  - <main> content area with top padding to clear the fixed headers
 *
 * The chat page (/chat) gets special treatment:
 *  - overflow hidden on the wrapper (chat manages its own scroll)
 *  - reduced top padding (only clears the main header, not the subnav)
 */
const Layout: React.FC = () => {
    const location = useLocation();
    const isChat = location.pathname === '/chat';

    return (
        <ThemeProvider>
            <TooltipProvider delayDuration={300}>
                <div
                    className={`flex flex-col ${isChat ? 'h-dvh overflow-hidden' : 'min-h-dvh'}`}
                    style={{ background: 'var(--ds-bg)', color: 'var(--ds-text)' }}
                >
                    <Header />

                    {/*
                     * pt-14 = 3.5rem — clears only the fixed main header on chat page
                     * pt-28 = 7rem   — clears header (3.5rem) + subnav (3.5rem) on other pages
                     */}
                    <main className={`grow ${isChat ? 'pt-14 overflow-hidden flex flex-col' : 'pt-28'}`}>
                        <Outlet />
                    </main>
                </div>
            </TooltipProvider>
        </ThemeProvider>
    );
};

export default Layout;
