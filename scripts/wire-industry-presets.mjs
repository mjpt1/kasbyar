import fs from 'node:fs';

const path = 'prisma/seed/scenarios/verticals.ts';
let t = fs.readFileSync(path, 'utf8');

const newHeader = `import type { IndustryPack, PrismaClient } from '@prisma/client';

import { PIPELINE_STAGES_DEFAULT } from '../constants';
import type { SeedUsers } from '../types';
import {
  CLINIC_PRESETS,
  GENERAL_PRESETS,
  RETAIL_PRESETS,
} from './industry-presets';
import {
  seedClinicPackData,
  seedRetailPackData,
  seedTravelPackData,
} from './pack-extensions';
import {
  atHour,
  createInvoiceWithItems,
  createPayment,
  daysAgo,
  daysFromNow,
  endOfToday,
  invoiceNumber,
  startOfToday,
} from '../utils';

const YEAR = new Date().getFullYear();

interface VerticalConfig {
  slug: string;
  name: string;
  industryPack: IndustryPack;
  phone: string;
  email: string;
  address: string;
}

`;

const start = t.indexOf('import type { IndustryPack');
const subStart = t.indexOf('const SUBSCRIPTION_PRESETS');
if (start < 0 || subStart < 0) throw new Error('markers not found');
t = newHeader + t.slice(subStart);

t = t.replaceAll('paidAmount: 5050000,', 'paidAmount: preset.productPrices[0] + preset.productPrices[1],');
t = t.replaceAll(
  '      amount: 5050000,\n      method: \'CARD\',\n      paidAt: daysAgo(5),',
  '      amount: preset.productPrices[0] + preset.productPrices[1],\n      method: \'CARD\',\n      paidAt: daysAgo(5),',
);

t = t.replace(
  'await seedRetailPackData(prisma, orgId, [products[0]!.id, products[1]!.id]);',
  'await seedRetailPackData(prisma, orgId, [products[0]!.id, products[1]!.id], config.slug);',
);

t = t.replace(
  `await seedClinicPackData(
      prisma,
      orgId,
      [patients[0]!.id, patients[1]!.id, patients[2]!.id],
      owner.id,
    );`,
  `await seedClinicPackData(
      prisma,
      orgId,
      [patients[0]!.id, patients[1]!.id, patients[2]!.id],
      owner.id,
      config.slug,
    );`,
);

fs.writeFileSync(path, t);
console.log('ok', t.includes('industry-presets'), t.includes('5050000'));
