/**
 * Suggest a reply draft for an inbox thread using LLM (with heuristic fallback).
 */
import { chatWithLlm } from '@/lib/ai';
import { prisma } from '@/lib/prisma';

export async function suggestInboxReply(organizationId: string, threadId: string) {
  const thread = await prisma.messageThread.findFirst({
    where: { id: threadId, organizationId },
    include: {
      customer: { select: { name: true } },
      lead: { select: { title: true, contactName: true } },
      messages: {
        orderBy: { sentAt: 'desc' },
        take: 12,
        select: { direction: true, content: true, sentAt: true },
      },
    },
  });
  if (!thread) return null;

  const contactName =
    thread.customer?.name ?? thread.lead?.contactName ?? thread.lead?.title ?? 'مشتری';
  const history = [...thread.messages]
    .reverse()
    .map((m) => `${m.direction === 'INBOUND' ? 'مشتری' : 'ما'}: ${m.content}`)
    .join('\n');

  const systemPrompt =
    'تو دستیار پشتیبانی فارسی هستی. یک پاسخ کوتاه، مودبانه و حرفه‌ای پیشنهاد بده. فقط متن پاسخ را بنویس — بدون توضیح اضافه.';

  const llm = await chatWithLlm({
    systemPrompt,
    userContent: `کانال: ${thread.channel}\nنام: ${contactName}\n\nتاریخچه:\n${history || '(بدون پیام)'}\n\nپیشنهاد پاسخ:`,
    maxTokens: 400,
    temperature: 0.4,
  });

  if (llm) {
    return { draft: llm, source: 'llm' as const };
  }

  const lastInbound = thread.messages.find((m) => m.direction === 'INBOUND');
  const draft = lastInbound
    ? `سلام ${contactName}،\nپیام شما را دریافت کردیم. به‌زودی پاسخ کامل می‌دهیم.\nبا تشکر`
    : `سلام ${contactName}،\nچطور می‌توانیم کمکتان کنیم؟`;

  return { draft, source: 'heuristic' as const };
}
