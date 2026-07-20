import type { AgentType, Prisma } from '@prisma/client';
import {
  createAgentSdkTemplate,
  registerAgent,
  validateAgentManifest,
  type AgentManifest,
} from '@kasbyar/agent-sdk';

import { prisma } from '@/lib/prisma';

const BUILTIN_PLUGINS: Array<{
  slug: string;
  name: string;
  version: string;
  description: string;
  manifest: AgentManifest;
}> = [
  {
    slug: 'sales-copilot',
    name: 'همکار فروش',
    version: '1.1.0',
    description: 'پیشنهاد پیگیری لید و ساخت وظیفه فروش',
    manifest: registerAgent(createAgentSdkTemplate('sales-copilot'), {
      type: 'SALES',
      name: 'فروش',
      goal: 'افزایش تبدیل لید',
      tools: [
        {
          name: 'query_sales',
          description: 'خلاصه فروش',
          parameters: { type: 'object', properties: {} },
        },
        {
          name: 'create_task',
          description: 'ایجاد وظیفه',
          parameters: {
            type: 'object',
            properties: { title: { type: 'string' } },
            required: ['title'],
          },
        },
      ],
      permissions: ['read:leads', 'write:tasks'],
    }),
  },
  {
    slug: 'finance-watch',
    name: 'دیده‌بان مالی',
    version: '1.0.0',
    description: 'هشدار مطالبات و سلامت نقدینگی',
    manifest: createAgentSdkTemplate('finance-watch'),
  },
  {
    slug: 'memory-indexer',
    name: 'ایندکس حافظه',
    version: '1.0.0',
    description: 'کمک به جستجو و اینجست اسناد سازمانی',
    manifest: createAgentSdkTemplate('memory-indexer'),
  },
];

export async function ensureBuiltinPlugins() {
  for (const plugin of BUILTIN_PLUGINS) {
    const errors = validateAgentManifest(plugin.manifest);
    if (errors.length) continue;
    await prisma.pluginManifest.upsert({
      where: { slug: plugin.slug },
      create: {
        slug: plugin.slug,
        name: plugin.name,
        version: plugin.version,
        description: plugin.description,
        manifest: plugin.manifest as unknown as Prisma.InputJsonValue,
        status: 'PUBLISHED',
        organizationId: null,
      },
      update: {
        name: plugin.name,
        version: plugin.version,
        description: plugin.description,
        manifest: plugin.manifest as unknown as Prisma.InputJsonValue,
        status: 'PUBLISHED',
      },
    });
  }
}

export async function registerPlugin(input: {
  slug: string;
  name: string;
  version: string;
  description?: string;
  manifest: Record<string, unknown>;
  organizationId?: string;
}) {
  const asManifest = input.manifest as unknown as AgentManifest;
  if (asManifest?.agents) {
    const errors = validateAgentManifest(asManifest);
    if (errors.length) {
      throw new Error(`مانیفست نامعتبر: ${errors.join('، ')}`);
    }
  }

  return prisma.pluginManifest.upsert({
    where: { slug: input.slug },
    create: {
      slug: input.slug,
      name: input.name,
      version: input.version,
      description: input.description,
      manifest: input.manifest as Prisma.InputJsonValue,
      organizationId: input.organizationId,
      status: 'PUBLISHED',
    },
    update: {
      name: input.name,
      version: input.version,
      description: input.description,
      manifest: input.manifest as Prisma.InputJsonValue,
      status: 'PUBLISHED',
    },
  });
}

export async function listPlugins(organizationId?: string) {
  await ensureBuiltinPlugins();
  const statuses: Array<'PUBLISHED' | 'DRAFT' | 'DEPRECATED'> = [
    'PUBLISHED',
    'DRAFT',
    'DEPRECATED',
  ];
  return prisma.pluginManifest.findMany({
    where: {
      OR: [
        { organizationId: null, status: { in: statuses } },
        ...(organizationId ? [{ organizationId, status: { in: statuses } }] : []),
      ],
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function setPluginEnabled(
  organizationId: string,
  pluginId: string,
  enabled: boolean,
) {
  const plugin = await prisma.pluginManifest.findFirst({
    where: {
      id: pluginId,
      OR: [{ organizationId }, { organizationId: null }],
    },
  });
  if (!plugin) throw new Error('افزونه یافت نشد');

  // Org-specific toggle: clone global plugin into org scope when enabling/disabling globals
  if (!plugin.organizationId) {
    const orgSlug = `${plugin.slug}__${organizationId.slice(-6)}`;
    return prisma.pluginManifest.upsert({
      where: { slug: orgSlug },
      create: {
        slug: orgSlug,
        name: plugin.name,
        version: plugin.version,
        description: plugin.description,
        manifest: {
          ...(plugin.manifest as object),
          parentSlug: plugin.slug,
          enabled,
        } as Prisma.InputJsonValue,
        organizationId,
        status: enabled ? 'PUBLISHED' : 'DRAFT',
      },
      update: {
        status: enabled ? 'PUBLISHED' : 'DRAFT',
        manifest: {
          ...(plugin.manifest as object),
          parentSlug: plugin.slug,
          enabled,
        } as Prisma.InputJsonValue,
      },
    });
  }

  return prisma.pluginManifest.update({
    where: { id: plugin.id },
    data: {
      status: enabled ? 'PUBLISHED' : 'DRAFT',
      manifest: {
        ...(plugin.manifest as object),
        enabled,
      } as Prisma.InputJsonValue,
    },
  });
}

export async function recordAgentFeedback(
  organizationId: string,
  input: {
    userId?: string;
    feedbackType: 'ACTION_APPROVED' | 'ACTION_REJECTED' | 'ANSWER_HELPFUL' | 'ANSWER_NOT_HELPFUL';
    agentType?: string;
    referenceId?: string;
    metadata?: Record<string, unknown>;
  },
) {
  return prisma.agentFeedback.create({
    data: {
      organizationId,
      userId: input.userId,
      feedbackType: input.feedbackType,
      agentType: input.agentType as AgentType | undefined,
      referenceId: input.referenceId,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });
}

export async function listAgentFeedback(organizationId: string) {
  return prisma.agentFeedback.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function getLearningInsights(organizationId: string) {
  const rows = await prisma.agentFeedback.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    take: 300,
  });

  const byAgent: Record<
    string,
    { helpful: number; notHelpful: number; approved: number; rejected: number; score: number }
  > = {};

  for (const row of rows) {
    const key = row.agentType ?? 'GENERAL';
    if (!byAgent[key]) {
      byAgent[key] = { helpful: 0, notHelpful: 0, approved: 0, rejected: 0, score: 0 };
    }
    const bucket = byAgent[key]!;
    if (row.feedbackType === 'ANSWER_HELPFUL') bucket.helpful += 1;
    if (row.feedbackType === 'ANSWER_NOT_HELPFUL') bucket.notHelpful += 1;
    if (row.feedbackType === 'ACTION_APPROVED') bucket.approved += 1;
    if (row.feedbackType === 'ACTION_REJECTED') bucket.rejected += 1;
  }

  for (const key of Object.keys(byAgent)) {
    const b = byAgent[key]!;
    b.score = b.helpful * 2 + b.approved - b.notHelpful * 2 - b.rejected;
  }

  const ranked = Object.entries(byAgent)
    .map(([agentType, stats]) => ({ agentType, ...stats }))
    .sort((a, b) => b.score - a.score);

  return {
    totalFeedback: rows.length,
    rankedAgents: ranked,
    insights: ranked.slice(0, 3).map((r) => ({
      agentType: r.agentType,
      message:
        r.score >= 0
          ? `عامل ${r.agentType} بازخورد مثبت بیشتری دارد — در پیشنهادها اولویت می‌گیرد`
          : `عامل ${r.agentType} نیاز به بهبود دارد — پیشنهادها با احتیاط‌تر نمایش داده می‌شوند`,
    })),
  };
}

export async function getLearningPreferences(organizationId: string) {
  const insights = await getLearningInsights(organizationId);
  const preferredAgents = insights.rankedAgents
    .filter((a) => a.score > 0)
    .slice(0, 3)
    .map((a) => a.agentType);
  const demotedAgents = insights.rankedAgents
    .filter((a) => a.score < 0)
    .map((a) => a.agentType);
  return { preferredAgents, demotedAgents, insights };
}

export function rankRecommendationsByFeedback<T>(
  items: T[],
  prefs: { preferredAgents: string[]; demotedAgents: string[] },
  agentType?: string,
): T[] {
  const copy = [...items];
  if (!agentType) return copy;
  if (prefs.demotedAgents.includes(agentType)) {
    return copy.reverse();
  }
  return copy;
}
