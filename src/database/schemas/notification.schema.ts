import { model, Schema } from 'mongoose';
import { v7 as uuidv7 } from 'uuid';
import type { INotificationSchema } from '../../utils/interfaces/schemas/notification-schema.interface';

const notificationSchema: Schema = new Schema<INotificationSchema>({
  id: { type: String, unique: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

notificationSchema.pre('save', function () {
  if (!this.id) {
    this.id = uuidv7();
  }
});

export const notification = model<INotificationSchema>('notification', notificationSchema);
