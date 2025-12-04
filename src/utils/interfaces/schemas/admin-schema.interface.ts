import type { AdminRole } from '../../enums/admin-role.enum';

export interface IAdminSchema {
  id?: string;
  username: string;
  password: string;
  email: string;
  role: AdminRole;
  created_at?: Date;
  updated_at?: Date;
}
