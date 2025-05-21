import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../types';
import logger from '../../utils/logger';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Log the error
    logger.error(`Error processing request: ${req.method} ${req.path}`, {
        error: err.message,
        stack: err.stack,
        body: req.body,
        query: req.query,
        params: req.params,
    });

    // Handle known API errors
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
            details: err.details,
        });
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: err.message,
        });
    }

    // Handle database errors
    if (err.name === 'DatabaseError' || err.message.includes('database') || err.message.includes('sql')) {
        return res.status(500).json({
            success: false,
            error: 'Database Error',
            message: 'An error occurred while accessing the database',
        });
    }

    // Default to 500 internal server error
    return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : err.message,
    });
};

// Not found middleware
export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Endpoint not found: ${req.method} ${req.path}`,
    });
};