import { StorageService } from '@/data/local/storage';
import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getApiBaseUrl } from './api-config';
import { AuthError, NetworkError } from './error';
import { Logger } from './logger';


// Default configuration
const API_URL = getApiBaseUrl();
const TIMEOUT = 10000;
const LOGIN_ENDPOINT = '/auth/login';

const getResponseMessage = (error: AxiosError): string | null => {
    const data = error.response?.data;
    if (data && typeof data === 'object' && 'detail' in data) {
        const detail = (data as { detail?: unknown }).detail;
        return typeof detail === 'string' ? detail : null;
    }
    return null;
};

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
            async (error: AxiosError) => {
                Logger.error('[API Response Error]', error);

                if (error.response) {
                    // Server responded with a status code outside of 2xx
                    const status = error.response.status;
                    const message = getResponseMessage(error);
                    const requestUrl = error.config?.url ?? '';
                    if (status === 401) {
                        if (requestUrl.includes(LOGIN_ENDPOINT)) {
                            return Promise.reject(new AuthError(message ?? 'Invalid email or password'));
                        }

                        await StorageService.removeItem('auth_token');
                        await StorageService.removeItem('current_user');
                        return Promise.reject(new AuthError(message ?? 'Session expired'));
                    }
                    return Promise.reject(new NetworkError(message ?? `Request failed with status ${status}`, status));
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
