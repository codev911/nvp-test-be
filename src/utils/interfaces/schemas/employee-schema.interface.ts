import type { QueueActionEnum } from '../../enums/queue-action.enum';

export interface IEmployeeSchema {
  id?: string;
  name: string;
  age: number;
  position: string;
  salary: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface IEmployeeCreate {
  name: string;
  age: number;
  position: string;
  salary: number;
}

export interface IEmployeeUpdate {
  id: string;
  name?: string;
  age?: number;
  position?: string;
  salary?: number;
}

export interface IEmployeeQueue {
  action: QueueActionEnum;
  id?: string;
  name?: string;
  age?: number;
  position?: string;
  salary?: number;
}
