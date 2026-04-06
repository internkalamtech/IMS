import { StyleSheet, Text, type TextProps } from 'react-native';
import { useTheme } from '@/core/theme/ThemeContext';
export type ThemedTextProps = TextProps & {
    lightColor?: string;
    darkColor?: string;
    type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
    style,
    lightColor,
    darkColor,
    type = 'default',
    ...rest
}: ThemedTextProps) {
    const { theme, isDark } = useTheme();

    // Simplified color priority:
    // 1. Explicit light/dark color props
    // 2. Default based on type
    let selectedColor: string | undefined;

    // Second priority: explicit light/dark colors
    if (!selectedColor) {
        selectedColor = isDark ? darkColor : lightColor;
    }

    // Third priority: type-based defaults
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
