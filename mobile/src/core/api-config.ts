import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { Logger } from './logger';

export const getApiBaseUrl = (): string => {
    const env = process.env.EXPO_PUBLIC_ENV || 'development';
    const configuredUrl = process.env.EXPO_PUBLIC_API_URL;

    // ✅ 1. Production / Staging / Test
    if (['production', 'staging', 'test'].includes(env)) {
        if (configuredUrl) {
            Logger.debug(`[Config] Using ENV API URL: ${configuredUrl}`);
            return configuredUrl;
        }
        Logger.warn(`[Config] Missing EXPO_PUBLIC_API_URL for ${env}`);
    }

    // ✅ 2. WEB (your browser case)
    if (Platform.OS === 'web') {
        const url = configuredUrl || 'http://localhost:8000/api/v1';
        Logger.debug(`[Config] Web API URL: ${url}`);
        return url;
    }

    // ✅ 3. ANDROID EMULATOR
    if (Platform.OS === 'android') {
        const url = configuredUrl || 'http://10.0.2.2:8000/api/v1';
        Logger.debug(`[Config] Android API URL: ${url}`);
        return url;
    }

    // ✅ 4. iOS Simulator
    if (Platform.OS === 'ios') {
        const url = configuredUrl || 'http://localhost:8000/api/v1';
        Logger.debug(`[Config] iOS API URL: ${url}`);
        return url;
    }

    // ✅ 5. REAL DEVICE (same WiFi)
    try {
        const hostUri = Constants.expoConfig?.hostUri;

        if (hostUri) {
            const hostIp = hostUri.split(':')[0];

            // ❗ Ignore tunnel domains
            if (!hostUri.includes('ngrok') && !hostUri.includes('expo.dev')) {
                const url = `http://${hostIp}:8000/api/v1`;
                Logger.debug(`[Config] Device API URL: ${url}`);
                return url;
            }
        }
    } catch (err) {
        Logger.error('[Config] Error detecting device IP', err);
    }

    // ✅ 6. FINAL FALLBACK
    const fallback = configuredUrl || 'http://localhost:8000/api/v1';
    Logger.warn(`[Config] Using fallback API URL: ${fallback}`);
    return fallback;
};