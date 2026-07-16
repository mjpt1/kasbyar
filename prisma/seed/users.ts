import type { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { DEMO_PASSWORD } from './constants';
import type { SeedUsers } from './types';

export async function seedUsers(prisma: PrismaClient): Promise<SeedUsers> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  await prisma.platformSettings.upsert({
    where: { id: 'platform' },
    create: { id: 'platform' },
    update: {},
  });

  const superAdmin = await prisma.user.create({
    data: {
      name: 'مدیر پلتفرم',
      email: 'super@kesbyar.ir',
      phone: '09120000000',
      passwordHash,
      platformRole: 'SUPER_ADMIN',
    },
  });

  const owner = await prisma.user.create({
    data: {
      name: 'سارا موسوی',
      email: 'demo@kesbyar.ir',
      phone: '09121234567',
      passwordHash,
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: 'امیر حسینی',
      email: 'manager@kesbyar.ir',
      phone: '09129876543',
      passwordHash,
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: 'مریم کاظمی',
      email: 'staff@kesbyar.ir',
      phone: '09125551234',
      passwordHash,
    },
  });

  return { superAdmin, owner, manager, staff };
}
