// Frontend logging utility inspired by foundation-sdk backend logging
// Provides structured, timestamped logging similar to backend format

type LogLevel = 'TRACE' | 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  filename: string;
  lineNumber: number;
  message: string;
  data?: any;
}

export class FrontendLogger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
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

  private log(level: LogLevel, message: string, data?: any): void {
    const entry = this.formatMessage(level, message, data);
    
    // Format similar to backend: "2026-02-08 19:51:22,181 - LEVEL - filename:line - message"
    const formattedMessage = `${entry.timestamp} - ${level} - ${entry.filename}:${entry.lineNumber} - ${message}`;
    
    // Add data if present
    if (entry.data) {
      console.log(formattedMessage, entry.data);
    } else {
      console.log(formattedMessage);
    }

    // Store in localStorage for debugging (optional)
    this.storeLog(entry);
  }

  private storeLog(entry: LogEntry): void {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('frontend_logs') || '[]');
      existingLogs.push(entry);
      
      // Keep only last 100 entries to avoid storage issues
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      
      localStorage.setItem('frontend_logs', JSON.stringify(existingLogs));
    } catch (error) {
      // Silently fail if localStorage is not available
    }
  }

  trace(message: string, data?: any): void {
    this.log('TRACE', message, data);
  }

  debug(message: string, data?: any): void {
    this.log('DEBUG', message, data);
  }

  info(message: string, data?: any): void {
    this.log('INFO', message, data);
  }

  warning(message: string, data?: any): void {
    this.log('WARNING', message, data);
  }

  error(message: string, data?: any): void {
    this.log('ERROR', message, data);
  }

  critical(message: string, data?: any): void {
    this.log('CRITICAL', message, data);
  }

  // Utility methods for common operations
  logApiRequest(method: string, url: string, data?: any): void {
    this.info(`API Request: ${method} ${url}`, { method, url, data });
  }

  logApiResponse(status: number, data?: any, duration?: number): void {
    const message = duration 
      ? `API Response: ${status} in ${duration}ms`
      : `API Response: ${status}`;
    this.info(message, { status, data, duration });
  }

  logFormSubmission(formData: any): void {
    this.info('Form submission', { formData });
  }

  logUserAction(action: string, details?: any): void {
    this.info(`User action: ${action}`, details);
  }

  // Export logs for debugging
  exportLogs(): string {
    try {
      return localStorage.getItem('frontend_logs') || '[]';
    } catch (error) {
      return '[]';
    }
  }

  // Clear logs
  clearLogs(): void {
    try {
      localStorage.removeItem('frontend_logs');
    } catch (error) {
      // Silently fail
    }
  }
}

// Factory function similar to backend's get_logger
export function getLogger(context: string): FrontendLogger {
  return new FrontendLogger(context);
}

// Default logger for general use
export const logger = getLogger('fsdk-ts');

// Development utilities for debugging
if (typeof window !== 'undefined') {
  // Add global debug functions
  (window as any).getFrontendLogs = () => logger.exportLogs();
  (window as any).clearFrontendLogs = () => logger.clearLogs();
  (window as any).viewLogs = () => {
    console.table(JSON.parse(logger.exportLogs()));
  };
}
