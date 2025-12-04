import bcrypt from 'bcrypt';

export async function hashData(data: string): Promise<string> {
  const saltRounds = 10;
  const hashedData = await bcrypt.hash(data, saltRounds);
  return hashedData;
}

export async function compareHash(data: string, hashedData: string): Promise<boolean> {
  return await bcrypt.compare(data, hashedData);
}
