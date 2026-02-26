import morgan from 'morgan';
import { systemLogger } from "./logger.ts";


export const morganMiddleware = morgan("combined", {
    stream: { write: (message) => systemLogger.info(message.trim()) }
});