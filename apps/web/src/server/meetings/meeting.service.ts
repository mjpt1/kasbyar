import { prisma } from '@/lib/prisma';
import { chatWithLlm } from '@/lib/ai';
import { NotFoundError } from '@/lib/errors';
import { createTaskFromAgent } from '@/server/intelligence/tools/create-task';

export async function createMeeting(
  organizationId: string,
  userId: string,
  input: { title: string; scheduledAt?: Date },
) {
  return prisma.meeting.create({
    data: {
      organizationId,
      userId,
      title: input.title,
      scheduledAt: input.scheduledAt,
    },
  });
}

export async function listMeetings(organizationId: string) {
  return prisma.meeting.findMany({
    where: { organizationId },
    include: {
      transcripts: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });
}

export async function getMeeting(organizationId: string, meetingId: string) {
  return prisma.meeting.findFirst({
    where: { id: meetingId, organizationId },
    include: { transcripts: { orderBy: { createdAt: 'desc' } } },
  });
}

function splitTranscriptLines(content: string) {
  return content
    .replace(/\r\n/g, '\n')
    .split(/\n+|\\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function heuristicExtract(content: string) {
  const lines = splitTranscriptLines(content);
  const decisions: string[] = [];
  const actionItems: string[] = [];

  for (const line of lines) {
    if (/تصمیم|مصوب|توافق|نهایتاً|در نتیجه/i.test(line)) decisions.push(line);
    if (/اقدام|وظیفه|پیگیری|باید|مسئول|تا تاریخ|deadline/i.test(line)) {
      actionItems.push(line);
    }
  }

  if (decisions.length === 0) {
    decisions.push(...lines.filter((l) => l.length > 20).slice(0, 3));
  }
  if (actionItems.length === 0) {
    actionItems.push(...lines.filter((l) => /کنیم|بشود|انجام/i.test(l)).slice(0, 3));
  }

  const summary =
    lines.slice(0, 5).join(' ') + (lines.length > 5 ? '…' : '');

  return { summary, decisions, actionItems };
}

function parseLlmMeetingJson(raw: string): {
  summary?: string;
  decisions?: string[];
  actionItems?: string[];
} | null {
  const trimmed = raw.trim();
  const candidates = [trimmed];
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) candidates.unshift(fenced[1].trim());
  const brace = trimmed.match(/\{[\s\S]*\}/);
  if (brace?.[0]) candidates.push(brace[0]);

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as {
        summary?: string;
        decisions?: string[];
        actionItems?: string[];
      };
    } catch {
      /* try next */
    }
  }
  return null;
}

export async function processMeetingTranscript(
  organizationId: string,
  userId: string,
  meetingId: string,
  content: string,
) {
  const meeting = await prisma.meeting.findFirst({
    where: { id: meetingId, organizationId },
  });
  if (!meeting) throw new NotFoundError('جلسه یافت نشد');

  let summary: string;
  let decisions: string[];
  let actionItems: string[];
  let source: 'llm' | 'heuristic' = 'heuristic';

  const llm = await chatWithLlm({
    systemPrompt:
      'شما منشی جلسات فارسی هستید. فقط JSON معتبر برگردانید: {"summary":"...","decisions":["..."],"actionItems":["..."]}',
    userContent: content.slice(0, 6000),
    temperature: 0.2,
    maxTokens: 900,
  });

  const parsed = llm ? parseLlmMeetingJson(llm) : null;
  if (parsed) {
    summary = parsed.summary ?? content.slice(0, 280);
    decisions = Array.isArray(parsed.decisions) ? parsed.decisions.map(String) : [];
    actionItems = Array.isArray(parsed.actionItems)
      ? parsed.actionItems.map(String)
      : [];
    source = 'llm';
  } else {
    const h = heuristicExtract(content);
    summary = h.summary;
    decisions = h.decisions;
    actionItems = h.actionItems;
  }

  // Prefer heuristic actions if LLM returned none but transcript clearly has them
  if (actionItems.length === 0) {
    const h = heuristicExtract(content);
    if (h.actionItems.length > 0) actionItems = h.actionItems;
    if (decisions.length === 0 && h.decisions.length > 0) decisions = h.decisions;
  }

  const transcript = await prisma.meetingTranscript.create({
    data: {
      meetingId,
      content,
      summary: `[${source}] ${summary}`,
      decisions,
      actionItems,
    },
  });

  for (const item of actionItems.slice(0, 5)) {
    try {
      await createTaskFromAgent({
        organizationId,
        userId,
        title: item.slice(0, 120),
        description: `از جلسه «${meeting.title}» استخراج شد`,
      });
    } catch {
      // Keep transcript/meeting updates even if a task insert fails
    }
  }

  await prisma.meeting.update({
    where: { id: meetingId },
    data: { status: 'COMPLETED' },
  });

  return transcript;
}
