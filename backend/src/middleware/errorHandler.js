import logger from '../utils/logger.js';

/**
 * Global Express error handler.
 * Must be registered AFTER all routes.
 */
// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, _req, res, _next) {
    const status = err.status || err.statusCode || 500;
    const message = err.expose ? err.message : 'Sunucu hatası';

    logger.error(err.message, { stack: err.stack, status });

    res.status(status).json({
        success: false,
        message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
}
