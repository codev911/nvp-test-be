import { notification } from '../database/schemas/notification.schema';
import type { NotificationPayload } from '../websocket/notification.websocket';
import { publishNotification } from '../websocket/notification.websocket';

export async function createNotification(
  title: string,
  message: string,
): Promise<NotificationPayload> {
  const doc = new notification({
    title,
    message,
    read: false,
  });
  const saved = await doc.save();
  const payload = mapNotification(saved);
  publishNotification(payload);
  return payload;
}

export async function listNotifications(limit = 50): Promise<NotificationPayload[]> {
  const docs = await notification.find().sort({ created_at: -1 }).limit(limit);
  return docs.map(mapNotification);
}

export async function markNotifications(ids?: string[]): Promise<number> {
  const filter = ids && ids.length > 0 ? { id: { $in: ids } } : {};
  const res = await notification.updateMany(filter, { $set: { read: true } });
  return res.modifiedCount;
}

function mapNotification(doc: unknown): NotificationPayload {
  const obj =
    typeof doc === 'object' && doc !== null && 'toObject' in doc
      ? (doc as { toObject: () => Record<string, unknown> }).toObject()
      : (doc as Record<string, unknown>);
  const created = (obj as { created_at?: Date | string }).created_at || new Date();
  return {
    id: (obj as { id?: string }).id || '',
    title: (obj as { title?: string }).title || 'Update',
    message: (obj as { message?: string }).message || '',
    createdAt:
      created instanceof Date ? created.toISOString() : new Date(created as string).toISOString(),
    read: Boolean((obj as { read?: boolean }).read),
  };
}
