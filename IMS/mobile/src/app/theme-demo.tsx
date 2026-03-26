import { Stack } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../core/theme/ThemeContext';
import { ThemedText } from '../presentation/components/ThemedText';
import { ThemedView } from '../presentation/components/ThemedView';

export default function ThemeDemoScreen() {
    const { toggleTheme, themeType, isDark } = useTheme();

    return (
        <>
            <Stack.Screen options={{ title: 'Theme Demo', headerShown: true }} />
            <ThemedView style={styles.container}>
                <ThemedText type="title">Theme Demo</ThemedText>
                <ThemedText style={styles.subtitle}>Current Theme: {themeType}</ThemedText>
                <ThemedText style={styles.subtitle}>Active Mode: {isDark ? 'Dark' : 'Light'}</ThemedText>

                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        { opacity: pressed ? 0.8 : 1 },
                    ]}
                    onPress={toggleTheme}
                >
                    <ThemedText style={styles.buttonText} lightColor="#fff" darkColor="#000">
                        Toggle Theme
                    </ThemedText>
                </Pressable>

                <ThemedView style={styles.card} lightColor="#f0f0f0" darkColor="#333">
                    <ThemedText type="subtitle">Card Component</ThemedText>
                    <ThemedText>This is a card that adapts to the theme.</ThemedText>
                </ThemedView>

                <ThemedView style={styles.section}>
                    <ThemedText type="title">Typography</ThemedText>
                    <ThemedText type="default">Default</ThemedText>
                    <ThemedText type="defaultSemiBold">Default SemiBold</ThemedText>
                    <ThemedText type="subtitle">Subtitle</ThemedText>
                    <ThemedText type="link">Link</ThemedText>
                </ThemedView>
            </ThemedView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    subtitle: {
        fontSize: 18,
        marginVertical: 10,
    },
    button: {
        backgroundColor: '#0a7ea4',
        padding: 15,
        borderRadius: 10,
        marginVertical: 20,
    },
    buttonText: {
        fontWeight: 'bold',
    },
    card: {
        padding: 20,
        borderRadius: 10,
        width: '100%',
        marginVertical: 10,
    },
    section: {
        width: '100%',
        marginTop: 20,
        gap: 10,
    }
});
