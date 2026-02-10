// Frontend logging utility inspired by foundation-sdk backend logging
// Provides structured, timestamped logging similar to backend format
export class FrontendLogger {
    constructor(context) {
        this.context = context;
    }
    formatMessage(level, message, data) {
        const now = new Date();
        const timestamp = now.toISOString().replace('T', ' ').substring(0, 23);
        // Get caller info (approximation since we can't get exact line numbers easily)
        const stack = new Error().stack;
        let filename = this.context;
        let lineNumber = 0;
        if (stack) {
            const lines = stack.split('\n');
            if (lines.length >= 4) {
                const callerLine = lines[3];
                const match = callerLine.match(/at.*\((.*):(\d+):/);
                if (match) {
                    filename = match[1] || this.context;
                    lineNumber = parseInt(match[2]) || 0;
                }
            }
        }
        return {
            timestamp,
            level,
            filename,
            lineNumber,
            message,
            data
        };
    }
    log(level, message, data) {
        const entry = this.formatMessage(level, message, data);
        // Format similar to backend: "2026-02-08 19:51:22,181 - LEVEL - filename:line - message"
        const formattedMessage = `${entry.timestamp} - ${level} - ${entry.filename}:${entry.lineNumber} - ${message}`;
        // Add data if present
        if (entry.data) {
            console.log(formattedMessage, entry.data);
        }
        else {
            console.log(formattedMessage);
        }
        // Store in localStorage for debugging (optional)
        this.storeLog(entry);
    }
    storeLog(entry) {
        try {
            const existingLogs = JSON.parse(localStorage.getItem('frontend_logs') || '[]');
            existingLogs.push(entry);
            // Keep only last 100 entries to avoid storage issues
            if (existingLogs.length > 100) {
                existingLogs.splice(0, existingLogs.length - 100);
            }
            localStorage.setItem('frontend_logs', JSON.stringify(existingLogs));
        }
        catch (error) {
            // Silently fail if localStorage is not available
        }
    }
    trace(message, data) {
        this.log('TRACE', message, data);
    }
    debug(message, data) {
        this.log('DEBUG', message, data);
    }
    info(message, data) {
        this.log('INFO', message, data);
    }
    warning(message, data) {
        this.log('WARNING', message, data);
    }
    error(message, data) {
        this.log('ERROR', message, data);
    }
    critical(message, data) {
        this.log('CRITICAL', message, data);
    }
    // Utility methods for common operations
    logApiRequest(method, url, data) {
        this.info(`API Request: ${method} ${url}`, { method, url, data });
    }
    logApiResponse(status, data, duration) {
        const message = duration
            ? `API Response: ${status} in ${duration}ms`
            : `API Response: ${status}`;
        this.info(message, { status, data, duration });
    }
    logFormSubmission(formData) {
        this.info('Form submission', { formData });
    }
    logUserAction(action, details) {
        this.info(`User action: ${action}`, details);
    }
    // Export logs for debugging
    exportLogs() {
        try {
            return localStorage.getItem('frontend_logs') || '[]';
        }
        catch (error) {
            return '[]';
        }
    }
    // Clear logs
    clearLogs() {
        try {
            localStorage.removeItem('frontend_logs');
        }
        catch (error) {
            // Silently fail
        }
    }
}
// Factory function similar to backend's get_logger
export function getLogger(context) {
    return new FrontendLogger(context);
}
// Default logger for general use
export const logger = getLogger('frontend-lib');
// Development utilities for debugging
if (typeof window !== 'undefined') {
    // Add global debug functions
    window.getFrontendLogs = () => logger.exportLogs();
    window.clearFrontendLogs = () => logger.clearLogs();
    window.viewLogs = () => {
        console.table(JSON.parse(logger.exportLogs()));
    };
}
