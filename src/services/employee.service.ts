import { addEmployeeJob } from '../queues/employee.queue';
import { QueueActionEnum } from '../utils/enums/queue-action.enum';
import type {
  IEmployeeCreate,
  IEmployeeUpdate,
} from '../utils/interfaces/schemas/employee-schema.interface';

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
