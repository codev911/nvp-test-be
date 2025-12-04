import { AdminRole } from '../../utils/enums/admin-role.enum';
import type { IAdminSchema } from '../../utils/interfaces/schemas/admin-schema.interface';
import logger from '../../utils/log.util';
import { connectToDatabase, disconnectFromDatabase } from '../mongo.database';
import { admin } from '../schemas/admin.schema';

async function adminSeeder(): Promise<void> {
  try {
    await connectToDatabase();

    const superAdmin: IAdminSchema = {
      username: 'superadmin',
      password: 'superadmin123!',
      email: 'superadmin@example.com',
      role: AdminRole.SUPERADMIN,
    };

    const existingAdmin = await admin.findOne({ username: superAdmin.username });
    if (existingAdmin) {
      logger.info('Superadmin already exists. Skipping creation.');
    } else {
      const seedSuperAdmin = new admin(superAdmin);
      await seedSuperAdmin.save();
      logger.info('Superadmin created successfully.');
    }
  } finally {
    await disconnectFromDatabase();
  }
}

adminSeeder().catch((error) => {
  logger.error('Admin seeder failed:', error);
});
