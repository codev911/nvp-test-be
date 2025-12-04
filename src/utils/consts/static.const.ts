// Default static constants for the application
export const DEFAULT_ENV: string = 'development';
export const DEFAULT_PORT: string = '3000';
export const DEFAULT_LOG_LEVEL: string = 'debug';
export const DEFAULT_CORS_ORIGIN: string = '*';
export const DEFAULT_JWT_SECRET: string = 'your-secret-key';
export const DEFAULT_JWT_EXPIRES_IN: string = '1d';
export const DEFAULT_MONGO_URI: string = 'mongodb://localhost:27017';
export const DEFAULT_MONGO_DB_NAME: string = 'employee-management';
export const DEFAULT_PAGE_SIZE: number = 10;
export const DEFAULT_MAX_PAGE_SIZE: number = 100;
export const DEFAULT_PAGE_NUMBER: number = 1;

// HTTP Error Status Codes
export const HTTP_ERROR_STATUS: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
};
