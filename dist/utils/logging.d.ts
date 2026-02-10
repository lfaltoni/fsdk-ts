export declare class FrontendLogger {
    private context;
    constructor(context: string);
    private formatMessage;
    private log;
    private storeLog;
    trace(message: string, data?: any): void;
    debug(message: string, data?: any): void;
    info(message: string, data?: any): void;
    warning(message: string, data?: any): void;
    error(message: string, data?: any): void;
    critical(message: string, data?: any): void;
    logApiRequest(method: string, url: string, data?: any): void;
    logApiResponse(status: number, data?: any, duration?: number): void;
    logFormSubmission(formData: any): void;
    logUserAction(action: string, details?: any): void;
    exportLogs(): string;
    clearLogs(): void;
}
export declare function getLogger(context: string): FrontendLogger;
export declare const logger: FrontendLogger;
