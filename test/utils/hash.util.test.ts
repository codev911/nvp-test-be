import { compareHash, hashData } from '../../src/utils/hash.util';

jest.mock('bcrypt', () => ({
  hash: jest.fn(async (data: string) => `hashed-${data}`),
  compare: jest.fn(async (data: string, hash: string) => hash === `hashed-${data}`),
}));

describe('hash.util', () => {
  it('hashes data', async () => {
    const hashed = await hashData('secret');
    expect(hashed).toBe('hashed-secret');
  });

  it('compares hash', async () => {
    const result = await compareHash('secret', 'hashed-secret');
    expect(result).toBe(true);
  });
});
