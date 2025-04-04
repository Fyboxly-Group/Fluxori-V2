/**
 * Typed Logger Service
 * Handles logging with proper typing and context
 */
import { env } from '../config/environment';

/**
 * Log level type
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'debug' | 'silly';

/**
 * Log context interface
 */
export interface ILogContext {
  [key: string]: unknown;
}

/**
 * Logger configuration interface
 */
export interface ILoggerConfig {
  level: LogLevel;
  serviceName?: string;
  disableConsole?: boolean;
}

/**
 * Logger interface
 */
export interface ILogger {
  error(message: string, error?: Error | unknown, context?: ILogContext): void;
  warn(message: string, context?: ILogContext): void;
  info(message: string, context?: ILogContext): void;
  debug(message: string, context?: ILogContext): void;
  http(message: string, context?: ILogContext): void;
}

/**
 * Maps log levels to numeric values for comparison
 */
const LOG_LEVEL_VALUES: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  silly: 5,
};

/**
 * ANSI color codes for terminal coloring
 */
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

/**
 * Logger implementation
 */
export class Logger implements ILogger {
  private readonly config: ILoggerConfig;
  private readonly serviceName: string;

  /**
   * Creates a new logger
   * @param config - Logger configuration
   */
  constructor(config?: Partial<ILoggerConfig>) {
    this.config = {
      level: config?.level || env.LOG_LEVEL,
      serviceName: config?.serviceName || 'Fluxori',
      disableConsole: config?.disableConsole || false,
    };
    this.serviceName = this.config.serviceName;
  }

  /**
   * Logs an error message
   * @param message - Error message
   * @param error - Error object
   * @param context - Additional context
   */
  public error(message: string, error?: Error | unknown, context?: ILogContext): void {
    if (this.shouldLog('error')) {
      const timestamp = new Date().toISOString();
      const errorObject = error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error;
      
      const logMessage = `${COLORS.red}[ERROR]${COLORS.reset} [${timestamp}] [${this.serviceName}] ${message}`;
      
      if (!this.config.disableConsole) {
        console.error(logMessage);
        if (errorObject) {
          console.error(errorObject);
        }
        if (context) {
          console.error('Context:', context);
        }
      }
      
      // In a production system, you'd send this to a logging service
    }
  }

  /**
   * Logs a warning message
   * @param message - Warning message
   * @param context - Additional context
   */
  public warn(message: string, context?: ILogContext): void {
    if (this.shouldLog('warn')) {
      const timestamp = new Date().toISOString();
      const logMessage = `${COLORS.yellow}[WARN]${COLORS.reset} [${timestamp}] [${this.serviceName}] ${message}`;
      
      if (!this.config.disableConsole) {
        console.warn(logMessage);
        if (context) {
          console.warn('Context:', context);
        }
      }
    }
  }

  /**
   * Logs an info message
   * @param message - Info message
   * @param context - Additional context
   */
  public info(message: string, context?: ILogContext): void {
    if (this.shouldLog('info')) {
      const timestamp = new Date().toISOString();
      const logMessage = `${COLORS.green}[INFO]${COLORS.reset} [${timestamp}] [${this.serviceName}] ${message}`;
      
      if (!this.config.disableConsole) {
        console.info(logMessage);
        if (context) {
          console.info('Context:', context);
        }
      }
    }
  }

  /**
   * Logs an HTTP message
   * @param message - HTTP message
   * @param context - Additional context
   */
  public http(message: string, context?: ILogContext): void {
    if (this.shouldLog('http')) {
      const timestamp = new Date().toISOString();
      const logMessage = `${COLORS.blue}[HTTP]${COLORS.reset} [${timestamp}] [${this.serviceName}] ${message}`;
      
      if (!this.config.disableConsole) {
        console.info(logMessage);
        if (context) {
          console.info('Context:', context);
        }
      }
    }
  }

  /**
   * Logs a debug message
   * @param message - Debug message
   * @param context - Additional context
   */
  public debug(message: string, context?: ILogContext): void {
    if (this.shouldLog('debug')) {
      const timestamp = new Date().toISOString();
      const logMessage = `${COLORS.cyan}[DEBUG]${COLORS.reset} [${timestamp}] [${this.serviceName}] ${message}`;
      
      if (!this.config.disableConsole) {
        console.debug(logMessage);
        if (context) {
          console.debug('Context:', context);
        }
      }
    }
  }

  /**
   * Determines if a message of the given level should be logged
   * @param level - Log level to check
   * @returns Whether the message should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const configuredLevel = LOG_LEVEL_VALUES[this.config.level];
    const messageLevel = LOG_LEVEL_VALUES[level];
    return messageLevel <= configuredLevel;
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger();