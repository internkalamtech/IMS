import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/core/theme/ThemeContext';
import { ThemedText } from './ThemedText';

export type ThemedTextInputProps = TextInputProps & {
    label?: string;
    error?: string;
};

export function ThemedTextInput({
    style,
    placeholderTextColor,
    label,
    error,
    ...rest
}: ThemedTextInputProps) {
    const { theme, isDark } = useTheme();

    const borderColor = error ? theme.colors.destructive : theme.colors.border;
    const backgroundColor = theme.colors.input;

    return (
        <View style={styles.container}>
            {label && (
                <ThemedText style={styles.label}>{label}</ThemedText>
            )}
            <TextInput
                style={[
                    styles.input,
                    {
                        color: theme.colors.foreground,
                        backgroundColor,
                        borderColor,
                    },
                    style,
                ]}
                placeholderTextColor={
                    placeholderTextColor ?? theme.colors.mutedForeground
                }
                {...rest}
            />
            {error && (
                <ThemedText style={{ color: theme.colors.destructive, fontSize: 12, marginTop: 4 }}>
                    {error}
                </ThemedText>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
    },
});
