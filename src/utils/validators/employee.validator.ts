import { z } from 'zod';

export const addEmployeeValidator = z
  .array(
    z.object({
      name: z.string().min(1, 'Name is required'),
      position: z.string().min(1, 'Position is required'),
      department: z.string().min(1, 'Department is required'),
      salary: z.number().positive('Salary must be a positive number'),
    }),
  )
  .min(1, 'At least one employee data is required');

export const updateEmployeeValidator = z
  .array(
    z.object({
      id: z.string().min(1, 'Employee ID is required'),
      name: z.string().min(1, 'Name is required').optional(),
      position: z.string().min(1, 'Position is required').optional(),
      department: z.string().min(1, 'Department is required').optional(),
      salary: z.number().positive('Salary must be a positive number').optional(),
    }),
  )
  .min(1, 'At least one employee data is required');

export const deleteEmployeeValidator = z
  .array(z.string().min(1, 'Employee ID is required'))
  .min(1, 'At least one Employee ID is required');
