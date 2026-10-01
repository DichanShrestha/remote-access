import { env } from './env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    if (level === 'debug' && env.NODE_ENV === 'production') return;

    const entry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    };

    if (env.NODE_ENV === 'development') {
      const consoleMsg = meta ? `${message} ${JSON.stringify(meta)}` : message;
      switch (level) {
        case 'debug': console.debug(`[DEBUG] ${consoleMsg}`); break;
        case 'info': console.info(`[INFO] ${consoleMsg}`); break;
        case 'warn': console.warn(`[WARN] ${consoleMsg}`); break;
        case 'error': console.error(`[ERROR] ${consoleMsg}`); break;
      }
    } else {
      console[level](JSON.stringify(entry));
    }
  }

  debug(message: string, meta?: Record<string, unknown>) { this.log('debug', message, meta); }
  info(message: string, meta?: Record<string, unknown>) { this.log('info', message, meta); }
  warn(message: string, meta?: Record<string, unknown>) { this.log('warn', message, meta); }
  error(message: string, meta?: Record<string, unknown>) { this.log('error', message, meta); }
}

export const logger = new Logger();
