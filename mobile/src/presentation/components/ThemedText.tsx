import { StyleSheet, Text, type TextProps } from 'react-native';

import { useTheme } from '@/core/theme/ThemeContext';
import { ThemeColors } from '@/core/theme/theme';

export type ThemedTextProps = TextProps & {
    lightColor?: string;
    darkColor?: string;
    type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
    color?: keyof ThemeColors; // Support for semantic theme colors
};

export function ThemedText({
    style,
    lightColor,
    darkColor,
    type = 'default',
    color: themeColorKey,
    ...rest
}: ThemedTextProps) {
    const { theme, isDark } = useTheme();

    const textColor = isDark ? darkColor : lightColor;

    // Determine color priority:
    // 1. Explicit light/dark prop
    // 2. Semantic theme color key (e.g. 'primary')
    // 3. Default based on type
    // 4. Default foreground

    let selectedColor = textColor;
    if (!selectedColor && themeColorKey) {
        selectedColor = theme.colors[themeColorKey];
    }
    if (!selectedColor) {
        if (type === 'link') {
            selectedColor = theme.colors.primary;
        } else {
            selectedColor = theme.colors.foreground;
        }
    }

    return (
        <Text
            style={[
                { color: selectedColor },
                type === 'default' ? styles.default : undefined,
                type === 'title' ? styles.title : undefined,
                type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
                type === 'subtitle' ? styles.subtitle : undefined,
                type === 'link' ? styles.link : undefined,
                style,
            ]}
            {...rest}
        />
    );
}

const styles = StyleSheet.create({
    default: {
        fontSize: 16,
        lineHeight: 24,
    },
    defaultSemiBold: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '600',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        lineHeight: 32,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    link: {
        lineHeight: 30,
        fontSize: 16,
        // Color is handled in component logic now
    },
});
