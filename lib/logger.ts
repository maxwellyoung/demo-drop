export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote?: boolean;
}

class Logger {
  private config: LogConfig;

  constructor(config: LogConfig) {
    this.config = config;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const baseMessage = `[${timestamp}] [${level}] ${message}`;
    return data ? `${baseMessage} ${JSON.stringify(data)}` : baseMessage;
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const formattedMessage = this.formatMessage("DEBUG", message, data);
      if (this.config.enableConsole) {
        console.debug(formattedMessage);
      }
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formattedMessage = this.formatMessage("INFO", message, data);
      if (this.config.enableConsole) {
        console.info(formattedMessage);
      }
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formattedMessage = this.formatMessage("WARN", message, data);
      if (this.config.enableConsole) {
        console.warn(formattedMessage);
      }
    }
  }

  error(message: string, error?: Error | any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formattedMessage = this.formatMessage("ERROR", message, error);
      if (this.config.enableConsole) {
        console.error(formattedMessage);
      }

      // In production, you might want to send errors to a monitoring service
      if (this.config.enableRemote && process.env.NODE_ENV === "production") {
        this.sendToMonitoringService(message, error);
      }
    }
  }

  private sendToMonitoringService(message: string, error?: Error | any): void {
    // Implement remote logging (e.g., Sentry, LogRocket, etc.)
    // This is a placeholder for production error reporting
  }
}

// Create logger instance based on environment
const logLevel =
  process.env.NODE_ENV === "production" ? LogLevel.ERROR : LogLevel.DEBUG;

export const logger = new Logger({
  level: logLevel,
  enableConsole: true,
  enableRemote: process.env.NODE_ENV === "production",
});

// Convenience functions
export const log = {
  debug: (message: string, data?: any) => logger.debug(message, data),
  info: (message: string, data?: any) => logger.info(message, data),
  warn: (message: string, data?: any) => logger.warn(message, data),
  error: (message: string, error?: Error | any) => logger.error(message, error),
};
