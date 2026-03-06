import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getCookie, setCookie } from '../utils/cookies';

export type Theme = 'light' | 'dark';

interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
}

const defaultValue: ThemeContextValue = {
    theme: 'light',
    toggleTheme: () => { },
};

export const ThemeContext = createContext<ThemeContextValue>(defaultValue);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        // Check cookie for saved theme preference
        const savedTheme = getCookie('themeLTVPortfolio') as Theme | undefined;
        if (savedTheme === 'light' || savedTheme === 'dark') {
            return savedTheme;
        }
        // Default to dark theme
        return 'dark';
    });


    // Apply theme and save to cookie
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        setCookie('themeLTVPortfolio', theme);
    }, [theme]);

    const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
    );
};

export const useTheme = () => React.useContext(ThemeContext);
