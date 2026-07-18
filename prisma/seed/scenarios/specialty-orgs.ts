import type { PrismaClient } from '@prisma/client';

import { listSpecialties } from '@kesbyar/shared';

import { PIPELINE_STAGES_DEFAULT } from '../constants';
import type { SeedUsers } from '../types';
import {
  createInvoiceWithItems,
  daysAgo,
  daysFromNow,
  invoiceNumber,
} from '../utils';

const YEAR = new Date().getFullYear();

export async function seedSpecialtyOrganizations(
  prisma: PrismaClient,
  users: SeedUsers,
): Promise<void> {
  const { owner, superAdmin } = users;
  let invoiceSeq = 9000;

  for (const specialty of listSpecialties()) {
    const slug = `demo-spec-${specialty.id}`;

    const organization = await prisma.organization.create({
      data: {
        name: `دمو — ${specialty.label}`,
        slug,
        industryPack: specialty.basePack,
        industrySpecialty: specialty.id,
        isDemo: true,
        phone: '02100000000',
        email: `demo+${specialty.id}@kesbyar.ir`,
        address: 'تهران — محیط نمایش تخصصی',
        workspaces: {
          create: { name: 'شعبه اصلی', slug: 'main', isDefault: true },
        },
        memberships: {
          create: [
            { userId: owner.id, role: 'OWNER' },
            { userId: superAdmin.id, role: 'OWNER' },
          ],
        },
        pipelineStages: {
          create: PIPELINE_STAGES_DEFAULT.map((s) => ({ ...s })),
        },
      },
    });

    const customers = await Promise.all([
      prisma.customer.create({
        data: {
          organizationId: organization.id,
          name: `${specialty.labels.customer} نمونه ۱`,
          phone: '09121111111',
          city: 'تهران',
          createdAt: daysAgo(30),
        },
      }),
      prisma.customer.create({
        data: {
          organizationId: organization.id,
          name: `${specialty.labels.customer} نمونه ۲`,
          phone: '09122222222',
          city: 'تهران',
          createdAt: daysAgo(10),
        },
      }),
    ]);

    await createInvoiceWithItems(prisma, {
      organizationId: organization.id,
      customerId: customers[0]!.id,
      number: invoiceNumber(YEAR, invoiceSeq++),
      status: 'SENT',
      issueDate: daysAgo(5),
      dueDate: daysFromNow(10),
      paidAmount: 0,
      items: [
        {
          description: `خدمات ${specialty.label}`,
          quantity: 1,
          unitPrice: 4500000,
        },
      ],
    });
  }
}
