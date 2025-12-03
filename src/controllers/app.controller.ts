import type { Request, Response } from 'express';
import { health } from '../services/app.service';
import type { IResponse } from '../utils/interfaces/response.interface';

export function AppHealth(_req: Request, res: Response) {
  const response: IResponse = {
    message: health(),
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  };

  return res.status(200).json(response);
}
