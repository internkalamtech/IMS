/**
 * Simple logger utility for the application.
 * In production, this can be replaced with a remote logging service.
 */
export const Logger = {
    debug: (message: string, ...args: any[]) => {
        if (__DEV__) {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    },
    info: (message: string, ...args: any[]) => {
        console.info(`[INFO] ${message}`, ...args);
    },
    warn: (message: string, ...args: any[]) => {
        console.warn(`[WARN] ${message}`, ...args);
    },
    error: (message: string, error?: any, ...args: any[]) => {
        console.error(`[ERROR] ${message}`, error, ...args);
        // TODO: Send to crash reporting service (e.g., Sentry)
    },
};
