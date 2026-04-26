type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

function createEntry(level: LogLevel, message: string, meta?: Record<string, unknown>): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };
}

function write(entry: LogEntry): void {
  const output = JSON.stringify(entry);
  if (entry.level === 'error') {
    // eslint-disable-next-line no-console
    console.error(output);
  } else {
    // eslint-disable-next-line no-console
    console.log(output);
  }
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>): void {
    write(createEntry('debug', message, meta));
  },
  info(message: string, meta?: Record<string, unknown>): void {
    write(createEntry('info', message, meta));
  },
  warn(message: string, meta?: Record<string, unknown>): void {
    write(createEntry('warn', message, meta));
  },
  error(message: string, meta?: Record<string, unknown>): void {
    write(createEntry('error', message, meta));
  },
};
