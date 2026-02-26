import { createLogger, format, transports } from 'winston';
import { join } from 'path';


// Configure Winston to log to console and files
export const systemLogger = createLogger({
    level: 'info',
    format: format.combine(format.timestamp(), format.json()),
    transports: [
        new transports.Console({ format: format.simple() }),
        new transports.File({ filename: join('logs', 'error.log'), level: 'error' }),
        new transports.File({ filename: join('logs', 'combined.log') }),
    ],
});