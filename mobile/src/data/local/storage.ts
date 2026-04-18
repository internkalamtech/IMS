import { Logger } from '@/core/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageService {
    /**
     * Save data to local storage
     * @param key Storage key
     * @param value Data to save
     */
    static async setItem(key: string, value: any): Promise<void> {
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.setItem(key, jsonValue);
        } catch (e) {
            Logger.error(`[Storage] Failed to save key "${key}"`, e);
            throw e;
        }
    }

    /**
     * Retrieve data from local storage
     * @param key Storage key
     * @returns Parsed data or null
     */
    static async getItem<T>(key: string): Promise<T | null> {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            Logger.error(`[Storage] Failed to fetch key "${key}"`, e);
            return null;
        }
    }

    /**
     * Remove item from local storage
     * @param key Storage key
     */
    static async removeItem(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(key);
        } catch (e) {
            Logger.error(`[Storage] Failed to remove key "${key}"`, e);
            throw e;
        }
    }

    /**
     * Clear all storage
     */
    static async clear(): Promise<void> {
        try {
            await AsyncStorage.clear();
        } catch (e) {
            Logger.error('[Storage] Failed to clear storage', e);
            throw e;
        }
    }
}
