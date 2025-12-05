jest.mock('jsonwebtoken', () => {
  const mockSign = jest.fn(() => 'signed-token');
  const mockVerify = jest.fn((token: string) => {
    if (token === 'bad') {
      throw new Error('bad');
    }
    return { sub: '123' };
  });
  return { sign: mockSign, verify: mockVerify, __mocks: { mockSign, mockVerify } };
});

import { generateToken, verifyToken } from '../../src/services/jwt.service';
const { mockSign, mockVerify } = jest.requireMock('jsonwebtoken').__mocks as {
  mockSign: jest.Mock;
  mockVerify: jest.Mock;
};

describe('jwt.service', () => {
  it('generates token with payload', () => {
    const token = generateToken({ foo: 'bar' });
    expect(mockSign).toHaveBeenCalled();
    expect(token).toBe('signed-token');
  });

  it('verifies valid token', () => {
    const payload = verifyToken('good');
    expect(mockVerify).toHaveBeenCalledWith('good', expect.any(String));
    expect(payload).toEqual({ sub: '123' });
  });

  it('throws on invalid token', () => {
    expect(() => verifyToken('bad')).toThrow('Invalid token');
  });
});
