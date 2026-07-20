import type { AgentCitation, AgentTypeName, AssistantAskResponse, RecommendedAction } from '@kesbyar/shared';
import type { AgentType, Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { chatWithLlm } from '@/lib/ai';
import { searchMemory } from '@/server/memory/memory.search';
import { getLearningPreferences, rankRecommendationsByFeedback } from '@/server/platform/platform.service';

import { buildLocalAssistantAnswer } from './local-fallback';
import { buildOperationalContext } from './operational-context';
import {
  DEPARTMENT_PROMPTS,
  buildDepartmentSuggestedActions,
} from './agents/department-profiles';
import { queryCustomersSummary, queryInvoicesSummary, querySalesSummary } from './tools/query-ops';

const MEMORY_KEYWORDS = ['قرارداد', 'فایل', 'سند', 'کجاست', 'پیدا', 'memory', 'یادداشت', 'حافظه'];
const TASK_KEYWORDS = ['وظیفه', 'تسک', 'پیگیری بساز', 'ایجاد کن', 'بساز'];

function detectAgentType(question: string): AgentTypeName {
  const q = question.toLowerCase();
  if (/\[(CEO|SALES|FINANCE|HR|OPERATIONS|MARKETING|SUPPORT|INVENTORY|LEGAL)\]/i.test(question)) {
    const m = question.match(/\[(CEO|SALES|FINANCE|HR|OPERATIONS|MARKETING|SUPPORT|INVENTORY|LEGAL)\]/i);
    return (m?.[1]?.toUpperCase() as AgentTypeName) ?? 'CEO';
  }
  if (q.includes('فروش') || q.includes('لید')) return 'SALES';
  if (q.includes('فاکتور') || q.includes('مالی') || q.includes('پرداخت') || q.includes('نقدینگی')) {
    return 'FINANCE';
  }
  if (q.includes('کارمند') || q.includes('منابع انسانی') || q.includes('استخدام')) return 'HR';
  if (q.includes('مارکت') || q.includes('تبلیغ') || q.includes('کمپین') || q.includes('محتوا')) {
    return 'MARKETING';
  }
  if (q.includes('انبار') || q.includes('موجودی') || q.includes('کالا')) return 'INVENTORY';
  if (q.includes('پشتیبانی') || q.includes('شکایت') || q.includes('رضایت')) return 'SUPPORT';
  if (q.includes('قرارداد') || q.includes('حقوقی')) return 'LEGAL';
  if (q.includes('عملیات') || q.includes('وظیفه') || q.includes('سررسید')) return 'OPERATIONS';
  return 'CEO';
}

async function getOrCreateSession(organizationId: string, userId: string, sessionId?: string) {
  if (sessionId) {
    const existing = await prisma.conversationSession.findFirst({
      where: { id: sessionId, organizationId, userId },
    });
    if (existing) return existing;
  }
  return prisma.conversationSession.create({
    data: { organizationId, userId, title: 'گفتگو با شرکت' },
  });
}

export async function runAgentOrchestrator(params: {
  organizationId: string;
  userId: string;
  question: string;
  sessionId?: string;
  agentType?: AgentTypeName;
  systemPrompt?: string;
}): Promise<AssistantAskResponse & { sessionId: string; agentType: AgentTypeName }> {
  const { organizationId, userId, question } = params;
  const agentType = params.agentType ?? detectAgentType(question);
  const profile = DEPARTMENT_PROMPTS[agentType];
  const session = await getOrCreateSession(organizationId, userId, params.sessionId);
  const [context, prefs] = await Promise.all([
    buildOperationalContext(organizationId),
    getLearningPreferences(organizationId),
  ]);

  await prisma.conversationMessage.create({
    data: { sessionId: session.id, role: 'USER', content: question },
  });

  const contextSummary = [
    `عامل فعال: ${profile.name}`,
    querySalesSummary(context),
    queryInvoicesSummary(context),
    queryCustomersSummary(context),
  ].join('\n');

  let citations: AgentCitation[] = [];
  const toolsUsed: string[] = [];
  if (MEMORY_KEYWORDS.some((k) => question.includes(k)) || agentType === 'LEGAL') {
    const memory = await searchMemory(organizationId, { query: question, limit: 3 });
    toolsUsed.push('search_memory');
    citations = memory.citations.map((c) => ({
      source: c.title,
      excerpt: c.excerpt,
      documentId: c.documentId,
      entityType: c.sourceType,
      entityId: c.sourceId ?? undefined,
    }));
  }

  let recommendedActions: RecommendedAction[] = [];
  if (TASK_KEYWORDS.some((k) => question.includes(k))) {
    recommendedActions = buildDepartmentSuggestedActions(agentType, question);
    toolsUsed.push('create_task');
  } else if (agentType === 'SALES' && context.stale_lead_count > 0) {
    recommendedActions = [
      {
        id: `sales-stale-${Date.now()}`,
        title: 'پیگیری لیدهای راکد',
        description: `${context.stale_lead_count} لید نیاز به پیگیری دارد`,
        actionType: 'CREATE_TASK',
        payload: {
          actionType: 'CREATE_TASK',
          title: `پیگیری لیدها: ${context.top_stale_leads.slice(0, 2).join('، ')}`,
          description: 'پیشنهاد عامل فروش',
        },
        requiresConfirmation: true,
      },
    ];
  } else if (agentType === 'FINANCE' && context.overdue_invoice_count > 0) {
    recommendedActions = [
      {
        id: `finance-overdue-${Date.now()}`,
        title: 'پیگیری مطالبات معوق',
        description: `${context.overdue_invoice_count} فاکتور معوق`,
        actionType: 'CREATE_TASK',
        payload: {
          actionType: 'CREATE_TASK',
          title: `وصول مطالبات: ${context.top_overdue_customers.slice(0, 2).join('، ')}`,
          description: 'پیشنهاد عامل مالی',
        },
        requiresConfirmation: true,
      },
    ];
  }

  recommendedActions = rankRecommendationsByFeedback(recommendedActions, prefs, agentType);

  const systemPrompt =
    params.systemPrompt ??
    `${profile.systemPrompt} فقط بر اساس داده پاسخ دهید. فارسی، مختصر و عملیاتی.`;

  const llmAnswer = await chatWithLlm({
    systemPrompt,
    userContent: `زمینه عملیاتی:\n${contextSummary}\n\nمنابع حافظه:\n${citations.map((c) => c.excerpt).join('\n')}\n\nسؤال: ${question}`,
    temperature: 0.3,
    maxTokens: 800,
  });

  const fallback = buildLocalAssistantAnswer(question, context);
  const answer = llmAnswer ?? `[${profile.name}] ${fallback.answer}`;
  const degraded = !llmAnswer || fallback.degraded;

  const agentRun = await prisma.agentRun.create({
    data: {
      organizationId,
      userId,
      agentType: agentType as AgentType,
      input: { question, agentType },
      output: { answer },
      toolsUsed,
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });

  await prisma.conversationMessage.create({
    data: {
      sessionId: session.id,
      role: 'ASSISTANT',
      content: answer,
      citations:
        citations.length > 0 ? (citations as unknown as Prisma.InputJsonValue) : undefined,
      metadata: { agentRunId: agentRun.id, agentType },
    },
  });

  await prisma.conversationSession.update({
    where: { id: session.id },
    data: { updatedAt: new Date() },
  });

  return {
    answer,
    confidence: llmAnswer ? 0.88 : fallback.confidence,
    sources: citations.length > 0 ? citations.map((c) => c.source) : fallback.sources,
    citations,
    recommendedActions,
    sessionId: session.id,
    agentType,
    degraded,
  };
}
