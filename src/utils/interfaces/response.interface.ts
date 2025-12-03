import type { ResponseStatus } from '../enums/response-status.enum';

export interface IResponse {
  status?: ResponseStatus;
  message: string;
  data?: unknown;
  pagination?: {
    total_data?: number;
    total_page?: number;
    page?: number;
    limit?: number;
  };
}
