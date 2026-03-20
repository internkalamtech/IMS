import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedView } from '@/presentation/components/ThemedView';

export default function AlertsTab() {
    return (
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ThemedText type="subtitle">Recent Alerts</ThemedText>
            <ThemedText lightColor="#666">No new notifications</ThemedText>
        </ThemedView>
    );
}
