import { useTheme } from '@/core/theme/ThemeContext';
import { useAuth } from '@/presentation/hooks/useAuth';
import LoginScreen from '@/presentation/screens/LoginScreen';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
    const { user, loading } = useAuth();
    const { theme } = useTheme();

    if (loading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: theme.colors.background,
                }}
            >
                <ActivityIndicator
                    size="large"
                    color={theme.colors.primary}
                />
            </View>
        );
    }

    if (!user) {
        return <LoginScreen />;
    }

    return <Redirect href="/(tabs)" />;
}
