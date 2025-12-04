import type { Request, Response } from 'express';
import { adminAuthenticate } from '../services/auth.service';
import type { IResponse } from '../utils/interfaces/response.interface';
import { loginValidator } from '../utils/validators/auth.validator';

export async function authAdmin(req: Request, res: Response) {
  const { email, password } = req.body;
  const response: IResponse = {
    message: '',
  };

  try {
    loginValidator.parse({ email, password });
  } catch (error: unknown) {
    const errorMessages =
      error instanceof Error ? JSON.parse(error.message) : [{ message: 'Invalid request body' }];
    response.message = errorMessages.map((err: { message: string }) => err.message).join(', ');

    return res.status(400).json(response);
  }

  try {
    const token = await adminAuthenticate(email, password);
    response.message = 'Authentication successfully.';
    response.data = { token };

    return res.status(200).json(response);
  } catch (error: unknown) {
    let code = 500;

    if (error instanceof Error) {
      response.message = error.message;

      if (error.message.includes('not found')) {
        code = 404;
      } else if (error.message.includes('Invalid password')) {
        code = 401;
      }
    } else {
      response.message = 'An unknown error occurred during authentication.';
    }

    return res.status(code).json(response);
  }
}

export function authMe(_req: Request, res: Response) {
  const response: IResponse = {
    message: 'Authenticated user info retrieved successfully.',
    data: {
      username: res.locals.user.username,
      role: res.locals.user.role,
    },
  };

  return res.status(200).json(response);
}
