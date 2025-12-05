jest.mock('../../src/database/schemas/employee.schema', () => {
  const mockFind = jest.fn();
  const mockCountDocuments = jest.fn();
  return {
    employee: {
      find: mockFind,
      countDocuments: mockCountDocuments,
    },
    __mockFind: mockFind,
    __mockCountDocuments: mockCountDocuments,
  };
});

jest.mock('../../src/queues/employee.queue', () => {
  const mockAddEmployeeJob = jest.fn();
  return { addEmployeeJob: mockAddEmployeeJob, __mockAddEmployeeJob: mockAddEmployeeJob };
});

import {
  addEmployees,
  deleteEmployees,
  getDataEmployee,
  updateEmployees,
} from '../../src/services/employee.service';

const mockFind = jest.requireMock('../../src/database/schemas/employee.schema').__mockFind as jest.Mock;
const mockCountDocuments = jest.requireMock('../../src/database/schemas/employee.schema')
  .__mockCountDocuments as jest.Mock;
const mockAddEmployeeJob = jest.requireMock('../../src/queues/employee.queue').__mockAddEmployeeJob as jest.Mock;

describe('employee.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function mockQuery(result: any[]) {
    const query = {
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(result),
    };
    mockFind.mockReturnValue(query as any);
    return query;
  }

  it('gets data with pagination and sorting', async () => {
    const items = [{ id: '1', name: 'A' }];
    mockQuery(items);
    mockCountDocuments.mockResolvedValue(1);

    const res = await getDataEmployee(1, 10, 'name' as any, 'asc' as any);
    expect(mockFind).toHaveBeenCalledWith({});
    expect(res.result).toEqual(items);
    expect(res.pagination.total_data).toBe(1);
  });

  it('applies search filter for name/position/age', async () => {
    mockQuery([]);
    mockCountDocuments.mockResolvedValue(0);
    await getDataEmployee(1, 10, 'name' as any, 'asc' as any, 'john');
    const filter = mockFind.mock.calls[0][0];
    expect(filter.$or).toBeTruthy();
  });

  it('applies numeric search filter', async () => {
    mockQuery([]);
    mockCountDocuments.mockResolvedValue(0);
    await getDataEmployee(1, 10, 'name' as any, 'asc' as any, '25');
    const filter = mockFind.mock.calls[0][0];
    expect(filter.$or?.some((item: any) => 'age' in item)).toBe(true);
  });

  it('throws when limit above max', async () => {
    await expect(getDataEmployee(1, 1000 as any, 'name' as any, 'asc' as any)).rejects.toThrow(
      'Max page limit',
    );
  });

  it('queues add employees', async () => {
    await addEmployees([{ name: 'A', age: 1, position: 'P', salary: 1 }]);
    expect(mockAddEmployeeJob).toHaveBeenCalledTimes(1);
  });

  it('queues update employees', async () => {
    await updateEmployees([{ id: '1', name: 'B' } as any]);
    expect(mockAddEmployeeJob).toHaveBeenCalledWith(expect.objectContaining({ action: 'update' }));
  });

  it('queues delete employees', async () => {
    await deleteEmployees(['1', '2']);
    expect(mockAddEmployeeJob).toHaveBeenCalledTimes(2);
  });
});
