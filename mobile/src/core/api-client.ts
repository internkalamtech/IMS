import { StorageService } from '@/data/local/storage';
import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
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
            (error: AxiosError) => {
                Logger.error('[API Response Error]', error);

                if (error.response) {
                    // Server responded with a status code outside of 2xx
                    const status = error.response.status;
                    const detail =
                        typeof error.response.data === 'object' &&
                        error.response.data !== null &&
                        'detail' in error.response.data &&
                        typeof error.response.data.detail === 'string'
                            ? error.response.data.detail
                            : null;

                    if (status === 401) {
                        return Promise.reject(new AuthError(detail || 'Session expired'));
                    }
                    return Promise.reject(
                        new NetworkError(detail || `Request failed with status ${status}`, status)
                    );
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
