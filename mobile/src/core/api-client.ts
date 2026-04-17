import { StorageService } from '@/data/local/storage';
import axios, {
    AxiosError,
    AxiosInstance,
    AxiosResponse,
    InternalAxiosRequestConfig
} from 'axios';
import { getApiBaseUrl } from './api-config';
import { AuthError, NetworkError } from './error';
import { Logger } from './logger';

// Default configuration
const API_URL = getApiBaseUrl();
const TIMEOUT = 10000;

export class ApiClient {
    private static instance: ApiClient;
    private axiosInstance: AxiosInstance;

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

    private setupInterceptors() {

        // ✅ REQUEST INTERCEPTOR
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

        // ✅ RESPONSE INTERCEPTOR (FIXED)
        this.axiosInstance.interceptors.response.use(
            (response: AxiosResponse) => {
                Logger.debug(`[API Response] ${response.status} ${response.config.url}`);
                return response;
            },
            (error: AxiosError) => {
                Logger.error('[API Response Error]', error);

                if (error.response) {
                    const status = error.response.status;
                    const url = error.config?.url || '';

                    // 🔴 FIX: Differentiate LOGIN vs OTHER APIs
                    if (status === 401) {

                        // 👉 If login API → wrong credentials
                        if (url.includes('/auth/login')) {
                            return Promise.reject(
                                new AuthError('Invalid email or password')
                            );
                        }

                        // 👉 Other APIs → session expired
                        return Promise.reject(
                            new AuthError('Session expired. Please login again.')
                        );
                    }

                    return Promise.reject(
                        new NetworkError(`Request failed with status ${status}`, status)
                    );

                } else if (error.request) {
                    return Promise.reject(
                        new NetworkError('No response received from server')
                    );
                } else {
                    return Promise.reject(
                        new NetworkError(error.message)
                    );
                }
            }
        );
    }

    public getAxios(): AxiosInstance {
        return this.axiosInstance;
    }
}

export const api = ApiClient.getInstance().getAxios();