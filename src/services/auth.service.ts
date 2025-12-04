import { admin } from '../database/schemas/admin.schema';
import { compareHash } from '../utils/hash.util';
import { generateToken } from './jwt.service';

export async function adminAuthenticate(email: string, password: string): Promise<string> {
  const adminRecord = await admin.findOne({ email });
  if (!adminRecord) {
    throw new Error('Authentication failed: Admin not found');
  }

  const isPasswordValid = await compareHash(password, adminRecord.password);
  if (!isPasswordValid) {
    throw new Error('Authentication failed: Invalid password');
  }

  const token = generateToken({
    sub: adminRecord.id,
    username: adminRecord.username,
    role: adminRecord.role,
  });
  return token;
}
