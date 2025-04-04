/**
 * Type declarations for Winston logger
 * These declarations extend the Winston types to add missing properties
 */
declare module 'winston' {
  export interface Logger {
    log(level: string, message: string, meta?: any): Logger;
    debug(message: string, meta?: any): Logger;
    info(message: string, meta?: any): Logger;
    warn(message: string, meta?: any): Logger;
    error(message: string, meta?: any): Logger;
  }

  export interface LoggerOptions {
    transports?: TransportInstance[];
    format?: any;
    level?: string;
    exitOnError?: boolean;
    silent?: boolean;
  }

  export interface TransportOptions {
    level?: string;
    silent?: boolean;
    format?: any;
    handleExceptions?: boolean;
  }

  export interface Transport {
    on(event: string, listener: Function): this;
    close(): void;
    name: string;
    level?: string;
    silent?: boolean;
    handleExceptions?: boolean;
    exceptionsLevel?: string;
    humanReadableUnhandledException?: boolean;
  }
  
  export interface TransportInstance extends Transport {}

  export interface ConsoleTransportOptions extends TransportOptions {
    stderrLevels?: string[];
    consoleWarnLevels?: string[];
  }

  export class FileTransport implements TransportInstance {
    name: string;
    level?: string;
    silent?: boolean;
    handleExceptions?: boolean;
    constructor(options: object);
  }

  export class ConsoleTransport implements TransportInstance {
    name: string;
    level?: string;
    silent?: boolean;
    handleExceptions?: boolean;
    constructor(options: ConsoleTransportOptions);
  }

  export const transports: {
    Console: typeof ConsoleTransport;
    File: typeof FileTransport;
  };

  export function createLogger(options: LoggerOptions): Logger;
  export function format(options?: any): any;
  export function add(transport: TransportInstance): Logger;
  export function remove(transport: TransportInstance): Logger;
  export function clear(): Logger;
  export function profile(id: string, meta?: any): Logger;
  export function startTimer(): Function;
  export function debug(message: string, meta?: any): Logger;
  export function info(message: string, meta?: any): Logger;
  export function warn(message: string, meta?: any): Logger;
  export function error(message: string, meta?: any): Logger;
}