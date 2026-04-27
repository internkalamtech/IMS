import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { Logger } from './logger';

const DEFAULT_PORT = '8000';
const API_VERSION = 'api/v1';

/**
 * Dynamically determines the API gateway URL based on the current environment and platform.
 *
 * Logic:
 * 1. If EXPO_PUBLIC_ENV is 'production', 'staging', or 'test', uses EXPO_PUBLIC_API_URL.
 * 2. In 'development':
 *    - Web: Uses 'localhost' or EXPO_PUBLIC_API_URL.
 *    - Native: Detects the host machine's IP address using Expo Constants to allow
 *      connection to a local backend from physical devices and emulators.
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
        return configuredUrl || `http://localhost:${DEFAULT_PORT}/${API_VERSION}`;
    }

    // 3. Native Development (iOS/Android)
    try {
        if (configuredUrl) {
            Logger.debug(`[Config] Using configured API URL: ${configuredUrl}`);
            return configuredUrl;
        }

        const hostUri = Constants.expoConfig?.hostUri;

        if (!hostUri) {
            const fallbackHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
            const url = `http://${fallbackHost}:${DEFAULT_PORT}/${API_VERSION}`;
            Logger.debug(`[Config] No hostUri found, using fallback: ${url}`);
            return url;
        }

        const isTunnel = hostUri.includes('ngrok.io') || hostUri.includes('expo.direct');

        if (isTunnel) {
            const fallbackHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
            const url = `http://${fallbackHost}:${DEFAULT_PORT}/${API_VERSION}`;
            Logger.warn(
                `[Config] Tunnel detected. hostUri is ${hostUri}. Using fallback: ${url}. For physical devices, please set EXPO_PUBLIC_API_URL in .env.`
            );
            return url;
        }

        const hostIp = hostUri.split(':')[0];
        const dynamicUrl = `http://${hostIp}:${DEFAULT_PORT}/${API_VERSION}`;

        Logger.debug(`[Config] Dynamic API URL detected: ${dynamicUrl}`);
        return dynamicUrl;
    } catch (error) {
        Logger.error('[Config] Error detecting dynamic API URL', error);
        return configuredUrl || `http://10.0.2.2:${DEFAULT_PORT}/${API_VERSION}`;
    }
};