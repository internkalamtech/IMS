import axios, {
    AxiosError,
    AxiosInstance,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios';
import { getApiBaseUrl } from './api-config';
import { clearStoredAuth, getStoredToken, notifyUnauthorized } from './auth-storage';
import { AuthError, NetworkError } from './error';
import { Logger } from './logger';

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
        this.axiosInstance.interceptors.request.use(
            async (config: InternalAxiosRequestConfig) => {
                const requestUrl = config.url ?? '';
                const isAuthLoginRequest = requestUrl.includes('/auth/login');
                const token = await getStoredToken();

                if (token && !isAuthLoginRequest) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                Logger.debug(
                    `[API Request] ${config.method?.toUpperCase()} ${config.url}`
                );
                return config;
            },
            (error) => {
                Logger.error('[API Request Error]', error);
                return Promise.reject(error);
            }
        );

        this.axiosInstance.interceptors.response.use(
            (response: AxiosResponse) => {
                Logger.debug(
                    `[API Response] ${response.status} ${response.config.url}`
                );
                return response;
            },
            (error: AxiosError) => {
                Logger.error('[API Response Error]', error);

                if (error.response) {
                    const status = error.response.status;
                    const requestUrl = error.config?.url ?? '';
                    const isAuthLoginRequest =
                        requestUrl.includes('/auth/login');
                    const detail =
                        typeof error.response.data === 'object' &&
                        error.response.data !== null &&
                        'detail' in error.response.data &&
                        typeof error.response.data.detail === 'string'
                            ? error.response.data.detail
                            : null;

                    if (status === 401) {
                        if (isAuthLoginRequest) {
                            return Promise.reject(
                                new AuthError(detail || 'Invalid email or password')
                            );
                        }

                        void clearStoredAuth().finally(() => {
                            notifyUnauthorized();
                        });
                        return Promise.reject(
                            new AuthError(detail || 'Session expired')
                        );
                    }

                    return Promise.reject(
                        new NetworkError(
                            detail || `Request failed with status ${status}`,
                            status
                        )
                    );
                }

                if (error.request) {
                    return Promise.reject(
                        new NetworkError('No response received from server')
                    );
                }

                return Promise.reject(new NetworkError(error.message));
            }
        );
    }

    public getAxios(): AxiosInstance {
        return this.axiosInstance;
    }
}

export const api = ApiClient.getInstance().getAxios();
