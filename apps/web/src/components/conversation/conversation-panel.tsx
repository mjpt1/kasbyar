'use client';

import type { ConversationMessage } from '@kesbyar/shared';
import { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Send, ThumbsDown, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';

import { AiServiceStatusBadge } from '@/components/ai/ai-service-status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const suggestions = [
  'امروز چقدر فروش داشتم؟',
  'کدام مشتری‌ها بدهکارند؟',
  'چه سرنخ‌های فروشی پیگیری نشده‌اند؟',
  'خلاصه وضعیت امروز چیست؟',
];

type AgentOption = { type: string; name: string };

function createMessage(
  role: ConversationMessage['role'],
  content: string,
): ConversationMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

export function ConversationPanel({ fullPage = false }: { fullPage?: boolean }) {
  const [messages, setMessages] = useState<ConversationMessage[]>([
    createMessage(
      'assistant',
      'سلام! من دستیار عملیاتی کسب‌یار هستم. می‌توانید دپارتمان را انتخاب کنید یا بگذارید به‌صورت خودکار مسیر‌یابی شود.',
    ),
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [agentType, setAgentType] = useState<string>('AUTO');
  const [lastAgentType, setLastAgentType] = useState<string | undefined>();
  const [pendingActions, setPendingActions] = useState<
    Array<{ id: string; title: string; payload: Record<string, unknown> }>
  >([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch('/api/conversation');
      const data = await res.json();
      if (data.success) setAgents(data.data.agents ?? []);
    })();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  async function sendFeedback(helpful: boolean) {
    await fetch('/api/platform', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'feedback',
        feedbackType: helpful ? 'ANSWER_HELPFUL' : 'ANSWER_NOT_HELPFUL',
        agentType: lastAgentType,
        referenceId: sessionId,
      }),
    });
    toast.success(helpful ? 'بازخورد مثبت ثبت شد' : 'بازخورد منفی ثبت شد');
  }

  async function sendQuestion(question: string) {
    if (!question.trim() || loading) return;

    setMessages((prev) => [...prev, createMessage('user', question.trim())]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          sessionId,
          agentType: agentType === 'AUTO' ? undefined : agentType,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        toast.error(data.error?.message ?? 'خطا در دریافت پاسخ');
        return;
      }

      const answer = data.data as {
        answer: string;
        sources?: string[];
        citations?: Array<{ source: string; excerpt: string }>;
        recommendedActions?: Array<{
          id: string;
          title: string;
          requiresConfirmation: boolean;
          payload: Record<string, unknown>;
        }>;
        sessionId?: string;
        agentType?: string;
        degraded?: boolean;
      };

      if (answer.sessionId) setSessionId(answer.sessionId);
      if (answer.agentType) setLastAgentType(answer.agentType);

      let content = answer.answer;
      if (answer.agentType) {
        content = `〔${answer.agentType}〕\n${content}`;
      }
      if (answer.citations?.length) {
        content += `\n\nمنابع:\n${answer.citations.map((c) => `• ${c.source}: ${c.excerpt.slice(0, 80)}`).join('\n')}`;
      }
      if (answer.degraded) {
        content +=
          '\n\n(پاسخ از حالت پشتیبان — سرویس هوشمند موقتاً در دسترس نیست؛ داده از workspace شما استخراج شده است.)';
      }

      const actions = (answer.recommendedActions ?? []).filter((a) => a.requiresConfirmation);
      setPendingActions(
        actions.map((a) => ({
          id: a.id,
          title: a.title,
          payload: { ...a.payload, agentType: answer.agentType },
        })),
      );

      setMessages((prev) => [...prev, createMessage('assistant', content)]);
    } catch {
      toast.error('ارتباط با دستیار برقرار نشد. اتصال اینترنت را بررسی کنید.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card id="conversation" className={fullPage ? 'min-h-[32rem]' : 'h-full'}>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          <Bot className="h-5 w-5 text-primary" aria-hidden />
          دستیار عملیاتی
          <AiServiceStatusBadge />
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          پاسخ‌ها بر اساس داده واقعی workspace شما — دپارتمان را انتخاب کنید یا خودکار بگذارید.
        </p>
        <div className="pt-2">
          <select
            className="border-input bg-background h-9 w-full max-w-xs rounded-md border px-3 text-sm"
            value={agentType}
            onChange={(e) => setAgentType(e.target.value)}
            aria-label="انتخاب دپارتمان"
          >
            <option value="AUTO">مسیریابی خودکار</option>
            {agents.map((a) => (
              <option key={a.type} value={a.type}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="پیشنهادهای سریع">
          {suggestions.map((s) => (
            <Button
              key={s}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => sendQuestion(s)}
              disabled={loading}
            >
              {s}
            </Button>
          ))}
        </div>

        <div
          ref={scrollRef}
          className={`space-y-3 overflow-y-auto rounded-md border bg-muted/30 p-3 ${
            fullPage ? 'min-h-[20rem] flex-1' : 'max-h-72'
          }`}
          aria-live="polite"
          aria-relevant="additions"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-lg px-3 py-2 text-sm whitespace-pre-line ${
                m.role === 'user'
                  ? 'ms-4 bg-primary text-primary-foreground'
                  : 'me-4 border bg-background'
              }`}
            >
              <span className="sr-only">{m.role === 'user' ? 'شما' : 'دستیار'}: </span>
              {m.content}
            </div>
          ))}
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              در حال تحلیل داده‌های شما…
            </div>
          ) : null}
        </div>

        {messages.length > 1 ? (
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => void sendFeedback(true)}>
              <ThumbsUp className="me-1 size-3" />
              مفید
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void sendFeedback(false)}
            >
              <ThumbsDown className="me-1 size-3" />
              غیرمفید
            </Button>
          </div>
        ) : null}

        {pendingActions.length > 0 ? (
          <div className="space-y-2 rounded-md border border-dashed p-3">
            <p className="text-xs font-medium">اقدام پیشنهادی — تأیید کنید:</p>
            {pendingActions.map((action) => (
              <div key={action.id} className="flex flex-wrap items-center gap-2">
                <span className="text-sm">{action.title}</span>
                <Button
                  type="button"
                  size="sm"
                  onClick={async () => {
                    const res = await fetch('/api/conversation/confirm', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        actionId: action.id,
                        approved: true,
                        payload: action.payload,
                      }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      toast.success(data.data.message ?? 'انجام شد');
                      setPendingActions((prev) => prev.filter((a) => a.id !== action.id));
                    }
                  }}
                >
                  تأیید
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await fetch('/api/conversation/confirm', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        actionId: action.id,
                        approved: false,
                        payload: action.payload,
                      }),
                    });
                    setPendingActions((prev) => prev.filter((a) => a.id !== action.id));
                  }}
                >
                  رد
                </Button>
              </div>
            ))}
          </div>
        ) : null}

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            sendQuestion(input);
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="مثلاً: مطالبات سررسید گذشته را خلاصه کن"
            disabled={loading}
            aria-label="سؤال از دستیار"
          />
          <Button type="submit" disabled={loading || !input.trim()} aria-label="ارسال سؤال">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
