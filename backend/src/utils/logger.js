import winston from 'winston';
import environment from '../config/environment.js';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const devFormat = combine(
    colorize(),
    timestamp({ format: 'HH:mm:ss' }),
    errors({ stack: true }),
    printf(({ level, message, timestamp: ts, stack, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return stack
            ? `${ts} ${level}: ${message}\n${stack}${metaStr}`
            : `${ts} ${level}: ${message}${metaStr}`;
    }),
);

const prodFormat = combine(
    timestamp(),
    errors({ stack: true }),
    winston.format.json(),
);

const logger = winston.createLogger({
    level: environment.nodeEnv === 'production' ? 'info' : 'debug',
    format: environment.nodeEnv === 'production' ? prodFormat : devFormat,
    transports: [new winston.transports.Console()],
    silent: environment.nodeEnv === 'test',
});

export default logger;
