import type { NextFunction, Request, Response } from 'express';
import { HTTP_ERROR_STATUS } from '../utils/consts/static.const';
import { ResponseStatus } from '../utils/enums/response-status.enum';
import type { IErrorResponse } from '../utils/interfaces/error-response.interface';
import type { IResponse } from '../utils/interfaces/response.interface';

export function responseInterceptor(_req: Request, res: Response, next: NextFunction) {
  // Store the original json function
  const originalJson = res.json.bind(res);

  // Override the json function
  res.json = (data: unknown): Response => {
    const isError = res.statusCode >= 400;

    // Handle error responses (status >= 400) - use IErrorResponse structure
    if (isError) {
      const errorResponse: IErrorResponse = {
        status: ResponseStatus.ERROR,
        message: '',
        code: res.statusCode,
      };

      // Extract error details
      if (data && typeof data === 'object') {
        if ('message' in data && typeof data.message === 'string') {
          errorResponse.message = data.message;
        } else {
          errorResponse.message = HTTP_ERROR_STATUS[res.statusCode] || 'Error';
        }

        // Extract cause if present
        if ('cause' in data) {
          errorResponse.cause = data.cause;
        }

        // Extract stack if present (only in development)
        if ('stack' in data && process.env.NODE_ENV !== 'production') {
          errorResponse.stack = data.stack;
        }

        // Extract code if provided
        if ('code' in data && typeof data.code === 'number') {
          errorResponse.code = data.code;
        }
      } else {
        // If data is not an object, use default error message
        errorResponse.message = HTTP_ERROR_STATUS[res.statusCode] || 'Error';
      }

      return originalJson(errorResponse);
    }

    // Handle success responses (status < 400)
    const standardResponse: IResponse = {
      status: ResponseStatus.SUCCESS,
      message: '',
      data: undefined,
      pagination: undefined,
    };

    // If data is an object, extract only IResponse fields
    if (data && typeof data === 'object') {
      // Extract message field
      if ('message' in data && typeof data.message === 'string') {
        standardResponse.message = data.message;
      } else {
        standardResponse.message = 'Success';
      }

      // Extract data field if present
      if ('data' in data) {
        standardResponse.data = data.data;
      }

      // Extract pagination field if present and valid
      if ('pagination' in data && typeof data.pagination === 'object' && data.pagination !== null) {
        const pag = data.pagination as Record<string, unknown>;
        standardResponse.pagination = {
          total_data: pag.total_data !== undefined ? (pag.total_data as number) : undefined,
          total_page: pag.total_page !== undefined ? (pag.total_page as number) : undefined,
          page: pag.page !== undefined ? (pag.page as number) : undefined,
          limit: pag.limit !== undefined ? (pag.limit as number) : undefined,
        };
      }
    } else {
      // If data is not an object, wrap it
      standardResponse.message = 'Success';
      standardResponse.data = data;
    }

    // Remove undefined pagination if not set
    if (standardResponse.pagination === undefined) {
      delete standardResponse.pagination;
    }

    // Remove undefined data if not set
    if (standardResponse.data === undefined) {
      delete standardResponse.data;
    }

    return originalJson(standardResponse);
  };

  next();
}
