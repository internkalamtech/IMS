import { getApiBaseUrl } from '@/core/api-config';
import { useTheme } from '@/core/theme/ThemeContext';
import { Link } from 'expo-router';
import { Linking, Pressable, Text, View } from 'react-native';

const getBackendDocsUrl = (): string => {
  const apiBase = getApiBaseUrl();

  if (apiBase.endsWith('/api/v1')) {
    return `${apiBase.slice(0, -7)}/docs`;
  }

  return `${apiBase}/docs`;
};

export default function DocsRoute() {
  const { theme } = useTheme();
  const docsUrl = getBackendDocsUrl();

  const openDocs = async () => {
    await Linking.openURL(docsUrl);
  };

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
        backgroundColor: theme.colors.background,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: '700',
          color: theme.colors.foreground,
          marginBottom: 12,
        }}
      >
        API Docs Redirect
      </Text>

      <Text style={{ color: theme.colors.mutedForeground, marginBottom: 24 }}>
        This app route points to backend Swagger docs. Use the button below to
        open the API documentation.
      </Text>

      <Pressable
        onPress={openDocs}
        style={{
          backgroundColor: theme.colors.primary,
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 10,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600', textAlign: 'center' }}>
          Open Backend Docs
        </Text>
      </Pressable>

      <Text style={{ color: theme.colors.mutedForeground, marginBottom: 8 }}>
        Expected docs URL:
      </Text>
      <Text selectable style={{ color: theme.colors.foreground }}>
        {docsUrl}
      </Text>

      <View style={{ marginTop: 20 }}>
        <Link href="/" style={{ color: theme.colors.primary, fontWeight: '600' }}>
          Back to Home
        </Link>
      </View>
    </View>
  );
}
