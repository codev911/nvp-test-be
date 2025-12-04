import { model, Schema } from 'mongoose';
import { v7 as uuidv7 } from 'uuid';
import { AdminRole } from '../../utils/enums/admin-role.enum';
import { hashData } from '../../utils/hash.util';
import type { IAdminSchema } from '../../utils/interfaces/schemas/admin-schema.interface';

const adminSchema: Schema = new Schema<IAdminSchema>({
  id: { type: String, required: false, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: AdminRole, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

adminSchema.pre('save', async function () {
  const hashedPassword = await hashData(this.password as string);

  this.id = uuidv7();
  this.password = hashedPassword;
});
adminSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate() as { password?: string; updated_at?: Date };

  if (update.password) {
    const hashedPassword = await hashData(update.password);
    update.password = hashedPassword;
  }
  update.updated_at = new Date();
});

export const admin = model<IAdminSchema>('admin', adminSchema);
