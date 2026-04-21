import { ColorPalettes } from '@/core/theme/tokens';
import { ThemedText } from '@/presentation/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

type TripActionButtonProps = {
    title: string;
    iconName: keyof typeof Ionicons.glyphMap;
    backgroundColor?: string;
    disabled?: boolean;
    onPress: () => void;
};

export function TripActionButton({
    title,
    iconName,
    backgroundColor = ColorPalettes.green[600],
    disabled,
    onPress,
}: TripActionButtonProps) {
    return (
        <Pressable
            disabled={disabled}
            onPress={onPress}
            style={({ pressed }) => [
                styles.button,
                { backgroundColor, opacity: pressed || disabled ? 0.8 : 1 },
            ]}
        >
            <View style={styles.contentRow}>
                <Ionicons name={iconName} size={18} color="#fff" />
                <ThemedText lightColor="#fff" darkColor="#fff" style={styles.label}>
                    {title}
                </ThemedText>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        minHeight: 58,
        borderRadius: 20,
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    label: {
        fontSize: 18,
        lineHeight: 22,
        fontWeight: '500',
    },
});
