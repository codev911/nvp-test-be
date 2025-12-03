import type { ResponseStatus } from '../enums/response-status.enum';

export interface IErrorResponse {
  status?: ResponseStatus;
  message: string;
  cause?: unknown;
  stack?: unknown;
  code?: number;
}
