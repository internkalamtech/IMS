import { StorageService } from '@/data/local/storage';
import axios, { AxiosError, AxiosHeaders, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getApiBaseUrl, isTokenRefreshEnabled } from './api-config';
import { AuthError, NetworkError } from './error';
import { Logger } from './logger';


// Default configuration
const API_URL = getApiBaseUrl();
const TIMEOUT = 10000;
const TOKEN_REFRESH_ENABLED = isTokenRefreshEnabled();

type RetryRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

/** Callback pair for handling queued requests during token refresh */
type QueuedRequestCallback = {
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
};

export class ApiClient {
    private static instance: ApiClient;
    private axiosInstance: AxiosInstance;
    private isRefreshing = false;
    private failedQueue: QueuedRequestCallback[] = [];

    private constructor() {
        this.axiosInstance = axios.create({
            baseURL: API_URL,
            timeout: TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    public static getInstance(): ApiClient {
        if (!ApiClient.instance) {
            ApiClient.instance = new ApiClient();
        }
        return ApiClient.instance;
    }

    private processQueue(error: unknown | null, token: string | null = null): void {
        this.failedQueue.forEach((callback) => {
            if (error) {
                callback.reject(error);
            } else if (token) {
                callback.resolve(token);
            } else {
                callback.reject(new Error('Token refresh failed: no token available'));
            }
        });
        this.failedQueue = [];
    }

    private ensureHeaders(config: RetryRequestConfig): AxiosHeaders {
        if (config.headers instanceof AxiosHeaders) {
            return config.headers;
        }

        const normalizedHeaders = AxiosHeaders.from(config.headers ?? {});
        config.headers = normalizedHeaders;
        return normalizedHeaders;
    }

    private isAuthEndpoint(url?: string): boolean {
        if (!url) {
            return false;
        }

        const normalizedUrl = url.toLowerCase();
        return normalizedUrl.includes('/auth/login') || normalizedUrl.includes('/auth/refresh');
    }

    private hasAuthorizationHeader(config: RetryRequestConfig): boolean {
        if (!config.headers) {
            return false;
        }

        if (config.headers instanceof AxiosHeaders) {
            return Boolean(config.headers.get('Authorization'));
        }

        const authHeader = (config.headers as Record<string, unknown>).Authorization
            ?? (config.headers as Record<string, unknown>).authorization;

        return typeof authHeader === 'string' ? authHeader.trim().length > 0 : Boolean(authHeader);
    }

    private async refreshAccessToken(): Promise<string | null> {
        if (!TOKEN_REFRESH_ENABLED) {
            Logger.warn('Token refresh is disabled by config (EXPO_PUBLIC_ENABLE_TOKEN_REFRESH=false)');
            await StorageService.removeItem('auth_token');
            await StorageService.removeItem('current_user');
            return null;
        }

        try {
            const token = await StorageService.getItem<string>('auth_token');
            if (!token) {
                Logger.warn('No token available for refresh');
                return null;
            }

            const response = await axios.post(
                `${API_URL}/auth/refresh`,
                { access_token: token },
                {
                    timeout: TIMEOUT,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            );

            const { access_token } = response.data;
            await StorageService.setItem('auth_token', access_token);
            Logger.info('Token refreshed successfully');
            return access_token;
        } catch (refreshError) {
            Logger.error('Token refresh failed', refreshError);
            await StorageService.removeItem('auth_token');
            await StorageService.removeItem('current_user');
            return null;
        }
    }

    private setupInterceptors() {
        // Request Interceptor
        this.axiosInstance.interceptors.request.use(
            async (config: InternalAxiosRequestConfig) => {
                const token = await StorageService.getItem<string>('auth_token');
                if (token) {
                    this.ensureHeaders(config as RetryRequestConfig).set('Authorization', `Bearer ${token}`);
                }
                Logger.debug(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },

            (error) => {
                Logger.error('[API Request Error]', error);
                return Promise.reject(error);
            }
        );

        // Response Interceptor
        this.axiosInstance.interceptors.response.use(
            (response: AxiosResponse) => {
                Logger.debug(`[API Response] ${response.status} ${response.config.url}`);
                return response;
            },
            async (error: AxiosError) => {
                const originalRequest = error.config as RetryRequestConfig | undefined;

                Logger.error('[API Response Error]', error);

                if (error.response) {
                    if (!originalRequest) {
                        return Promise.reject(error);
                    }

                    // Server responded with a status code outside of 2xx
                    const status = error.response.status;
                    
                    // Handle 401 with token refresh retry
                    if (status === 401 && !originalRequest._retry) {
                        const isAuthRequest = this.isAuthEndpoint(originalRequest.url);
                        const hasAuthHeader = this.hasAuthorizationHeader(originalRequest);
                        const storedToken = isAuthRequest
                            ? null
                            : await StorageService.getItem<string>('auth_token');
                        const canRefresh = TOKEN_REFRESH_ENABLED
                            && !isAuthRequest
                            && (hasAuthHeader || Boolean(storedToken));

                        if (!canRefresh) {
                            if (!isAuthRequest) {
                                await StorageService.removeItem('auth_token');
                                await StorageService.removeItem('current_user');
                            }
                            return Promise.reject(new AuthError('Session expired'));
                        }

                        if (this.isRefreshing) {
                            originalRequest._retry = true;
                            return new Promise<string>((resolve, reject) => {
                                this.failedQueue.push({ resolve, reject });
                            }).then((token) => {
                                this.ensureHeaders(originalRequest).set('Authorization', `Bearer ${token}`);
                                return this.axiosInstance(originalRequest);
                            }).catch((err) => {
                                return Promise.reject(err);
                            });
                        }

                        originalRequest._retry = true;
                        this.isRefreshing = true;

                        try {
                            const newToken = await this.refreshAccessToken();
                            this.isRefreshing = false;

                            if (newToken) {
                                this.ensureHeaders(originalRequest).set('Authorization', `Bearer ${newToken}`);
                                this.processQueue(null, newToken);
                                return this.axiosInstance(originalRequest);
                            } else {
                                const authError = new AuthError('Session expired and refresh failed');
                                this.processQueue(authError);
                                return Promise.reject(authError);
                            }
                        } catch {
                            this.isRefreshing = false;
                            const authError = new AuthError('Session expired');
                            this.processQueue(authError);
                            return Promise.reject(authError);
                        }
                    }

                    if (status === 401 || status === 403) {
                        if (status === 401) {
                            await StorageService.removeItem('auth_token');
                            await StorageService.removeItem('current_user');
                        }

                        return Promise.reject(
                            new AuthError(
                                status === 401
                                    ? 'Session expired'
                                    : 'Access denied'
                            )
                        );
                    }

                    return Promise.reject(new NetworkError(`Request failed with status ${status}`, status));
                } else if (error.request) {
                    // Request was made but no response received
                    return Promise.reject(new NetworkError('No response received from server'));
                } else {
                    // Something happened in setting up the request
                    return Promise.reject(new NetworkError(error.message));
                }
            }
        );
    }

    public getAxios(): AxiosInstance {
        return this.axiosInstance;
    }
}

export const api = ApiClient.getInstance().getAxios();
