import type { Server } from 'node:http';
import WebSocket, { WebSocketServer } from 'ws';
import { verifyToken } from '../services/jwt.service';

export type NotificationPayload = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

let notificationWss: WebSocketServer | null = null;

export function initNotificationWebsocket(server: Server) {
  notificationWss = new WebSocketServer({ server, path: '/ws/notifications' });

  notificationWss.on('connection', (socket: WebSocket, req) => {
    const url = new URL(req.url || '', 'http://localhost');
    const token = url.searchParams.get('token');

    if (!token) {
      socket.close(1008, 'Unauthorized');
      return;
    }

    try {
      verifyToken(token);
    } catch (_err) {
      socket.close(1008, 'Invalid token');
      return;
    }

    socket.send(JSON.stringify({ type: 'connected' }));
  });
}

export function publishNotification(payload: NotificationPayload) {
  if (!notificationWss) {
    return;
  }
  const message = JSON.stringify({ type: 'notification', data: payload });
  notificationWss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
