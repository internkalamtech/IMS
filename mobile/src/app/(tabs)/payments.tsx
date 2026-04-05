import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/core/theme/ThemeContext';

export default function PaymentsScreen() {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Payments</Text>
            <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.info, { color: theme.colors.text }]}>Manage your payments and review financial summary here.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    card: {
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
    },
    info: {
        fontSize: 16,
    },
});
