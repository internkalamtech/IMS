import { QuickAction } from '@/core/config/dashboard';
import { ThemedText } from '@/presentation/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface QuickActionGridProps {
    actions: QuickAction[];
    onActionPress?: (action: QuickAction) => void;
}

export function QuickActionGrid({ actions, onActionPress }: QuickActionGridProps) {
    const router = useRouter();

    const handlePress = (action: QuickAction) => {
        if (onActionPress) {
            onActionPress(action);
            return;
        }
        if (action.route) {
            router.push(action.route as any);
        }
    };

    return (
        <View style={styles.container}>
            {actions.map((action) => (
                <TouchableOpacity
                    key={action.id}
                    style={styles.item}
                    onPress={() => handlePress(action)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.iconContainer, { backgroundColor: action.color + '18' }]}>
                        <Ionicons name={action.icon as any} size={26} color={action.color} />
                    </View>
                    <ThemedText style={styles.label} numberOfLines={1}>{action.title}</ThemedText>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        gap: 16,
        marginBottom: 32,
    },
    item: {
        width: 72,
        alignItems: 'center',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 11,
        textAlign: 'center',
        fontWeight: '500',
    },
});
