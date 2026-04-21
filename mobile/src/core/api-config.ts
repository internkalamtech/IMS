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

  // Always allow explicit environment override.
  if (configuredUrl) {
    Logger.debug(`[Config] Using configured API URL: ${configuredUrl}`);
    return configuredUrl;
  }

  // Production-like envs should not silently guess hosts.
  if (['production', 'staging', 'test'].includes(env)) {
    Logger.warn(`[Config] EXPO_PUBLIC_ENV is ${env} but EXPO_PUBLIC_API_URL is missing.`);
  }

  // Web fallback for local development.
  if (Platform.OS === 'web') {
    return 'http://127.0.0.1:8000/api/v1';
  }

  // Native fallback for local development.
  try {
    const hostUri = Constants.expoConfig?.hostUri;

    if (!hostUri) {
      const fallbackHost = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
      const url = `http://${fallbackHost}:8000/api/v1`;
      Logger.debug(`[Config] No hostUri found, using fallback: ${url}`);
      return url;
    }

    const isTunnel = hostUri.includes('ngrok.io') || hostUri.includes('expo.direct');
    if (isTunnel) {
      const fallbackHost = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
      const url = `http://${fallbackHost}:8000/api/v1`;
      Logger.warn(
        `[Config] Tunnel detected (${hostUri}). Set EXPO_PUBLIC_API_URL to a reachable backend URL if requests fail.`
      );
      return url;
    }

    let hostIp = hostUri.split(':')[0];
    if ((hostIp === 'localhost' || hostIp === '127.0.0.1') && Platform.OS === 'android') {
      hostIp = '10.0.2.2';
      Logger.debug(`[Config] Localhost detected on Android emulator, using ${hostIp}`);
    }

    const dynamicUrl = `http://${hostIp}:8000/api/v1`;
    Logger.debug(`[Config] Dynamic API URL detected: ${dynamicUrl}`);
    return dynamicUrl;
  } catch (error) {
    Logger.error('[Config] Error detecting dynamic API URL', error);
    return Platform.OS === 'android'
      ? 'http://10.0.2.2:8000/api/v1'
      : 'http://127.0.0.1:8000/api/v1';
  }
};
