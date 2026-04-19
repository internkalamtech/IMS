import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { Logger } from './logger';

const DEFAULT_PORT = '8000';
const API_VERSION = 'api/v1';

/**
 * Build the API base URL from env vars when present, otherwise fall back
 * to a sensible local/dev host for the current platform.
 */
export const getApiBaseUrl = (): string => {
    const env = process.env.EXPO_PUBLIC_ENV || 'development';
    const configuredUrl = process.env.EXPO_PUBLIC_API_URL;

    if (['production', 'staging', 'test'].includes(env)) {
        if (configuredUrl) {
            Logger.debug(`[Config] Using ENV API URL: ${configuredUrl}`);
            return configuredUrl;
        }
        Logger.warn(`[Config] Missing EXPO_PUBLIC_API_URL for ${env}`);
    }

    if (Platform.OS === 'web') {
        const url =
            configuredUrl || `http://127.0.0.1:${DEFAULT_PORT}/${API_VERSION}`;
        Logger.debug(`[Config] Web API URL: ${url}`);
        return url;
    }

    if (Platform.OS === 'android' && !configuredUrl) {
        const emulatorUrl = `http://10.0.2.2:${DEFAULT_PORT}/${API_VERSION}`;
        Logger.debug(`[Config] Android emulator API URL: ${emulatorUrl}`);
        return emulatorUrl;
    }

    try {
        if (configuredUrl) {
            Logger.debug(`[Config] Using configured API URL: ${configuredUrl}`);
            return configuredUrl;
        }

        const hostUri = Constants.expoConfig?.hostUri;

        if (!hostUri) {
            const fallbackHost =
                Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
            const url = `http://${fallbackHost}:${DEFAULT_PORT}/${API_VERSION}`;
            Logger.debug(`[Config] No hostUri found, using fallback: ${url}`);
            return url;
        }

        const isTunnel =
            hostUri.includes('ngrok.io') || hostUri.includes('expo.direct');

        if (isTunnel) {
            const fallbackHost =
                Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
            const url = `http://${fallbackHost}:${DEFAULT_PORT}/${API_VERSION}`;
            Logger.warn(
                `[Config] Tunnel detected. hostUri is ${hostUri}. Using fallback: ${url}.`
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
