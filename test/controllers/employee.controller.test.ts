import { Readable } from 'stream';
import { createMockRequest, createMockResponse } from '../utils';

jest.mock('../../src/services/employee.service', () => {
  const mockAddEmployees = jest.fn();
  const mockUpdateEmployees = jest.fn();
  const mockDeleteEmployees = jest.fn();
  const mockGetDataEmployee = jest.fn();
  return {
    addEmployees: (...args: any[]) => mockAddEmployees(...args),
    updateEmployees: (...args: any[]) => mockUpdateEmployees(...args),
    deleteEmployees: (...args: any[]) => mockDeleteEmployees(...args),
    getDataEmployee: (...args: any[]) => mockGetDataEmployee(...args),
    __mocks: { mockAddEmployees, mockUpdateEmployees, mockDeleteEmployees, mockGetDataEmployee },
  };
});

jest.mock('../../src/services/notification.service', () => {
  const mockCreateNotification = jest.fn();
  return { createNotification: (...args: any[]) => mockCreateNotification(...args), __mockCreateNotification: mockCreateNotification };
});

jest.mock('../../src/utils/validators/employee.validator', () => {
  const mockAddValidator = jest.fn((body) => body);
  const mockUpdateValidator = jest.fn((body) => body);
  const mockDeleteValidator = jest.fn((body) => body);
  const mockFilterValidator = jest.fn((body) => body);
  return {
    addEmployeeValidator: { parse: (...args: any[]) => mockAddValidator(...args) },
    updateEmployeeValidator: { parse: (...args: any[]) => mockUpdateValidator(...args) },
    deleteEmployeeValidator: { parse: (...args: any[]) => mockDeleteValidator(...args) },
    filterEmployeeValidator: { parse: (...args: any[]) => mockFilterValidator(...args) },
    __mocks: { mockAddValidator, mockUpdateValidator, mockDeleteValidator, mockFilterValidator },
  };
});

import { add, addFromCSV, getDataEmp, remove, update } from '../../src/controllers/employee.controller';
const {
  mockAddEmployees,
  mockUpdateEmployees,
  mockDeleteEmployees,
  mockGetDataEmployee,
} = jest.requireMock('../../src/services/employee.service').__mocks;
const mockCreateNotification = jest.requireMock('../../src/services/notification.service')
  .__mockCreateNotification as jest.Mock;
const {
  mockAddValidator,
  mockUpdateValidator,
  mockDeleteValidator,
  mockFilterValidator,
} = jest.requireMock('../../src/utils/validators/employee.validator').__mocks;

const mockBusboyHandlers: Record<string, Function> = {};
const mockCsvHandlers: Record<string, Function> = {};

jest.mock('busboy', () => {
  return jest.fn(() => ({
    on: (event: string, cb: Function) => {
      mockBusboyHandlers[event] = cb;
    },
  }));
});

jest.mock('csv-parser', () => {
  return jest.fn(() => ({
    on: (event: string, cb: Function) => {
      mockCsvHandlers[event] = cb;
    },
    pause: jest.fn(),
    resume: jest.fn(),
    pipe: jest.fn(),
  }));
});

describe('employee.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockBusboyHandlers).forEach((k) => delete mockBusboyHandlers[k]);
    Object.keys(mockCsvHandlers).forEach((k) => delete mockCsvHandlers[k]);
  });

  it('adds employees', async () => {
    const req = createMockRequest([{ name: 'A', position: 'P', salary: 1, age: 1 }]);
    const res = createMockResponse();
    await add(req, res);
    expect(mockAddEmployees).toHaveBeenCalled();
    expect(mockCreateNotification).toHaveBeenCalled();
  });

  it('returns 400 on add validation error', async () => {
    mockAddValidator.mockImplementationOnce(() => {
      throw new Error(JSON.stringify([{ message: 'err' }]));
    });
    const req = createMockRequest([]);
    const res = createMockResponse();
    await add(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('updates employees', async () => {
    const req = createMockRequest([{ id: '1', name: 'B' }]);
    const res = createMockResponse();
    await update(req, res);
    expect(mockUpdateEmployees).toHaveBeenCalled();
  });

  it('handles delete employees', async () => {
    const req = createMockRequest(['1']);
    const res = createMockResponse();
    await remove(req, res);
    expect(mockDeleteEmployees).toHaveBeenCalled();
  });

  it('gets data with pagination', async () => {
    mockGetDataEmployee.mockResolvedValue({
      result: [],
      pagination: { limit: 10, page: 1, total_page: 1, total_data: 0 },
    });
    const req = createMockRequest({}, { page: '1', limit: '10', sort: 'name', sorttype: 'asc', search: 'john' });
    const res = createMockResponse();
    await getDataEmp(req, res);
    expect(mockFilterValidator).toHaveBeenCalled();
    expect(mockGetDataEmployee).toHaveBeenCalledWith(1, 10, 'name', 'asc', 'john');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 400 on filter validation error', async () => {
    mockFilterValidator.mockImplementationOnce(() => {
      throw new Error(JSON.stringify([{ message: 'bad' }]));
    });
    const req = createMockRequest({}, { page: '0' });
    const res = createMockResponse();
    await getDataEmp(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('streams CSV and queues import', async () => {
    const req = createMockRequest();
    const res = createMockResponse();
    const csvStream: any = { on: jest.fn((event: string, cb: Function) => (mockCsvHandlers[event] = cb)), pause: jest.fn(), resume: jest.fn() };
    const fileStream = { pipe: jest.fn(() => csvStream) } as unknown as Readable;

    addFromCSV(req, res);
    mockBusboyHandlers.file?.('file', fileStream, {});
    // trigger batch path and tail batch
    for (let i = 0; i < 11; i += 1) {
      mockCsvHandlers.data?.({ name: `A${i}`, position: 'P', salary: `${100 + i}`, age: `${30 + i}` });
    }
    await mockCsvHandlers.end?.();
    await Promise.resolve();

    expect(mockAddEmployees).toHaveBeenCalled();
    expect(mockCreateNotification).toHaveBeenCalledWith(expect.any(String), expect.stringContaining('CSV'));
  });

  it('handles CSV and upload errors', () => {
    const req = createMockRequest();
    const res = createMockResponse();
    addFromCSV(req, res);
    mockBusboyHandlers.error?.(new Error('fail'));
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('handles CSV parse error', () => {
    const req = createMockRequest();
    const res = createMockResponse();
    const csvStream: any = { on: jest.fn((event: string, cb: Function) => (mockCsvHandlers[event] = cb)), pause: jest.fn(), resume: jest.fn() };
    const fileStream = { pipe: jest.fn(() => csvStream) } as unknown as Readable;
    addFromCSV(req, res);
    mockBusboyHandlers.file?.('file', fileStream, {});
    mockCsvHandlers.error?.(new Error('csv fail'));
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('handles CSV end with no rows', async () => {
    const req = createMockRequest();
    const res = createMockResponse();
    const csvStream: any = { on: jest.fn((event: string, cb: Function) => (mockCsvHandlers[event] = cb)), pause: jest.fn(), resume: jest.fn() };
    const fileStream = { pipe: jest.fn(() => csvStream) } as unknown as Readable;
    addFromCSV(req, res);
    mockBusboyHandlers.file?.('file', fileStream, {});
    await mockCsvHandlers.end?.();
    expect(mockAddEmployees).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 400 on update validation error', async () => {
    mockUpdateValidator.mockImplementationOnce(() => {
      throw new Error(JSON.stringify([{ message: 'bad' }]));
    });
    const req = createMockRequest([]);
    const res = createMockResponse();
    await update(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 on delete validation error', async () => {
    mockDeleteValidator.mockImplementationOnce(() => {
      throw new Error(JSON.stringify([{ message: 'bad' }]));
    });
    const req = createMockRequest([]);
    const res = createMockResponse();
    await remove(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
