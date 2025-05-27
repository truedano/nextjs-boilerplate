import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  try {
    // Read existing admin data
    const adminPath = path.join(process.cwd(), 'data', 'admin.json');
    const adminData = JSON.parse(fs.readFileSync(adminPath, 'utf-8'));

    // Read existing users data
    const usersPath = path.join(process.cwd(), 'data', 'users.json');
    const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));

    // Migrate admin user
    await prisma.user.upsert({
      where: { username: adminData.username },
      update: { passwordHash: adminData.password, role: 'admin' },
      create: { username: adminData.username, passwordHash: adminData.password, role: 'admin' },
    });
    console.log(`Migrated admin user: ${adminData.username}`);

    // Migrate general users
    for (const user of usersData) {
      await prisma.user.upsert({
        where: { username: user.username },
        update: { passwordHash: user.password, role: 'user' },
        create: { username: user.username, passwordHash: user.password, role: 'user' },
      });
      console.log(`Migrated user: ${user.username}`);
    }

    console.log('All users migrated successfully!');
  } catch (error) {
    console.error('Error migrating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();