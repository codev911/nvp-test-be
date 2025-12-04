import { employee } from '../database/schemas/employee.schema';
import { addEmployeeJob } from '../queues/employee.queue';
import {
  DEFAULT_MAX_PAGE_SIZE,
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
} from '../utils/consts/static.const';
import { QueueActionEnum } from '../utils/enums/queue-action.enum';
import { SortSelection } from '../utils/enums/sort-selection.enum';
import { SortType } from '../utils/enums/sort-type.enum';
import type {
  IEmployeeCreate,
  IEmployeeUpdate,
} from '../utils/interfaces/schemas/employee-schema.interface';

export async function getDataEmployee(
  page: number = DEFAULT_PAGE_NUMBER,
  limit: number = DEFAULT_PAGE_SIZE,
  sort: SortSelection = SortSelection.NAME,
  sorttype: SortType = SortType.ASC,
) {
  if (limit > DEFAULT_MAX_PAGE_SIZE) {
    throw new Error(`Max page limit is ${DEFAULT_MAX_PAGE_SIZE}`);
  }

  const result = await Promise.all([
    employee
      .find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort([[sort, sorttype]]),
    employee.countDocuments(),
  ]);
  const mod = result[1] % limit;

  return {
    result: result[0],
    pagination: {
      page,
      limit,
      total_data: result[1],
      total_page: (result[1] - mod) / limit + (mod > 0 ? 1 : 0),
    },
  };
}

export async function addEmployees(data: IEmployeeCreate[]) {
  for (const emp of data) {
    await addEmployeeJob({ action: QueueActionEnum.INSERT, ...emp });
  }
}

export async function updateEmployees(data: IEmployeeUpdate[]) {
  for (const emp of data) {
    await addEmployeeJob({ action: QueueActionEnum.UPDATE, ...emp });
  }
}

export async function deleteEmployees(ids: string[]) {
  for (const id of ids) {
    await addEmployeeJob({ action: QueueActionEnum.DELETE, id });
  }
}
