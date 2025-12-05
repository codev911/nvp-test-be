import { getNotifications, markNotificationsRead } from '../../src/controllers/notification.controller';
import { createMockRequest, createMockResponse } from '../utils';

const mockListNotifications = jest.fn();
const mockMarkNotifications = jest.fn();

jest.mock('../../src/services/notification.service', () => ({
  listNotifications: (...args: any[]) => mockListNotifications(...args),
  markNotifications: (...args: any[]) => mockMarkNotifications(...args),
}));

describe('notification.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns notifications', async () => {
    mockListNotifications.mockResolvedValue([{ id: '1' }]);
    const req = createMockRequest({}, { limit: '10' });
    const res = createMockResponse();
    await getNotifications(req, res);
    expect(mockListNotifications).toHaveBeenCalledWith(10);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('marks notifications as read', async () => {
    mockMarkNotifications.mockResolvedValue(2);
    const req = createMockRequest(['1', '2']);
    const res = createMockResponse();
    await markNotificationsRead(req, res);
    expect(mockMarkNotifications).toHaveBeenCalledWith(['1', '2']);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('marks notifications with empty body', async () => {
    const req = createMockRequest({});
    const res = createMockResponse();
    await markNotificationsRead(req, res);
    expect(mockMarkNotifications).toHaveBeenCalledWith([]);
  });
});
