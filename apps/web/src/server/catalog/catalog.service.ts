import { prisma } from '@/lib/prisma';

export async function listProducts(organizationId: string, activeOnly = true) {
  return prisma.product.findMany({
    where: {
      organizationId,
      ...(activeOnly ? { isActive: true } : {}),
    },
    orderBy: { name: 'asc' },
  });
}

export async function listServices(organizationId: string, activeOnly = true) {
  return prisma.service.findMany({
    where: {
      organizationId,
      ...(activeOnly ? { isActive: true } : {}),
    },
    orderBy: { name: 'asc' },
  });
}

export async function getCatalog(organizationId: string) {
  const [products, services] = await Promise.all([
    listProducts(organizationId),
    listServices(organizationId),
  ]);
  return { products, services };
}
