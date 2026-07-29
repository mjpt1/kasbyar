import type { Prisma, SentimentLabel } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { chatWithLlm } from '@/lib/ai';
import { requireCustomerInOrg } from '@/server/tenant/tenant-scope';
import { runEventAutomation } from '@/server/automation/automation.service';

const NEGATIVE_WORDS = [
  'ناراضی',
  'نارضایتی',
  'بد',
  'بدتر',
  'کنسل',
  'لغو',
  'لغو کردم',
  'شکایت',
  'شاکی',
  'مشکل',
  'مشکل‌دار',
  'تاخیر',
  'تأخیر',
  'دیر',
  'ضعیف',
  'افتضاح',
  'پشیمون',
  'پشیمان',
  'کلاهبرداری',
  'فریب',
  'بی‌پاسخ',
  'جواب نمی‌دید',
  'جواب نمیدید',
  'پشتیبانی ضعیف',
  'گران',
  'گرون',
  'بی‌کیفیت',
  'بی کیفیت',
  'خراب',
  'معیوب',
  'برگشت وجه',
  'عودت',
  'استرداد',
  'عصبانی',
  'ناامید',
  'ناامیدی',
  'وحشتناک',
  'افتضاحه',
  'مزخرف',
  'کثیف',
  'بی‌ادب',
  'بی ادب',
  'بدقول',
  'بد قولی',
  'پیگیری نمی‌کنید',
  'پیگیری نمیکنید',
];
const POSITIVE_WORDS = [
  'ممنون',
  'متشکرم',
  'سپاس',
  'عالی',
  'عالی بود',
  'خوب',
  'خیلی خوب',
  'راضی',
  'رضایت',
  'خرید',
  'می‌خرم',
  'میخرم',
  'موافقم',
  'فوق‌العاده',
  'فوق العاده',
  'حرفه‌ای',
  'حرفه ای',
  'سریع',
  'به‌موقع',
  'به موقع',
  'کیفیت بالا',
  'باکیفیت',
  'توصیه',
  'پیشنهاد می‌کنم',
  'پیشنهاد میکنم',
  'مرسی',
  'دمتون گرم',
  'عالیه',
  'محشر',
  'بی‌نظیر',
  'بینظیر',
  'تشکر',
  'پاسخگو',
  'پیگیری خوب',
  'قیمت مناسب',
  'ارزش خرید',
  'دوباره خرید',
];

function classifyText(text: string): { label: SentimentLabel; score: number; churnRisk: number } {
  const lower = text.toLowerCase();
  let score = 0;
  for (const w of NEGATIVE_WORDS) if (lower.includes(w)) score -= 1;
  for (const w of POSITIVE_WORDS) if (lower.includes(w)) score += 1;

  if (score <= -2) return { label: 'VERY_NEGATIVE', score: -0.8, churnRisk: 0.85 };
  if (score < 0) return { label: 'NEGATIVE', score: -0.4, churnRisk: 0.6 };
  if (score === 0) return { label: 'NEUTRAL', score: 0, churnRisk: 0.2 };
  if (score === 1) return { label: 'POSITIVE', score: 0.5, churnRisk: 0.1 };
  return { label: 'VERY_POSITIVE', score: 0.9, churnRisk: 0.05 };
}

export async function analyzeCustomerSentiment(
  organizationId: string,
  customerId: string,
  content: string,
  sourceType?: string,
  sourceId?: string,
) {
  await requireCustomerInOrg(organizationId, customerId);

  let result = classifyText(content);

  const llm = await chatWithLlm({
    systemPrompt:
      'احساس متن مشتری را به صورت JSON برگردان: {"label":"VERY_NEGATIVE|NEGATIVE|NEUTRAL|POSITIVE|VERY_POSITIVE","score":-1..1,"churnRisk":0..1}',
    userContent: content.slice(0, 1500),
    temperature: 0.1,
    maxTokens: 120,
  });

  if (llm) {
    try {
      const parsed = JSON.parse(llm) as {
        label?: SentimentLabel;
        score?: number;
        churnRisk?: number;
      };
      if (parsed.label && parsed.score != null) {
        result = {
          label: parsed.label,
          score: parsed.score,
          churnRisk: parsed.churnRisk ?? result.churnRisk,
        };
      }
    } catch {
      // keep heuristic
    }
  }

  const sentiment = await prisma.customerSentiment.create({
    data: {
      organizationId,
      customerId,
      label: result.label,
      score: result.score,
      churnRisk: result.churnRisk,
      sourceType,
      sourceId,
      summary: content.slice(0, 200),
    },
    include: { customer: { select: { name: true } } },
  });

  if (sentiment.label === 'NEGATIVE' || sentiment.label === 'VERY_NEGATIVE') {
    void runEventAutomation(organizationId, 'NEGATIVE_SENTIMENT', {
      title: `پیگیری مشتری ناراضی: ${sentiment.customer.name}`,
      description: sentiment.summary ?? content.slice(0, 120),
      customerId,
    }).catch(() => undefined);
  }

  return sentiment;
}

export async function analyzeFollowUpLogs(organizationId: string) {
  const logs = await prisma.followUpLog.findMany({
    where: { lead: { organizationId } },
    include: { lead: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const results = [];
  for (const log of logs) {
    if (!log.lead.customerId || !log.note) continue;
    const existing = await prisma.customerSentiment.findFirst({
      where: { organizationId, sourceType: 'FollowUpLog', sourceId: log.id },
    });
    if (existing) continue;
    const sentiment = await analyzeCustomerSentiment(
      organizationId,
      log.lead.customerId,
      log.note,
      'FollowUpLog',
      log.id,
    );
    results.push(sentiment);
  }
  return results;
}

export async function analyzeInboundMessageSentiment(params: {
  organizationId: string;
  threadId: string;
  messageId: string;
  content: string;
}) {
  const thread = await prisma.messageThread.findFirst({
    where: { id: params.threadId, organizationId: params.organizationId },
    select: { customerId: true },
  });
  if (!thread?.customerId || !params.content.trim()) return null;

  const existing = await prisma.customerSentiment.findFirst({
    where: {
      organizationId: params.organizationId,
      sourceType: 'Message',
      sourceId: params.messageId,
    },
    select: { id: true },
  });
  if (existing) return null;

  return analyzeCustomerSentiment(
    params.organizationId,
    thread.customerId,
    params.content,
    'Message',
    params.messageId,
  );
}

export async function listSentiments(organizationId: string, limit = 40) {
  return prisma.customerSentiment.findMany({
    where: { organizationId },
    include: { customer: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getSentimentSummary(organizationId: string) {
  const rows = await prisma.customerSentiment.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const byLabel: Record<string, number> = {};
  let churnSum = 0;
  let churnCount = 0;
  for (const row of rows) {
    byLabel[row.label] = (byLabel[row.label] ?? 0) + 1;
    if (row.churnRisk != null) {
      churnSum += row.churnRisk;
      churnCount += 1;
    }
  }

  return {
    total: rows.length,
    byLabel,
    avgChurnRisk: churnCount > 0 ? churnSum / churnCount : 0,
    recent: rows.slice(0, 10),
  };
}

export type SentimentRow = Prisma.CustomerSentimentGetPayload<{
  include: { customer: { select: { id: true; name: true } } };
}>;
