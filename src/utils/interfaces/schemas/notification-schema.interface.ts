export interface INotificationSchema {
  id?: string;
  title: string;
  message: string;
  read: boolean;
  created_at: Date;
}
