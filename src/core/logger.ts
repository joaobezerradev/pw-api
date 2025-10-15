/**
 * Logger configurável usando Pino
 */
import pino from 'pino';

export enum LogLevel {
  SILENT = 'silent',
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace'
}

/**
 * Cria logger configurável
 */
export function createLogger(level: LogLevel = LogLevel.INFO) {
  return pino({
    level,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
        translateTime: 'HH:MM:ss',
      }
    }
  });
}

/**
 * Logger padrão para uso interno
 */
export const logger = createLogger(
  (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO
);

export type Logger = pino.Logger;
