import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { chatWithLlm } from '@/lib/ai';
import { NotFoundError } from '@/lib/errors';

function analyzeCompetitorHeuristic(input: {
  competitorName: string;
  url?: string;
  notes?: string;
}): Record<string, unknown> {
  const notes = input.notes ?? '';
  const signals: string[] = [];
  if (/تخفیف|قیمت|ارزان/i.test(notes)) signals.push('فشار قیمتی');
  if (/تبلیغ|اینستا|کمپین/i.test(notes)) signals.push('فعالیت تبلیغاتی');
  if (/محصول جدید|لانچ|رونمایی/i.test(notes)) signals.push('نوآوری محصول');
  if (signals.length === 0) signals.push('رصد عمومی');

  return {
    competitorName: input.competitorName,
    url: input.url ?? null,
    notes,
    signals,
    threatLevel: signals.includes('فشار قیمتی') ? 'high' : signals.length > 1 ? 'medium' : 'low',
    summary: `تحلیل اولیه از «${input.competitorName}»: ${signals.join('، ')}.`,
    analyzedAt: new Date().toISOString(),
  };
}

export async function captureCompetitorSnapshot(
  organizationId: string,
  competitorName: string,
  data: Record<string, unknown>,
) {
  const url = typeof data.url === 'string' ? data.url : undefined;
  const notes = typeof data.notes === 'string' ? data.notes : undefined;
  let analysis = analyzeCompetitorHeuristic({ competitorName, url, notes });

  const llm = await chatWithLlm({
    systemPrompt:
      'تحلیلگر رقبا هستید. JSON برگردانید: {"summary":"...","signals":["..."],"threatLevel":"low|medium|high","opportunities":["..."]}',
    userContent: `رقیب: ${competitorName}\nURL: ${url ?? '—'}\nیادداشت: ${notes ?? '—'}`,
    temperature: 0.3,
    maxTokens: 600,
  });

  if (llm) {
    try {
      const parsed = JSON.parse(llm) as Record<string, unknown>;
      analysis = { ...analysis, ...parsed, analyzedAt: new Date().toISOString() };
    } catch {
      analysis = { ...analysis, llmNotes: llm.slice(0, 800) };
    }
  }

  return prisma.competitorSnapshot.create({
    data: {
      organizationId,
      competitorName,
      data: { ...data, analysis } as Prisma.InputJsonValue,
    },
  });
}

export async function listCompetitorSnapshots(organizationId: string) {
  return prisma.competitorSnapshot.findMany({
    where: { organizationId },
    orderBy: { capturedAt: 'desc' },
    take: 40,
  });
}

export async function ingestMarketSignal(
  organizationId: string,
  input: { category: string; title: string; summary: string; trendScore?: number },
) {
  let summary = input.summary;
  let trendScore = input.trendScore;
  let metadata: Record<string, unknown> = {};

  const llm = await chatWithLlm({
    systemPrompt:
      'تحلیلگر بازار ایران هستید. JSON: {"analysis":"...","trendScore":-1..1,"tags":["..."]}',
    userContent: `دسته: ${input.category}\nعنوان: ${input.title}\nخلاصه: ${input.summary}`,
    temperature: 0.3,
    maxTokens: 400,
  });

  if (llm) {
    try {
      const parsed = JSON.parse(llm) as {
        analysis?: string;
        trendScore?: number;
        tags?: string[];
      };
      if (parsed.analysis) summary = `${input.summary}\n\nتحلیل: ${parsed.analysis}`;
      if (parsed.trendScore != null) trendScore = parsed.trendScore;
      metadata = { tags: parsed.tags ?? [], source: 'llm' };
    } catch {
      metadata = { source: 'llm-text', raw: llm.slice(0, 500) };
    }
  } else {
    const positive = /رشد|افزایش|فرصت|تقاضا/i.test(input.summary);
    const negative = /رکود|کاهش|ریسک|تهدید/i.test(input.summary);
    trendScore = trendScore ?? (positive ? 0.4 : negative ? -0.4 : 0);
    metadata = { source: 'heuristic' };
  }

  return prisma.marketSignal.create({
    data: {
      organizationId,
      category: input.category,
      title: input.title,
      summary,
      trendScore,
      metadata: metadata as Prisma.InputJsonValue,
    },
  });
}

export async function listMarketSignals(organizationId: string) {
  return prisma.marketSignal.findMany({
    where: { organizationId },
    orderBy: { capturedAt: 'desc' },
    take: 40,
  });
}

function templateContent(contentType: string, brief: string) {
  const titles: Record<string, string> = {
    post: 'پست پیشنهادی شبکه‌های اجتماعی',
    email: 'ایمیل پیشنهادی',
    campaign: 'کمپین پیشنهادی',
    sms: 'پیامک پیشنهادی',
  };
  const title = titles[contentType] ?? 'پیش‌نویس محتوا';
  const body =
    contentType === 'email'
      ? `موضوع: پیشنهاد ویژه کسب‌یار\n\nسلام،\n\n${brief}\n\nبا احترام`
      : contentType === 'sms'
        ? `${brief.slice(0, 120)} — کسب‌یار`
        : `🔹 ${brief}\n\nاگر به‌دنبال نتیجه ملموس هستید، همین امروز با ما در تماس باشید.\n#کسب_و_کار #رشد`;
  return { title, body };
}

export async function createContentDraft(
  organizationId: string,
  input: { contentType: string; title?: string; body?: string; brief?: string },
) {
  const brief = input.brief ?? input.body ?? '';
  let title = input.title;
  let body = input.body;

  if (!title || !body) {
    const tpl = templateContent(input.contentType, brief || 'معرفی خدمات');
    title = title ?? tpl.title;
    body = body ?? tpl.body;
  }

  const llm = await chatWithLlm({
    systemPrompt:
      'کپی‌رایتر فارسی بازاریابی هستید. JSON: {"title":"...","body":"..."} — لحن حرفه‌ای و قابل انتشار.',
    userContent: `نوع: ${input.contentType}\nبریف: ${brief}\nپیش‌نویس: ${body}`,
    temperature: 0.5,
    maxTokens: 800,
  });

  if (llm) {
    try {
      const parsed = JSON.parse(llm) as { title?: string; body?: string };
      title = parsed.title ?? title;
      body = parsed.body ?? body;
    } catch {
      body = `${body}\n\n---\n${llm.slice(0, 1200)}`;
    }
  }

  return prisma.contentDraft.create({
    data: {
      organizationId,
      contentType: input.contentType,
      title: title!,
      body: body!,
      metadata: { brief, generated: true },
    },
  });
}

export async function listContentDrafts(organizationId: string) {
  return prisma.contentDraft.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });
}

export async function createSeoTask(
  organizationId: string,
  keyword: string,
  topic?: string,
) {
  const baseTopic = topic ?? keyword;
  const outline = [
    `مقدمه: چرا ${baseTopic} مهم است؟`,
    `بخش ۱: تعریف و کاربرد ${keyword}`,
    `بخش ۲: چک‌لیست عملی برای کسب‌وکارهای ایرانی`,
    `بخش ۳: اشتباهات رایج`,
    'نتیجه‌گیری و CTA',
  ];
  const schemaSuggestions = [
    { type: 'Article', fields: ['headline', 'datePublished', 'author'] },
    { type: 'FAQPage', fields: ['question', 'answer'] },
    { type: 'BreadcrumbList', fields: ['itemListElement'] },
  ];
  const relatedKeywords = [
    keyword,
    `${keyword} چیست`,
    `بهترین ${keyword}`,
    `${keyword} در ایران`,
    `قیمت ${keyword}`,
  ];

  let results: Record<string, unknown> = {
    outline,
    schemaSuggestions,
    relatedKeywords,
    source: 'heuristic',
  };

  const llm = await chatWithLlm({
    systemPrompt:
      'متخصص SEO فارسی هستید. JSON: {"outline":["..."],"relatedKeywords":["..."],"schemaSuggestions":[{"type":"...","fields":["..."]}],"metaDescription":"..."}',
    userContent: `کلمه کلیدی: ${keyword}\nموضوع: ${baseTopic}`,
    temperature: 0.3,
    maxTokens: 700,
  });

  if (llm) {
    try {
      results = { ...results, ...JSON.parse(llm), source: 'llm' };
    } catch {
      results = { ...results, llmNotes: llm.slice(0, 800), source: 'llm-text' };
    }
  }

  return prisma.seoTask.create({
    data: {
      organizationId,
      keyword,
      status: 'IN_PROGRESS',
      actions: [
        { step: 'analyze', status: 'done', label: 'تحلیل کلمه کلیدی' },
        { step: 'outline', status: 'done', label: 'ساخت ساختار محتوا' },
        { step: 'draft_article', status: 'pending', label: 'نگارش مقاله', runnable: true },
        { step: 'internal_links', status: 'pending', label: 'لینک‌سازی داخلی', runnable: true },
        { step: 'schema', status: 'pending', label: 'پیاده‌سازی اسکیما', runnable: true },
      ],
      results: results as Prisma.InputJsonValue,
    },
  });
}

export async function listSeoTasks(organizationId: string) {
  return prisma.seoTask.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });
}

export async function markSeoStep(
  organizationId: string,
  taskId: string,
  step: string,
  status: 'pending' | 'done' | 'skipped' = 'done',
) {
  const task = await prisma.seoTask.findFirst({ where: { id: taskId, organizationId } });
  if (!task) throw new NotFoundError('وظیفه SEO یافت نشد');
  const actions = (Array.isArray(task.actions) ? task.actions : []) as Array<
    Record<string, unknown>
  >;
  const next = actions.map((a) => (a.step === step ? { ...a, status } : a));
  const allDone = next.every((a) => a.status === 'done' || a.status === 'skipped');
  return prisma.seoTask.update({
    where: { id: taskId },
    data: {
      actions: next as Prisma.InputJsonValue,
      status: allDone ? 'COMPLETED' : 'IN_PROGRESS',
    },
  });
}
