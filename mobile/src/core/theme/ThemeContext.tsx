import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ColorSchemeName } from 'react-native';
import { DarkTheme, LightTheme, Theme } from './theme';
import { Logger } from '@/core/logger';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextProps {
    theme: Theme;
    themeType: ThemeType;
    setThemeType: (type: ThemeType) => void;
    toggleTheme: () => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const THEME_STORAGE_KEY = 'ims_theme_preference';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    // Force light mode only — no dark mode or system preference support.
    // The app is designed as a light-theme-first product.
    const [themeType] = useState<ThemeType>('light');

    useEffect(() => {
        // Load persisted theme preference (light mode only)
        const loadTheme = async () => {
            try {
                // Always use light; discard any stored preferences for dark mode
                await AsyncStorage.removeItem(THEME_STORAGE_KEY);
            } catch (error) {
                console.error('Failed to clear theme preference:', error);
            }
        };
        loadTheme();
    }, []);

    const setThemeType = async (type: ThemeType) => {
        // Ignore attempts to change theme; always stay light
        if (type !== 'light') {
            Logger.debug('Theme change requested but light-only mode enforced');
        }
    };

    const toggleTheme = () => {
        // No-op: theme toggling is disabled in light-only mode
        Logger.debug('Theme toggle requested but light-only mode enforced');
    };

    const theme = LightTheme;
    const isDark = false;

    return (
        <ThemeContext.Provider value={{ theme, themeType: 'light', setThemeType, toggleTheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextProps => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
