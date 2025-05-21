import winston from 'winston';
import dotenv from 'dotenv';

dotenv.config();

const logLevel = process.env.LOG_LEVEL || 'info';
const isProduction = process.env.NODE_ENV === 'production';

// Define custom format
const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    let metadataStr = '';
    if (Object.keys(metadata).length > 0) {
        metadataStr = JSON.stringify(metadata);
    }
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${metadataStr}`;
});

// Create the logger
const logger = winston.createLogger({
    level: logLevel,
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'semantic-search' },
    transports: [
        // Write logs with level 'error' and below to error.log
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                customFormat
            )
        }),
        // Write all logs to combined.log
        new winston.transports.File({
            filename: 'logs/combined.log',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                customFormat
            )
        })
    ],
});

// If not in production, log to the console with a colored format
if (!isProduction) {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            customFormat
        ),
    }));
}

export default logger;