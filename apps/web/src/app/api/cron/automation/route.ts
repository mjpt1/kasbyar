import { NextResponse } from 'next/server';

import { APP_LOG_EVENTS, logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { runAutomationForOrganization } from '@/server/automation/automation.service';

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = request.headers.get('authorization');
  if (auth === `Bearer ${secret}`) return true;
  const header = request.headers.get('x-cron-secret');
  return header === secret;
}

export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const orgs = await prisma.organization.findMany({
    select: { id: true, name: true },
  });

  const results: Array<{ organizationId: string; rulesRun: number }> = [];

  for (const org of orgs) {
    try {
      const run = await runAutomationForOrganization(org.id);
      results.push({ organizationId: org.id, rulesRun: run.length });
    } catch (error) {
      logger.warn(APP_LOG_EVENTS.AUTOMATION_RULE_FAILED, {
        organizationId: org.id,
        message: error instanceof Error ? error.message : String(error),
      });
      results.push({ organizationId: org.id, rulesRun: 0 });
    }
  }

  return NextResponse.json({
    success: true,
    organizations: orgs.length,
    results,
  });
}

export async function POST(request: Request) {
  return GET(request);
}
