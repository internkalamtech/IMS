import { StyleSheet, Text, type TextProps } from 'react-native';
import { useTheme } from '@/core/theme/ThemeContext';
export type ThemedTextProps = TextProps & {
    lightColor?: string;
    darkColor?: string;
    color?: string;
    type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
    style,
    lightColor,
    darkColor,
    color,
    type = 'default',
    ...rest
}: ThemedTextProps) {
    const { theme, isDark } = useTheme();

    // Color priority: explicit color > light/dark color > type default
    const selectedColor =
    color ??
    (isDark ? darkColor : lightColor) ??
    (type === 'link' ? theme.colors.primary : theme.colors.foreground);
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
