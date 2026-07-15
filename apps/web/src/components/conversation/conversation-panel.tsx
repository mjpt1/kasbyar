'use client';

import type { ConversationMessage } from '@kesbyar/shared';
import { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

import { AiServiceStatusBadge } from '@/components/ai/ai-service-status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const suggestions = [
  'امروز چقدر فروش داشتم؟',
  'کدام مشتری‌ها بدهکارند؟',
  'چه لیدهایی پیگیری نشده‌اند؟',
  'خلاصه وضعیت امروز چیست؟',
];

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
      'سلام! من دستیار عملیاتی کسب‌یار هستم. می‌توانید دربارهٔ فروش، مطالبات، لیدها و وظایف امروز بپرسید.',
    ),
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  async function sendQuestion(question: string) {
    if (!question.trim() || loading) return;

    setMessages((prev) => [...prev, createMessage('user', question.trim())]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      });
      const data = await res.json();

      if (!data.success) {
        toast.error(data.error?.message ?? 'خطا در دریافت پاسخ');
        return;
      }

      const answer = data.data as {
        answer: string;
        sources?: string[];
        degraded?: boolean;
      };

      let content = answer.answer;
      if (answer.degraded) {
        content +=
          '\n\n(پاسخ از حالت پشتیبان — سرویس هوشمند موقتاً در دسترس نیست؛ داده از workspace شما استخراج شده است.)';
      }

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
          پاسخ‌ها بر اساس داده واقعی workspace شما — نه چت عمومی.
        </p>
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
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="ارسال سؤال"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
