import { authMiddleware } from '../../src/middlewares/auth.middleware';
import { createMockRequest, createMockResponse } from '../utils';

jest.mock('../../src/services/jwt.service', () => {
  const mockVerifyToken = jest.fn();
  return { verifyToken: (...args: any[]) => mockVerifyToken(...args), __mockVerifyToken: mockVerifyToken };
});
const mockVerifyToken = jest.requireMock('../../src/services/jwt.service').__mockVerifyToken as jest.Mock;

describe('auth.middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects missing header', () => {
    const req = createMockRequest();
    const res = createMockResponse();
    const next = jest.fn();
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects invalid format', () => {
    const req = createMockRequest({}, {}, { authorization: 'Token abc' });
    const res = createMockResponse();
    authMiddleware(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects missing token value', () => {
    const req = createMockRequest({}, {}, { authorization: 'Bearer' });
    const res = createMockResponse();
    authMiddleware(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects invalid token', () => {
    mockVerifyToken.mockImplementation(() => {
      throw new Error('bad');
    });
    const req = createMockRequest({}, {}, { authorization: 'Bearer bad' });
    const res = createMockResponse();
    authMiddleware(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('accepts valid token', () => {
    mockVerifyToken.mockReturnValue({ sub: '1' });
    const req = createMockRequest({}, {}, { authorization: 'Bearer good' });
    const res = createMockResponse();
    const next = jest.fn();
    authMiddleware(req, res, next);
    expect(res.locals.user).toEqual({ sub: '1' });
    expect(next).toHaveBeenCalled();
  });
});
