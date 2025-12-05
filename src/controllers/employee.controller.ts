import Busboy from 'busboy';
import csv from 'csv-parser';
import type { Request, Response } from 'express';
import {
  addEmployees,
  deleteEmployees,
  getDataEmployee,
  updateEmployees,
} from '../services/employee.service';
import { createNotification } from '../services/notification.service';
import { DEFAULT_BATCH_SIZE } from '../utils/consts/static.const';
import type { SortSelection } from '../utils/enums/sort-selection.enum';
import type { SortType } from '../utils/enums/sort-type.enum';
import type { IResponse } from '../utils/interfaces/response.interface';
import type { IEmployeeCreate } from '../utils/interfaces/schemas/employee-schema.interface';
import {
  addEmployeeValidator,
  deleteEmployeeValidator,
  filterEmployeeValidator,
  updateEmployeeValidator,
} from '../utils/validators/employee.validator';

export function addFromCSV(req: Request, res: Response) {
  const busboy = Busboy({ headers: req.headers });

  let totalQueuedRows = 0;

  busboy.on('file', (_fieldname, fileStream, _info) => {
    let batch: IEmployeeCreate[] = [];
    const csvStream = fileStream.pipe(csv());

    csvStream.on('data', async (rawRow: IEmployeeCreate) => {
      csvStream.pause();

      const parsedRow: IEmployeeCreate = {
        name: rawRow.name,
        position: rawRow.position,
        salary: Number(rawRow.salary),
        age: Number(rawRow.age),
      };

      batch.push(parsedRow);

      if (batch.length >= DEFAULT_BATCH_SIZE) {
        const currentBatch = batch;
        batch = [];

        totalQueuedRows += currentBatch.length;
        await addEmployees(currentBatch);
      }

      csvStream.resume();
    });

    csvStream.on('end', async () => {
      if (batch.length > 0) {
        totalQueuedRows += batch.length;
        await addEmployees(batch);
      }

      const response: IResponse = {
        message: 'Employee added to queue for processing successfully.',
        data: {
          total_queued: totalQueuedRows,
        },
      };

      await createNotification(
        'CSV import',
        `Import CSV ${totalQueuedRows} baris sedang diproses.`,
      );

      res.status(200).json(response);
    });

    csvStream.on('error', (_err) => {
      res.status(500).json({ error: 'CSV parse error' });
    });
  });

  busboy.on('error', (_err) => {
    res.status(500).json({ error: 'Upload error' });
  });

  req.pipe(busboy);
}

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
  await createNotification(
    'Employee queued',
    `Menambahkan ${req.body.length} data karyawan ke antrean.`,
  );

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
  await createNotification('Employee update', `Memperbarui ${req.body.length} data karyawan.`);

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
  await createNotification('Employee delete', `Menghapus ${req.body.length} data karyawan.`);

  return res.status(200).json(response);
}

export async function getDataEmp(req: Request, res: Response) {
  const { page, limit, sort, sorttype, search } = req.query;
  const response: IResponse = {
    message: 'Successfully get employee data.',
    data: null,
    pagination: {},
  };
  const data = {
    page: page ? parseInt(page as unknown as string, 10) : undefined,
    limit: limit ? parseInt(limit as unknown as string, 10) : undefined,
    sort: sort ? (sort as unknown as SortSelection) : undefined,
    sorttype: sorttype ? (sorttype as unknown as SortType) : undefined,
    search: search ? (search as unknown as string) : undefined,
  };

  try {
    filterEmployeeValidator.parse({ ...data });
  } catch (error: unknown) {
    const errorMessages =
      error instanceof Error ? JSON.parse(error.message) : [{ message: 'Invalid request body' }];
    response.message = errorMessages.map((err: { message: string }) => err.message).join(', ');

    return res.status(400).json(response);
  }

  const getData = await getDataEmployee(
    data.page,
    data.limit,
    data.sort,
    data.sorttype,
    data.search,
  );
  response.data = getData.result;
  response.pagination = {
    limit: getData.pagination.limit,
    page: getData.pagination.page,
    total_page: getData.pagination.total_page,
    total_data: getData.pagination.total_data,
  };

  res.status(200).json(response);
}
