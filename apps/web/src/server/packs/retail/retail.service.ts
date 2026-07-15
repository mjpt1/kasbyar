import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

const DEFAULT_REORDER_LEVEL = 10;

export async function listRetailProducts(
  organizationId: string,
  params: { search?: string; lowStockOnly?: boolean; page?: number; pageSize?: number },
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;

  const products = await prisma.product.findMany({
    where: {
      organizationId,
      isActive: true,
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: 'insensitive' } },
              { sku: { contains: params.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { name: 'asc' },
  });

  const withStock = products.map((p) => ({
    ...p,
    isLowStock: isLowStock(p),
  }));

  const filtered = params.lowStockOnly
    ? withStock.filter((p) => p.isLowStock)
    : withStock;

  const total = filtered.length;
  const items = filtered.slice((page - 1) * pageSize, page * pageSize);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

function isLowStock(product: { stockQty: Prisma.Decimal; reorderLevel: Prisma.Decimal | null }) {
  const level = product.reorderLevel
    ? Number(product.reorderLevel)
    : DEFAULT_REORDER_LEVEL;
  return Number(product.stockQty) <= level;
}

export async function getProduct(organizationId: string, id: string) {
  return prisma.product.findFirst({
    where: { id, organizationId },
    include: {
      stockMovements: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });
}

export async function createStockMovement(
  organizationId: string,
  data: {
    productId: string;
    type: 'IN' | 'OUT' | 'ADJUSTMENT';
    quantity: number;
    reason?: string;
    reference?: string;
  },
) {
  const product = await prisma.product.findFirst({
    where: { id: data.productId, organizationId },
  });
  if (!product) return null;

  const qty = data.quantity;
  let delta = qty;
  if (data.type === 'OUT') delta = -qty;
  if (data.type === 'ADJUSTMENT') {
    delta = qty - Number(product.stockQty);
  }

  const newStock = Number(product.stockQty) + (data.type === 'ADJUSTMENT' ? qty - Number(product.stockQty) : delta);

  if (data.type === 'OUT' && newStock < 0) {
    throw new Error('موجودی کافی نیست');
  }

  const [movement] = await prisma.$transaction([
    prisma.stockMovement.create({
      data: {
        organizationId,
        productId: data.productId,
        type: data.type,
        quantity: data.type === 'ADJUSTMENT' ? qty : qty,
        reason: data.reason,
        reference: data.reference,
      },
    }),
    prisma.product.update({
      where: { id: data.productId },
      data: {
        stockQty:
          data.type === 'ADJUSTMENT'
            ? qty
            : { increment: data.type === 'IN' ? qty : -qty },
      },
    }),
  ]);

  return movement;
}

export async function listStockMovements(
  organizationId: string,
  params: { productId?: string; page?: number },
) {
  const page = params.page ?? 1;
  const pageSize = 30;
  const where: Prisma.StockMovementWhereInput = {
    organizationId,
    ...(params.productId ? { productId: params.productId } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { product: { select: { id: true, name: true, sku: true } } },
    }),
    prisma.stockMovement.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getRetailDashboardSignals(organizationId: string) {
  const products = await prisma.product.findMany({
    where: { organizationId, isActive: true },
    select: { stockQty: true, reorderLevel: true },
  });

  const lowStockCount = products.filter((p) => isLowStock(p)).length;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [movementCount, activeProductCount] = await Promise.all([
    prisma.stockMovement.count({
      where: { organizationId, createdAt: { gte: weekAgo } },
    }),
    prisma.product.count({ where: { organizationId, isActive: true } }),
  ]);

  return { lowStockCount, movementCount, activeProductCount };
}
