import { StorageService } from '@/data/local/storage';
import axios, { AxiosError, AxiosHeaders, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getApiBaseUrl } from './api-config';
import { AuthError, NetworkError } from './error';
import { Logger } from './logger';


// Default configuration
const API_URL = getApiBaseUrl();
const TIMEOUT = 10000;

export class ApiClient {
    private static instance: ApiClient;
    private axiosInstance: AxiosInstance;
    private isRefreshing = false;
    private failedQueue: { resolve: Function; reject: Function }[] = [];

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

    private processQueue(error: any, token: string | null = null) {
        this.failedQueue.forEach((prom) => {
            if (error) {
                prom.reject(error);
            } else {
                prom.resolve(token);
            }
        });
        this.failedQueue = [];
    }

    private async refreshAccessToken(): Promise<string | null> {
        try {
            const token = await StorageService.getItem<string>('auth_token');
            if (!token) {
                Logger.warn('No token available for refresh');
                return null;
            }

            const response = await axios.post(
                `${API_URL}/auth/refresh`,
                { access_token: token },
                { timeout: TIMEOUT }
            );

            const { access_token } = response.data;
            await StorageService.setItem('auth_token', access_token);
            Logger.info('Token refreshed successfully');
            return access_token;
        } catch (error) {
            Logger.error('Token refresh failed', error);
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
                    config.headers.Authorization = `Bearer ${token}`;
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
                const originalRequest = error.config as any;

                Logger.error('[API Response Error]', error);

                if (error.response) {
                    // Server responded with a status code outside of 2xx
                    const status = error.response.status;
                    
                    // Handle 401 with token refresh retry
                    if (status === 401 && !originalRequest._retry) {
                        if (this.isRefreshing) {
                            return new Promise((resolve, reject) => {
                                this.failedQueue.push({ resolve, reject });
                            }).then((token) => {
                                originalRequest.headers = originalRequest.headers ?? new AxiosHeaders();
                                originalRequest.headers.Authorization = `Bearer ${token}`;
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
                                originalRequest.headers = originalRequest.headers ?? new AxiosHeaders();
                                originalRequest.headers.Authorization = `Bearer ${newToken}`;
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
