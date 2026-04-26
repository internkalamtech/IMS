import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ColorSchemeName } from 'react-native';
import { DarkTheme, LightTheme, Theme } from './theme';

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
    // Force light mode by default so all screens match the blue UI design.
    // System dark mode is intentionally ignored — the app always starts light.
    const [themeType, setThemeTypeState] = useState<ThemeType>('light');
    const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>('light');

    useEffect(() => {
        // Load persisted theme preference (only honours 'light' or manual overrides)
        const loadTheme = async () => {
            try {
                const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                // Only restore if user explicitly set it; never restore 'system' (dark)
                if (storedTheme && storedTheme !== 'system') {
                    setThemeTypeState(storedTheme as ThemeType);
                }
            } catch (error) {
                console.error('Failed to load theme preference:', error);
            }
        };
        loadTheme();

        // We no longer follow system colour scheme changes
        // (app is designed as a light-theme-first product)
    }, []);

    const setThemeType = async (type: ThemeType) => {
        setThemeTypeState(type);
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, type);
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        }
    };

    const toggleTheme = () => {
        const nextTheme =
            themeType === 'light'
                ? 'dark'
                : themeType === 'dark'
                    ? 'light'
                    : systemColorScheme === 'dark'
                        ? 'light'
                        : 'dark';

        setThemeType(nextTheme);
    };

    const activeThemeType =
        themeType === 'system' ? systemColorScheme ?? 'light' : themeType;

    const theme = activeThemeType === 'dark' ? DarkTheme : LightTheme;
    const isDark = activeThemeType === 'dark';

    return (
        <ThemeContext.Provider value={{ theme, themeType, setThemeType, toggleTheme, isDark }}>
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
