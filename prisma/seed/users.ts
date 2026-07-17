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

  const superAdmin = await prisma.user.upsert({
    where: { email: 'super@kesbyar.ir' },
    create: {
      name: 'مدیر پلتفرم',
      email: 'super@kesbyar.ir',
      phone: '09120000000',
      passwordHash,
      platformRole: 'SUPER_ADMIN',
    },
    update: {
      name: 'مدیر پلتفرم',
      phone: '09120000000',
      passwordHash,
      platformRole: 'SUPER_ADMIN',
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: 'demo@kesbyar.ir' },
    create: {
      name: 'سارا موسوی',
      email: 'demo@kesbyar.ir',
      phone: '09121234567',
      passwordHash,
    },
    update: {
      name: 'سارا موسوی',
      phone: '09121234567',
      passwordHash,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@kesbyar.ir' },
    create: {
      name: 'امیر حسینی',
      email: 'manager@kesbyar.ir',
      phone: '09129876543',
      passwordHash,
    },
    update: {
      name: 'امیر حسینی',
      phone: '09129876543',
      passwordHash,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@kesbyar.ir' },
    create: {
      name: 'مریم کاظمی',
      email: 'staff@kesbyar.ir',
      phone: '09125551234',
      passwordHash,
    },
    update: {
      name: 'مریم کاظمی',
      phone: '09125551234',
      passwordHash,
    },
  });

  return { superAdmin, owner, manager, staff };
}
