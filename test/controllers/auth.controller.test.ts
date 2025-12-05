import { authAdmin, authMe } from '../../src/controllers/auth.controller';
import { createMockRequest, createMockResponse } from '../utils';

const mockAdminAuthenticate = jest.fn();

jest.mock('../../src/services/auth.service', () => ({
  adminAuthenticate: (...args: any[]) => mockAdminAuthenticate(...args),
}));

describe('auth.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns token on success', async () => {
    mockAdminAuthenticate.mockResolvedValue('token');
    const req = createMockRequest({ email: 'a@b.com', password: 'secret123' });
    const res = createMockResponse();
    await authAdmin(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect((res.json as jest.Mock).mock.calls[0][0].data.token).toBe('token');
  });

  it('handles validation error', async () => {
    const req = createMockRequest({ email: '', password: '' });
    const res = createMockResponse();
    await authAdmin(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('handles service errors', async () => {
    const req = createMockRequest({ email: 'a@b.com', password: 'secret123' });

    mockAdminAuthenticate.mockRejectedValue(new Error('Authentication failed: Admin not found'));
    const resNotFound = createMockResponse();
    await authAdmin(req, resNotFound);
    expect(resNotFound.status).toHaveBeenCalledWith(404);

    mockAdminAuthenticate.mockRejectedValue(new Error('Authentication failed: Invalid password'));
    const resInvalid = createMockResponse();
    await authAdmin(req, resInvalid);
    expect(resInvalid.status).toHaveBeenCalledWith(401);

    mockAdminAuthenticate.mockRejectedValue(new Error('Other'));
    const resOther = createMockResponse();
    await authAdmin(req, resOther);
    expect(resOther.status).toHaveBeenCalledWith(500);
  });

  it('returns me data', () => {
    const req = createMockRequest();
    const res = createMockResponse();
    (res as any).locals = { user: { username: 'john', role: 'admin' } };
    authMe(req, res);
    expect(res.json).toHaveBeenCalled();
  });
});
