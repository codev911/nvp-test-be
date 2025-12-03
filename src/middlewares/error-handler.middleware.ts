import type { NextFunction, Request, Response } from 'express';
import { ResponseStatus } from '../utils/enums/response-status.enum';
import type { IErrorResponse } from '../utils/interfaces/error-response.interface';
import logger from '../utils/log.util';

/**
 * Global Error Handler Middleware
 * Catches all unhandled errors and formats them consistently using IErrorResponse
 * This should be registered AFTER all routes
 */
export function errorHandler(
  err: Error & { statusCode?: number; status?: number; cause?: unknown },
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Log error using Bunyan logger with appropriate level
  if (statusCode >= 500) {
    // Server errors - log as error with full details
    logger.error(`Server error: ${err.message}`, {
      err,
      req,
      statusCode,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    });
  } else if (statusCode >= 400) {
    // Client errors - log as warn
    logger.warn(`Client error: ${err.message}`, {
      err,
      statusCode,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    });
  } else {
    // Unknown errors - log as error
    logger.error(`Unknown error: ${err.message}`, {
      err,
      req,
      statusCode,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    });
  }

  // Build error response using IErrorResponse structure
  const errorResponse: IErrorResponse = {
    status: ResponseStatus.ERROR,
    message: err.message || getDefaultErrorMessage(statusCode),
    code: statusCode,
  };

  // Add cause if available
  if (err.cause) {
    errorResponse.cause = err.cause;
  }

  // Add stack trace in development mode
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    errorResponse.stack = err.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found Handler
 * Handles requests to undefined routes
 */
export function notFoundHandler(req: Request, res: Response, _next: NextFunction): void {
  // Log 404 errors
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  const errorResponse: IErrorResponse = {
    status: ResponseStatus.ERROR,
    message: 'Route not found',
    code: 404,
    cause: `Cannot ${req.method} ${req.originalUrl}`,
  };

  res.status(404).json(errorResponse);
}

/**
 * Get default error message based on HTTP status code
 */
function getDefaultErrorMessage(statusCode: number): string {
  const errorMessages: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
  };

  return errorMessages[statusCode] || 'Internal Server Error';
}
