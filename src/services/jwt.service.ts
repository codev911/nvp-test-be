import { type SignOptions, sign, verify } from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_SECRET } from '../utils/configs/env.config';

export function generateToken(payload: Record<string, unknown>): string {
  return sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions);
}

export function verifyToken(token: string): object {
  try {
    return verify(token, JWT_SECRET) as object;
  } catch (_err) {
    throw new Error('Invalid token');
  }
}
