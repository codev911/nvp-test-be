import { z } from 'zod';
import { SortSelection } from '../../utils/enums/sort-selection.enum';
import { SortType } from '../../utils/enums/sort-type.enum';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '../consts/static.const';

export const filterEmployeeValidator = z.object({
  page: z.number().min(1, 'Minimum value is 1').default(DEFAULT_PAGE_NUMBER).optional(),
  limit: z
    .number()
    .min(1, 'Minimum value is 1')
    .max(100, 'Maximum value is 100')
    .default(DEFAULT_PAGE_SIZE)
    .optional(),
  sort: z.enum(SortSelection).default(SortSelection.NAME).optional(),
  sorttype: z.enum(SortType).default(SortType.ASC).optional(),
});

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
