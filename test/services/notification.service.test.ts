jest.mock('../../src/database/schemas/notification.schema', () => {
  const mockSave = jest.fn();
  const mockFind = jest.fn();
  const mockUpdateMany = jest.fn();
  const mockNotification = Object.assign(
    function () {
      return { save: mockSave };
    },
    {
      find: mockFind,
      updateMany: mockUpdateMany,
    },
  );
  return { notification: mockNotification, __mocks: { mockSave, mockFind, mockUpdateMany } };
});

jest.mock('../../src/websocket/notification.websocket', () => {
  const mockPublishNotification = jest.fn();
  return { publishNotification: mockPublishNotification, __mockPublishNotification: mockPublishNotification };
});

import {
  createNotification,
  listNotifications,
  markNotifications,
} from '../../src/services/notification.service';

const { mockSave, mockFind, mockUpdateMany } = jest.requireMock('../../src/database/schemas/notification.schema')
  .__mocks as {
  mockSave: jest.Mock;
  mockFind: jest.Mock;
  mockUpdateMany: jest.Mock;
};
const mockPublishNotification = jest.requireMock('../../src/websocket/notification.websocket')
  .__mockPublishNotification as jest.Mock;

describe('notification.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates and publishes notification', async () => {
    const payload = {
      id: '1',
      title: 't',
      message: 'm',
      read: false,
      created_at: new Date(),
      toObject: () => ({ id: '1', title: 't', message: 'm', read: false, created_at: new Date() }),
    };
    mockSave.mockResolvedValue(payload);

    const result = await createNotification('t', 'm');
    expect(result.title).toBe('t');
    expect(mockPublishNotification).toHaveBeenCalled();
  });

  it('lists notifications with mapping', async () => {
    const now = new Date();
    mockFind.mockReturnValue({
      sort: () => ({
        limit: () =>
          Promise.resolve([
            { id: '1', title: 'A', message: 'B', read: false, created_at: now, toObject: () => ({ id: '1', title: 'A', message: 'B', read: false, created_at: now }) },
          ]),
      }),
    });

    const list = await listNotifications();
    expect(mockFind).toHaveBeenCalled();
    expect(list[0].id).toBe('1');
  });

  it('marks notifications read', async () => {
    mockUpdateMany.mockResolvedValue({ modifiedCount: 2 });
    const res = await markNotifications(['1', '2']);
    expect(mockUpdateMany).toHaveBeenCalledWith({ id: { $in: ['1', '2'] } }, { $set: { read: true } });
    expect(res).toBe(2);
  });

  it('marks all notifications when ids not provided', async () => {
    mockUpdateMany.mockResolvedValue({ modifiedCount: 5 });
    await markNotifications();
    expect(mockUpdateMany).toHaveBeenCalledWith({}, { $set: { read: true } });
  });
});
