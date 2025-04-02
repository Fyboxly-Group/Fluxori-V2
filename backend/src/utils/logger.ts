// TypeScript checked
import config from '../config';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * Logger configuration
 */
interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  useColors: boolean;
}

// Default configuration based on app config
const defaultConfig: LoggerConfig = {
  minLevel: config.logging?.level === 'debug' ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: config.env !== 'test',
  useColors: true
};

/**
 * Logger utility class with context
 */
export class Logger {
  private readonly context: string;
  private static config: LoggerConfig = defaultConfig;
  
  /**
   * Constructor
   * @param context The logger context (module or class name)
   */
  constructor(context: string = 'App') {
    this.context = context;
  }
  
  /**
   * Set logger configuration
   * @param config Logger configuration
   */
  static setConfig(config: Partial<LoggerConfig>): void {
    Logger.config = { ...Logger.config, ...config };
  }
  
  /**
   * Log a debug message
   * @param message The message to log
   * @param meta Additional metadata
   */
  debug(message: string, meta?: any): void {
    this.log(LogLevel.DEBUG, message, meta);
  }
  
  /**
   * Log an info message
   * @param message The message to log
   * @param meta Additional metadata
   */
  info(message: string, meta?: any): void {
    this.log(LogLevel.INFO, message, meta);
  }
  
  /**
   * Log a warning message
   * @param message The message to log
   * @param meta Additional metadata
   */
  warn(message: string, meta?: any): void {
    this.log(LogLevel.WARN, message, meta);
  }
  
  /**
   * Log an error message
   * @param message The message to log
   * @param error Error object or metadata
   */
  error(message: string, error?: any): void {
    // Extract stack trace if available
    const meta = error instanceof Error ? { 
      message: error.message, 
      stack: error.stack,
      ...error
    } : error;
    
    this.log(LogLevel.ERROR, message, meta);
  }
  
  /**
   * Log a message with the specified level
   * @param level The log level
   * @param message The message to log
   * @param meta Additional metadata
   */
  private log(level: LogLevel, message: string, meta?: any): void {
    // Check if level is enabled
    if (!this.isLevelEnabled(level)) {
      return;
    }
    
    // Create log entry
    const timestamp = new Date().toISOString();
    const entry = {
      timestamp,
      level,
      context: this.context,
      message,
      ...(meta ? { meta } : {})
    };
    
    // Log to console if enabled
    if (Logger.config.enableConsole) {
      this.logToConsole(level, timestamp, message, meta);
    }
    
    // In a production environment, you would also log to a file or service
    // this.logToService(entry);
  }
  
  /**
   * Check if a log level is enabled
   * @param level The log level to check
   * @returns True if the level is enabled
   */
  private isLevelEnabled(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const minLevelIndex = levels.indexOf(Logger.config.minLevel);
    const levelIndex = levels.indexOf(level);
    
    return levelIndex >= minLevelIndex;
  }
  
  /**
   * Log to console with optional colors
   * @param level The log level
   * @param timestamp The log timestamp
   * @param message The log message
   * @param meta Additional metadata
   */
  private logToConsole(level: LogLevel, timestamp: string, message: string, meta?: any): void {
    const useColors = Logger.config.useColors;
    let logMethod: any;
    let colorCode: string = '';
    let resetCode: string = '';
    
    // Set console method and color based on level
    switch (level) {
      case LogLevel.DEBUG:
        logMethod = console.debug;
        colorCode = useColors ? '\x1b[34m' : ''; // Blue
        break;
      case LogLevel.INFO:
        logMethod = console.info;
        colorCode = useColors ? '\x1b[32m' : ''; // Green
        break;
      case LogLevel.WARN:
        logMethod = console.warn;
        colorCode = useColors ? '\x1b[33m' : ''; // Yellow
        break;
      case LogLevel.ERROR:
        logMethod = console.error;
        colorCode = useColors ? '\x1b[31m' : ''; // Red
        break;
    }
    
    resetCode = useColors ? '\x1b[0m' : '';
    
    // Format message
    const contextDisplay = `[${this.context}]`;
    const formattedMessage = `${timestamp} ${colorCode}${level.toUpperCase()}${resetCode} ${contextDisplay}: ${message}`;
    
    // Log message
    if (meta) {
      logMethod(formattedMessage, meta);
    } else {
      logMethod(formattedMessage);
    }
  }
}

/**
 * Legacy logger for backwards compatibility
 */
const logger = {
  info: (message: string, ...args: any[]) => {
    if(config.env !== 'test') {
      console.log(`[${new Date().toISOString()}] [INFO] ${message}`, ...args);
    }
  },
  
  error: (message: string, ...args: any[]) => {
    if(config.env !== 'test') {
      console.error(`[${new Date().toISOString()}] [ERROR] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if(config.env !== 'test') {
      console.warn(`[${new Date().toISOString()}] [WARN] ${message}`, ...args);
    }
  },
  
  debug: (message: string, ...args: any[]) => {
    if(config.env === 'development' || config.logging.level === 'debug') {
      console.debug(`[${new Date().toISOString()}] [DEBUG] ${message}`, ...args);
    }
  }
};

export default logger;