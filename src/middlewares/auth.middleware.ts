import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../services/jwt.service';
import type { IErrorResponse } from '../utils/interfaces/error-response.interface';
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const headerToken = req.headers.authorization;
  const errorResponse: IErrorResponse = {
    message: 'Authorization header is missing.',
  };

  if (!headerToken) {
    return res.status(401).json(errorResponse);
  }

  const tokenParts = headerToken.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    errorResponse.message = 'Invalid authorization header format. Expected format: Bearer <token>.';
    return res.status(401).json(errorResponse);
  }

  const token = tokenParts[1];
  try {
    const verified = verifyToken(token);
    res.locals.user = verified;
  } catch (error) {
    if (error instanceof Error) {
      errorResponse.message = error.message;
    } else {
      errorResponse.message = 'Invalid or expired token.';
    }
    return res.status(401).json(errorResponse);
  }

  next();
}
