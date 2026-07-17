import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const count = await prisma.user.count();
  console.log(`db ok users=${count}`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`db fail: ${message}`);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
