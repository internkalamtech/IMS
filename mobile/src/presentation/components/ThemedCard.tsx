import { StyleSheet, View, type ViewProps } from 'react-native';

import { useTheme } from '@/core/theme/ThemeContext';

export type ThemedCardProps = ViewProps & {
    padding?: number;
};

export function ThemedCard({
    style,
    padding = 16,
    children,
    ...rest
}: ThemedCardProps) {
    const { theme } = useTheme();

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                    shadowColor: theme.colors.primary,
                    padding,
                },
                style,
            ]}
            {...rest}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
});
