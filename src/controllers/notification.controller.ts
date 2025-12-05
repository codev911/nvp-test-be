import type { Request, Response } from 'express';
import { listNotifications, markNotifications } from '../services/notification.service';
import type { IResponse } from '../utils/interfaces/response.interface';

export async function getNotifications(req: Request, res: Response) {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
  const data = await listNotifications(limit);
  const response: IResponse = {
    message: 'Notifications fetched successfully.',
    data,
  };
  return res.status(200).json(response);
}

export async function markNotificationsRead(req: Request, res: Response) {
  const ids = Array.isArray(req.body) ? req.body : [];
  const modified = await markNotifications(ids);
  const response: IResponse = {
    message: 'Notifications marked as read.',
    data: { modified },
  };
  return res.status(200).json(response);
}
