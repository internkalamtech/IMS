import { useTheme } from '@/core/theme/ThemeContext';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';
import { ThemedText } from './ThemedText';

export type ThemedButtonProps = PressableProps & {
    title: string;
    type?: 'primary' | 'secondary' | 'outline';
    lightColor?: string;
    darkColor?: string;
};

export function ThemedButton({
    title,
    type = 'primary',
    style,
    lightColor,
    darkColor,
    disabled,
    ...rest
}: ThemedButtonProps) {
    const { theme } = useTheme();

    let backgroundColor = theme.colors.primary;
    let textColor = theme.colors.primaryForeground;
    let borderColor: string | undefined;

    if (type === 'secondary') {
        backgroundColor = theme.colors.secondary;
        textColor = theme.colors.secondaryForeground;
    } else if (type === 'outline') {
        backgroundColor = 'transparent';
        textColor = theme.colors.primary;
        borderColor = theme.colors.border;
    }

    if (disabled) {
        backgroundColor = theme.colors.muted;
        textColor = theme.colors.mutedForeground;
        borderColor = 'transparent';
    }

    return (
        <Pressable
            style={(state) => [
                styles.button,
                { backgroundColor },
                borderColor ? { borderWidth: 1, borderColor } : undefined,
                { opacity: state.pressed ? 0.8 : 1 },
                typeof style === 'function' ? style(state) : style,
            ]}
            disabled={disabled}
            {...rest}
        >
            <ThemedText
                type="defaultSemiBold"
                style={{ color: textColor, textAlign: 'center' }}
            >
                {title}
            </ThemedText>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
