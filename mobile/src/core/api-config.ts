import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { Logger } from './logger';

/**
 * Dynamically determines the API gateway URL based on the current environment and platform.
 * 
 * Logic:
 * 1. If EXPO_PUBLIC_ENV is 'production', 'staging', or 'test', uses EXPO_PUBLIC_API_URL.
 * 2. In 'development':
 *    - Web: Uses 'localhost' or EXPO_PUBLIC_API_URL.
 *    - Native: Detects the host machine's IP address using Expo Constants to allow
 *      connection to a local backend from physical devices and emulators.
 */
export const getApiBaseUrl = (): string => {
    const env = process.env.EXPO_PUBLIC_ENV || 'development';
    const configuredUrl = process.env.EXPO_PUBLIC_API_URL;

    // 1. Production/Staging/Test priority
    if (['production', 'staging', 'test'].includes(env)) {
        if (configuredUrl) {
            return configuredUrl;
        }
        Logger.warn(`[Config] EXPO_PUBLIC_ENV is ${env} but EXPO_PUBLIC_API_URL is missing.`);
    }

    // 2. Web Development
    if (Platform.OS === 'web') {
        // On web, if configuredUrl is set (e.g. to a local IP), use it, otherwise localhost
        return configuredUrl || 'http://localhost:8000/api/v1';
    }

    // 3. Native Development (iOS/Android)
    try {
        const hostUri = Constants.expoConfig?.hostUri;

        if (!hostUri) {
            // Fallback for emulators if hostUri is not available
            const fallbackHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
            const url = `http://${fallbackHost}:8000/api/v1`;
            Logger.debug(`[Config] No hostUri found, using fallback: ${url}`);
            return url;
        }

        // Detect if we are using an Expo tunnel (ngrok, expo.direct)
        const isTunnel = hostUri.includes('ngrok.io') || hostUri.includes('expo.direct');

        if (isTunnel) {
            // In tunnel mode, the hostUri DOES NOT correspond to the backend IP.
            // We must use the local IP if on the same network, or configuredUrl if provided.
            if (configuredUrl) {
                Logger.debug(`[Config] Tunnel detected, using configured API URL: ${configuredUrl}`);
                return configuredUrl;
            }

            // Note: We can't easily auto-detect the local IP here without hostUri,
            // so we warn the user and use a likely local IP or localhost.
            const url = 'http://localhost:8000/api/v1';
            Logger.warn(`[Config] Tunnel detected. hostUri is ${hostUri}. Automatic backend detection may fail. Please set EXPO_PUBLIC_API_URL in .env if you get Network Errors.`);
            return url;
        }

        // Get the IP from hostUri (e.g., "192.168.1.5:8081" -> "192.168.1.5")
        const hostIp = hostUri.split(':')[0];
        const dynamicUrl = `http://${hostIp}:8000/api/v1`;

        Logger.debug(`[Config] Dynamic API URL detected: ${dynamicUrl}`);
        return dynamicUrl;
    } catch (error) {
        Logger.error('[Config] Error detecting dynamic API URL', error);
        return configuredUrl || 'http://10.0.2.2:8000/api/v1';
    }
};
