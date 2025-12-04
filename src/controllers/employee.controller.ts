import type { Request, Response } from 'express';
import { addEmployees, deleteEmployees, updateEmployees } from '../services/employee.service';
import type { IResponse } from '../utils/interfaces/response.interface';
import {
  addEmployeeValidator,
  deleteEmployeeValidator,
  updateEmployeeValidator,
} from '../utils/validators/employee.validator';

export async function add(req: Request, res: Response) {
  const response: IResponse = {
    message: 'Employee added to queue for processing successfully.',
    data: undefined,
  };

  try {
    addEmployeeValidator.parse(req.body);
  } catch (error: unknown) {
    const errorMessages =
      error instanceof Error ? JSON.parse(error.message) : [{ message: 'Invalid request body' }];
    response.message = errorMessages.map((err: { message: string }) => err.message).join(', ');

    return res.status(400).json(response);
  }

  await addEmployees(req.body);
  response.data = {
    total_queued: req.body.length,
  };

  return res.status(200).json(response);
}

export async function update(req: Request, res: Response) {
  const response: IResponse = {
    message: 'Employee update added to queue for processing successfully.',
    data: undefined,
  };

  try {
    updateEmployeeValidator.parse(req.body);
  } catch (error: unknown) {
    const errorMessages =
      error instanceof Error ? JSON.parse(error.message) : [{ message: 'Invalid request body' }];
    response.message = errorMessages.map((err: { message: string }) => err.message).join(', ');

    return res.status(400).json(response);
  }

  await updateEmployees(req.body);
  response.data = {
    total_queued: req.body.length,
  };

  return res.status(200).json(response);
}

export async function remove(req: Request, res: Response) {
  const response: IResponse = {
    message: 'Employee deletion added to queue for processing successfully.',
    data: undefined,
  };

  try {
    deleteEmployeeValidator.parse(req.body);
  } catch (error: unknown) {
    const errorMessages =
      error instanceof Error ? JSON.parse(error.message) : [{ message: 'Invalid request body' }];
    response.message = errorMessages.map((err: { message: string }) => err.message).join(', ');

    return res.status(400).json(response);
  }

  await deleteEmployees(req.body);
  response.data = {
    total_queued: req.body.length,
  };

  return res.status(200).json(response);
}
