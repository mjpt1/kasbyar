'use client';

import type { ConversationMessage } from '@kesbyar/shared';
import { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Plus, Send, ThumbsDown, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';

import { AiServiceStatusBadge } from '@/components/ai/ai-service-status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const STORAGE_KEY = 'kesbyar_assistant_session';

const suggestions = [
  'امروز چقدر فروش داشتم؟',
  'کدام مشتری‌ها بدهکارند؟',
  'چه سرنخ‌های فروشی پیگیری نشده‌اند؟',
  'خلاصه وضعیت امروز چیست؟',
];

type AgentOption = { type: string; name: string };
type SessionOption = { id: string; title: string; updatedAt: string; messageCount: number };

function createMessage(
  role: ConversationMessage['role'],
  content: string,
  id?: string,
  createdAt?: string,
): ConversationMessage {
  return {
    id: id ?? `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    content,
    createdAt: createdAt ?? new Date().toISOString(),
  };
}

const GREETING =
  'سلام! من دستیار عملیاتی کسب‌یار هستم. می‌توانید دپارتمان را انتخاب کنید یا بگذارید به‌صورت خودکار مسیر‌یابی شود.';

export function ConversationPanel({ fullPage = false }: { fullPage?: boolean }) {
  const [messages, setMessages] = useState<ConversationMessage[]>([
    createMessage('assistant', GREETING),
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const [agentType, setAgentType] = useState<string>('AUTO');
  const [lastAgentType, setLastAgentType] = useState<string | undefined>();
  const [pendingActions, setPendingActions] = useState<
    Array<{ id: string; title: string; payload: Record<string, unknown> }>
  >([]);
  const [hydrated, setHydrated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function loadSession(id: string) {
    const res = await fetch(`/api/conversation?sessionId=${encodeURIComponent(id)}`);
    const data = await res.json();
    if (!data.success) return false;
    const history = data.data.messages as ConversationMessage[];
    setSessionId(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore
    }
    setMessages(
      history.length > 0
        ? history
        : [createMessage('assistant', GREETING)],
    );
    return true;
  }

  useEffect(() => {
    void (async () => {
      const res = await fetch('/api/conversation');
      const data = await res.json();
      if (data.success) {
        setAgents(data.data.agents ?? []);
        setSessions(data.data.sessions ?? []);
      }

      let stored: string | null = null;
      try {
        stored = localStorage.getItem(STORAGE_KEY);
      } catch {
        stored = null;
      }

      if (stored) {
        const ok = await loadSession(stored);
        if (!ok) {
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch {
            // ignore
          }
        }
      }
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  function startNewChat() {
    setSessionId(undefined);
    setMessages([createMessage('assistant', GREETING)]);
    setPendingActions([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

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

      if (answer.sessionId) {
        setSessionId(answer.sessionId);
        try {
          localStorage.setItem(STORAGE_KEY, answer.sessionId);
        } catch {
          // ignore
        }
        setSessions((prev) => {
          if (prev.some((s) => s.id === answer.sessionId)) return prev;
          return [
            {
              id: answer.sessionId!,
              title: question.trim().slice(0, 40),
              updatedAt: new Date().toISOString(),
              messageCount: 2,
            },
            ...prev,
          ];
        });
      }
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
          پاسخ‌ها بر اساس داده واقعی workspace شما — تاریخچه گفتگو ذخیره می‌شود.
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-2">
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
          {hydrated && sessions.length > 0 ? (
            <select
              className="border-input bg-background h-9 w-full max-w-xs rounded-md border px-3 text-sm"
              value={sessionId ?? ''}
              onChange={(e) => {
                const id = e.target.value;
                if (!id) {
                  startNewChat();
                  return;
                }
                void loadSession(id);
              }}
              aria-label="گفتگوهای قبلی"
            >
              <option value="">گفتگوی جاری / جدید</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.messageCount})
                </option>
              ))}
            </select>
          ) : null}
          <Button type="button" size="sm" variant="outline" onClick={startNewChat}>
            <Plus className="size-3.5" aria-hidden />
            گفتگوی جدید
          </Button>
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
