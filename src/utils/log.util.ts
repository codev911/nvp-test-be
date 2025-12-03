import type { LogLevel as BunyanLogLevel } from 'bunyan';
import bunyan from 'bunyan';
import chalk from 'chalk';
import { LOG_LEVEL } from '../configs/env.config';

function getLogLevel(): BunyanLogLevel {
  return LOG_LEVEL as BunyanLogLevel;
}

// biome-ignore lint/suspicious/noExplicitAny: Bunyan raw stream requires any type
function prettyStream(rec: any): void {
  const obj = rec;

  const timestamp = new Date(obj.time as string).toISOString();
  const isDev = process.env.NODE_ENV !== 'production';

  const levelConfig: Record<number, { name: string; color: (str: string) => string }> = {
    10: { name: 'TRACE', color: chalk.gray },
    20: { name: 'DEBUG', color: chalk.blue },
    30: { name: 'INFO', color: chalk.green },
    40: { name: 'WARN', color: chalk.yellow },
    50: { name: 'ERROR', color: chalk.red },
    60: { name: 'FATAL', color: chalk.bgRed.white },
  };

  const levelInfo = levelConfig[obj.level as number] || { name: 'UNKNOWN', color: chalk.white };

  const prefix = `[${timestamp}][${levelInfo.name}]`;

  const message = (obj.msg as string) || '';

  const standardFields = ['name', 'hostname', 'pid', 'level', 'msg', 'time', 'v', 'requestId'];
  const additionalData: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (!standardFields.includes(key)) {
      additionalData[key] = value;
    }
  }

  let output = `${prefix}: ${message}`;

  if (Object.keys(additionalData).length > 0) {
    const dataStr = JSON.stringify(additionalData);
    output += ` ${dataStr}`;
  }

  if (isDev) {
    output = levelInfo.color(output);
  }

  process.stdout.write(`${output}\n`);
}

const logger = bunyan.createLogger({
  name: 'employee-management-system',
  level: getLogLevel(),
  serializers: {
    req: bunyan.stdSerializers.req,
    res: bunyan.stdSerializers.res,
    err: bunyan.stdSerializers.err,
  },
  streams: [
    {
      level: getLogLevel(),
      type: 'raw',
      stream: {
        write: prettyStream,
      },
    },
  ],
});

function extractLogData(args: unknown[]): Record<string, unknown> {
  if (args.length === 0) {
    return {};
  }
  if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
    return args[0] as Record<string, unknown>;
  }
  return { data: args };
}

const loggerWithLevel = {
  trace: (message: string, ...args: unknown[]) => {
    logger.trace(extractLogData(args), message);
  },
  debug: (message: string, ...args: unknown[]) => {
    logger.debug(extractLogData(args), message);
  },
  info: (message: string, ...args: unknown[]) => {
    logger.info(extractLogData(args), message);
  },
  warn: (message: string, ...args: unknown[]) => {
    logger.warn(extractLogData(args), message);
  },
  error: (message: string, ...args: unknown[]) => {
    logger.error(extractLogData(args), message);
  },
  fatal: (message: string, ...args: unknown[]) => {
    logger.fatal(extractLogData(args), message);
  },
};

export default loggerWithLevel;
