import { injectable } from 'inversify';
import 'reflect-metadata';

/**
 * LogLevel enum for controlling log verbosity
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

/**
 * LogContext interface for structured logging context
 */
export interface LogContext {
  [key: string]: any;
}

/**
 * Logger service interface
 */
export interface ILoggerService {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
}

/**
 * Logger service implementation
 */
@injectable()
export class LoggerService implements ILoggerService {
  private level: LogLevel = LogLevel.INFO;
  
  /**
   * Log a debug message
   * @param message The message to log
   * @param context Optional structured context data
   */
  debug(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.DEBUG) {
      this.log('DEBUG', message, context);
    }
  }
  
  /**
   * Log an info message
   * @param message The message to log
   * @param context Optional structured context data
   */
  info(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.INFO) {
      this.log('INFO', message, context);
    }
  }
  
  /**
   * Log a warning message
   * @param message The message to log
   * @param context Optional structured context data
   */
  warn(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.WARN) {
      this.log('WARN', message, context);
    }
  }
  
  /**
   * Log an error message
   * @param message The message to log
   * @param context Optional structured context data
   */
  error(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.ERROR) {
      this.log('ERROR', message, context);
    }
  }
  
  /**
   * Set the log level
   * @param level The log level to set
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }
  
  /**
   * Get the current log level
   * @returns The current log level
   */
  getLevel(): LogLevel {
    return this.level;
  }
  
  /**
   * Internal log method
   * @param level Log level as string
   * @param message The message to log
   * @param context Optional structured context data
   */
  private log(level: string, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const logObject = {
      timestamp,
      level,
      message,
      ...(context || {})
    };
    
    // In production, we would use a proper logging library
    // For now, just use console with formatting based on level
    switch (level) {
      case 'DEBUG':
        console.log(JSON.stringify(logObject));
        break;
      case 'INFO':
        console.info(JSON.stringify(logObject));
        break;
      case 'WARN':
        console.warn(JSON.stringify(logObject));
        break;
      case 'ERROR':
        console.error(JSON.stringify(logObject));
        break;
    }
  }
}

export default LoggerService;