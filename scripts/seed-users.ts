import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    const adminPassword = 'admin';
    const userPassword = '123456';

    const hashedPasswordAdmin = await bcrypt.hash(adminPassword, 10);
    const hashedPasswordUser = await bcrypt.hash(userPassword, 10);

    // Seed admin user
    await prisma.user.upsert({
      where: { username: 'admin' },
      update: { passwordHash: hashedPasswordAdmin, role: 'admin' },
      create: { username: 'admin', passwordHash: hashedPasswordAdmin, role: 'admin' },
    });
    console.log('Seeded admin user: admin');

    // Seed general users
    await prisma.user.upsert({
      where: { username: 'user1' },
      update: { passwordHash: hashedPasswordUser, role: 'user' },
      create: { username: 'user1', passwordHash: hashedPasswordUser, role: 'user' },
    });
    console.log('Seeded user: user1');

    await prisma.user.upsert({
      where: { username: 'user2' },
      update: { passwordHash: hashedPasswordUser, role: 'user' },
      create: { username: 'user2', passwordHash: hashedPasswordUser, role: 'user' },
    });
    console.log('Seeded user: user2');

    await prisma.user.upsert({
      where: { username: 'user3' },
      update: { passwordHash: hashedPasswordUser, role: 'user' },
      create: { username: 'user3', passwordHash: hashedPasswordUser, role: 'user' },
    });
    console.log('Seeded user: user3');

    console.log('All initial users seeded successfully!');
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();