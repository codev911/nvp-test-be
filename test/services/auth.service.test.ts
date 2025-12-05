jest.mock('../../src/database/schemas/admin.schema', () => {
  const mockFindOne = jest.fn();
  return { admin: { findOne: mockFindOne }, __mockFindOne: mockFindOne };
});

jest.mock('../../src/utils/hash.util', () => {
  const mockCompareHash = jest.fn();
  return { compareHash: mockCompareHash, __mockCompareHash: mockCompareHash };
});

jest.mock('../../src/services/jwt.service', () => {
  const mockGenerateToken = jest.fn(() => 'jwt-token');
  return { generateToken: mockGenerateToken, __mockGenerateToken: mockGenerateToken };
});

import { adminAuthenticate } from '../../src/services/auth.service';
const mockFindOne = (jest.requireMock('../../src/database/schemas/admin.schema').__mockFindOne as jest.Mock);
const mockCompareHash = (jest.requireMock('../../src/utils/hash.util').__mockCompareHash as jest.Mock);
const mockGenerateToken = (jest.requireMock('../../src/services/jwt.service').__mockGenerateToken as jest.Mock);

describe('auth.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('authenticates admin and returns token', async () => {
    mockFindOne.mockResolvedValue({
      id: '1',
      username: 'user',
      role: 'admin',
      password: 'hashed',
    });
    mockCompareHash.mockResolvedValue(true);
    const token = await adminAuthenticate('a@b.com', 'pass');
    expect(mockFindOne).toHaveBeenCalledWith({ email: 'a@b.com' });
    expect(mockCompareHash).toHaveBeenCalledWith('pass', 'hashed');
    expect(mockGenerateToken).toHaveBeenCalled();
    expect(token).toBe('jwt-token');
  });

  it('throws when admin not found', async () => {
    mockFindOne.mockResolvedValue(null);
    await expect(adminAuthenticate('x', 'y')).rejects.toThrow('Admin not found');
  });

  it('throws when password invalid', async () => {
    mockFindOne.mockResolvedValue({ password: 'hashed' });
    mockCompareHash.mockResolvedValue(false);
    await expect(adminAuthenticate('x', 'y')).rejects.toThrow('Invalid password');
  });
});
