// Declaration file for winston logger
declare module 'winston' {
  namespace winston {
    interface LoggerOptions {
      level?: string;
      format?: Format;
      defaultMeta?: Record<string, any>;
      transports?: Transport[];
      exitOnError?: boolean;
      silent?: boolean;
    }

    interface TransportStreamOptions {
      format?: Format;
      level?: string;
      handleExceptions?: boolean;
      handleRejections?: boolean;
      silent?: boolean;
      eol?: string;
      [key: string]: any;
    }

    interface Transport {
      on(event: string, listener: (...args: any[]) => void): this;
      close(): this;
    }

    interface ConsoleTransportOptions extends TransportStreamOptions {
      consoleWarnLevels?: string[];
      stderrLevels?: string[];
    }

    interface FileTransportOptions extends TransportStreamOptions {
      filename: string;
      maxsize?: number;
      maxFiles?: number;
      tailable?: boolean;
      zippedArchive?: boolean;
      options?: Record<string, any>;
    }

    interface Format {
      transform: (info: Record<string, any>) => Record<string, any>;
    }

    interface Logger {
      log(level: string, message: string, meta?: Record<string, any>): Logger;
      error(message: string, meta?: Record<string, any>): Logger;
      warn(message: string, meta?: Record<string, any>): Logger;
      info(message: string, meta?: Record<string, any>): Logger;
      http(message: string, meta?: Record<string, any>): Logger;
      verbose(message: string, meta?: Record<string, any>): Logger;
      debug(message: string, meta?: Record<string, any>): Logger;
      silly(message: string, meta?: Record<string, any>): Logger;

      add(transport: Transport): Logger;
      remove(transport: Transport): Logger;
      clear(): Logger;
    }

    const format: {
      combine(...args: Format[]): Format;
      timestamp(options?: { format?: string }): Format;
      printf(templateFunction: (info: Record<string, any>) => string): Format;
      json(): Format;
      colorize(options?: { all?: boolean, message?: boolean, level?: boolean }): Format;
      simple(): Format;
      label(options: { label: string }): Format;
      splat(): Format;
      errors(options?: { stack?: boolean }): Format;
      padLevels(options?: Record<string, any>): Format;
    };

    // Transports
    class FileTransport implements Transport {
      constructor(options: FileTransportOptions);
      on(event: string, listener: (...args: any[]) => void): this;
      close(): this;
    }

    class ConsoleTransport implements Transport {
      constructor(options?: ConsoleTransportOptions);
      on(event: string, listener: (...args: any[]) => void): this;
      close(): this;
    }

    // Main function
    function createLogger(options: LoggerOptions): Logger;
  }

  export = winston;
}