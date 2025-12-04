import { model, Schema } from 'mongoose';
import { v7 as uuidv7 } from 'uuid';
import type { IEmployeeSchema } from '../../utils/interfaces/schemas/employee-schema.interface';

const employeeSchema: Schema = new Schema<IEmployeeSchema>({
  id: { type: String, required: false, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  position: { type: String, required: true },
  salary: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});
employeeSchema.pre('save', function () {
  this.id = uuidv7();
});
employeeSchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate() as { updatedAt?: Date };
  update.updatedAt = new Date();
});

export const employee = model<IEmployeeSchema>('employee', employeeSchema);
