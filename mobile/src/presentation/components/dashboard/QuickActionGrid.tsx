import { QuickAction } from '@/core/config/dashboard';
import { ThemedText } from '@/presentation/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface QuickActionGridProps {
    actions: QuickAction[];
    onActionPress?: (action: QuickAction) => void;
}

export function QuickActionGrid({ actions, onActionPress }: QuickActionGridProps) {
   return (
        <View style={styles.container}>
            {actions.map((action) => (
                <TouchableOpacity
                    key={action.id}
                    style={styles.item}
                    onPress={onActionPress ? () => onActionPress(action) : undefined}
                >
                    <View style={[styles.iconContainer, { backgroundColor: action.color + '15' }]}>
                        <Ionicons name={action.icon as any} size={28} color={action.color} />
                    </View>
                    <ThemedText style={styles.label}>{action.title}</ThemedText>
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
        gap: 20,
        marginBottom: 32,
    },
    item: {
        width: 100, // Fixed width for consistent grid look regardless of screen size
        alignItems: 'center',
        marginBottom: 8,
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
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '500',
    },
});
