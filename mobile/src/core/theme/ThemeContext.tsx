import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName, Platform } from 'react-native';
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
    const [themeType, setThemeTypeState] = useState<ThemeType | null>(null);
    const [isThemeLoaded, setIsThemeLoaded] = useState(false);
    const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(Appearance.getColorScheme());

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (storedTheme) {
                    setThemeTypeState(storedTheme as ThemeType);
                } else {
                    setThemeTypeState('system');
                }
            } catch (error) {
                console.error('Failed to load theme preference:', error);
                setThemeTypeState('system');
            } finally {
                setIsThemeLoaded(true);
            }
        };

        loadTheme();

        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            setSystemColorScheme(colorScheme);
        });

        return () => subscription.remove();
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
        if (!themeType) return;

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

    if (!isThemeLoaded || !themeType) return null;

    // 🔹 FORCE LIGHT THEME ON WEB
    const activeThemeType =
        Platform.OS === 'web'
            ? 'light'
            : themeType === 'system'
                ? systemColorScheme ?? 'light'
                : themeType;

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