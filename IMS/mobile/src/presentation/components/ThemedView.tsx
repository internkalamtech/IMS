import { View, type ViewProps } from 'react-native';

import { useTheme } from '@/core/theme/ThemeContext';

export type ThemedViewProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
    const { theme, isDark } = useTheme();

    // If specific light/dark colors are provided, use them, otherwise use theme background
    const backgroundColor = isDark ? darkColor : lightColor;

    // Use theme background as default if no specific color is provided
    const backgroundStyle = backgroundColor
        ? { backgroundColor }
        : { backgroundColor: theme.colors.background };

    return <View style={[backgroundStyle, style]} {...otherProps} />;
}
