import { StorageService } from '@/data/local/storage';

export const TOKEN_STORAGE_KEY = 'auth_token';
export const USER_STORAGE_KEY = 'current_user';

const unauthorizedListeners = new Set<() => void>();

export async function getStoredToken(): Promise<string | null> {
    return StorageService.getItem<string>(TOKEN_STORAGE_KEY);
}

export async function isAuthenticated(): Promise<boolean> {
    const token = await getStoredToken();
    return !!token;
}

export async function getAuthHeaders() {
    const token = await getStoredToken();

    if (!token) {
        throw new Error('No token available');
    }

    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
}

export async function clearStoredAuth(): Promise<void> {
    await Promise.all([
        StorageService.removeItem(USER_STORAGE_KEY),
        StorageService.removeItem(TOKEN_STORAGE_KEY),
    ]);
}

export function subscribeToUnauthorized(handler: () => void): () => void {
    unauthorizedListeners.add(handler);

    return () => {
        unauthorizedListeners.delete(handler);
    };
}

export function notifyUnauthorized(): void {
    unauthorizedListeners.forEach((handler) => handler());
}
