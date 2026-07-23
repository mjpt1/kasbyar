'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertCircle,
  Hash,
  Loader2,
  MessageCircle,
  MessagesSquare,
  Plus,
  Send,
  Users,
} from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Member = { id: string; name: string; email?: string };
type Conversation = {
  id: string;
  type: 'DIRECT' | 'CHANNEL';
  name: string | null;
  members: Member[];
  lastMessage: { body: string; createdAt: string; user: Member } | null;
  unread: boolean;
};
type ChatMessage = {
  id: string;
  body: string;
  createdAt: string;
  user: Member;
};

function conversationTitle(c: Conversation, currentUserId: string | null) {
  if (c.type === 'CHANNEL') return c.name ?? 'کانال';
  const peer = c.members.find((m) => m.id !== currentUserId);
  return peer?.name ?? 'گفتگوی مستقیم';
}

export function ChatWorkspace() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [members, setMembers] = useState<Array<{ user: Member }>>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [moduleDisabled, setModuleDisabled] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  const loadConversations = useCallback(async () => {
    const res = await fetch('/api/chat/conversations');
    const json = await res.json();
    if (!json?.success) {
      const message = json.error?.message ?? 'بارگذاری گفتگوها ناموفق بود';
      setLoadError(message);
      setModuleDisabled(res.status === 403);
      return;
    }
    setLoadError(null);
    setModuleDisabled(false);
    setConversations(json.data.conversations ?? []);
    setMembers(json.data.members ?? []);
    setCurrentUserId(json.data.currentUserId ?? null);
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/chat/conversations/${conversationId}/messages`);
      const json = await res.json();
      if (!json?.success) {
        toast.error(json.error?.message ?? 'بارگذاری پیام‌ها ناموفق بود');
        return;
      }
      setMessages(json.data.items ?? []);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await loadConversations();
      setLoading(false);
    })();
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedId) return;
    void loadMessages(selectedId);
    const tick = () => {
      if (document.visibilityState === 'visible') void loadMessages(selectedId);
    };
    const id = window.setInterval(tick, 8000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [selectedId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function startDirect(peerUserId: string) {
    const res = await fetch('/api/chat/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'direct', peerUserId }),
    });
    const json = await res.json();
    if (!json.success) {
      toast.error(json.error?.message ?? 'شروع گفتگو ناموفق بود');
      return;
    }
    await loadConversations();
    setSelectedId(json.data.id);
    setShowNew(false);
  }

  async function createChannel() {
    if (!channelName.trim()) return;
    const res = await fetch('/api/chat/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'channel', name: channelName.trim() }),
    });
    const json = await res.json();
    if (!json.success) {
      toast.error(json.error?.message ?? 'ایجاد کانال ناموفق بود');
      return;
    }
    setChannelName('');
    setShowNew(false);
    await loadConversations();
    setSelectedId(json.data.id);
  }

  async function send() {
    if (!selectedId || !draft.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/chat/conversations/${selectedId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: draft.trim() }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error?.message ?? 'ارسال پیام ناموفق بود');
        return;
      }
      setDraft('');
      setMessages((prev) => [...prev, json.data]);
      await loadConversations();
    } finally {
      setSending(false);
    }
  }

  if (moduleDisabled) {
    return (
      <div className="space-y-4">
        <PageHeader title="گفتگوی تیم" description="پیام مستقیم و کانال‌های داخلی سازمان" />
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <AlertCircle className="size-10 text-muted-foreground" aria-hidden />
            <div className="space-y-2">
              <p className="font-medium">{loadError}</p>
              <p className="text-sm text-muted-foreground">
                برای استفاده از گفتگوی داخلی، ماژول را از بخش افزونه‌ها فعال کنید.
              </p>
            </div>
            <Button asChild className="cursor-pointer">
              <Link href="/platform">رفتن به افزونه‌ها</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-4">
        <PageHeader title="گفتگوی تیم" description="پیام مستقیم و کانال‌های داخلی سازمان" />
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <AlertCircle className="size-10 text-destructive" aria-hidden />
            <p className="text-sm">{loadError}</p>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => void loadConversations()}
            >
              تلاش مجدد
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="گفتگوی تیم"
        description="پیام مستقیم و کانال‌های داخلی سازمان"
        actions={
          <Button
            size="sm"
            className="cursor-pointer"
            aria-expanded={showNew}
            aria-label="گفتگوی جدید"
            onClick={() => setShowNew((v) => !v)}
          >
            <Plus className="ms-1 size-4" aria-hidden />
            گفتگوی جدید
          </Button>
        }
      />

      {showNew ? (
        <Card>
          <CardContent className="grid gap-4 p-4 sm:grid-cols-2">
            <div>
              <Label className="mb-2 block">پیام مستقیم</Label>
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {members.length === 0 ? (
                  <p className="text-sm text-muted-foreground">عضو دیگری در سازمان نیست.</p>
                ) : (
                  members.map((m) => (
                    <button
                      key={m.user.id}
                      type="button"
                      className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-start text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={`شروع گفتگو با ${m.user.name}`}
                      onClick={() => void startDirect(m.user.id)}
                    >
                      <Users className="size-4 shrink-0" aria-hidden />
                      {m.user.name}
                    </button>
                  ))
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel-name">کانال تیمی</Label>
              <Input
                id="channel-name"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="مثلاً فروش، پشتیبانی داخلی"
              />
              <Button
                type="button"
                variant="secondary"
                className="cursor-pointer"
                disabled={!channelName.trim()}
                onClick={() => void createChannel()}
              >
                <Hash className="ms-1 size-4" aria-hidden />
                ایجاد کانال
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid min-h-[28rem] gap-4 lg:grid-cols-[16rem_1fr]">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                در حال بارگذاری…
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center gap-3 p-6 text-center">
                <MessagesSquare className="size-8 text-muted-foreground" aria-hidden />
                <p className="text-sm text-muted-foreground">هنوز گفتگویی ندارید.</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => setShowNew(true)}
                >
                  شروع گفتگوی جدید
                </Button>
              </div>
            ) : (
              <ul role="listbox" aria-label="فهرست گفتگوها">
                {conversations.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selectedId === c.id}
                      className={cn(
                        'flex w-full cursor-pointer items-start gap-2 border-b px-3 py-3 text-start text-sm transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                        selectedId === c.id && 'bg-primary/5',
                      )}
                      onClick={() => setSelectedId(c.id)}
                    >
                      {c.type === 'CHANNEL' ? (
                        <Hash className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                      ) : (
                        <MessageCircle
                          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                      )}
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn('block truncate font-medium', c.unread && 'text-primary')}
                        >
                          {conversationTitle(c, currentUserId)}
                        </span>
                        {c.lastMessage ? (
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                            {c.lastMessage.body}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col overflow-hidden">
          {!selected ? (
            <CardContent className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-sm text-muted-foreground">
              <MessageCircle className="size-10 opacity-50" aria-hidden />
              <p>یک گفتگو را انتخاب کنید یا گفتگوی جدید بسازید.</p>
            </CardContent>
          ) : (
            <>
              <div className="border-b px-4 py-3 text-sm font-semibold">
                {conversationTitle(selected, currentUserId)}
              </div>
              <CardContent className="flex min-h-0 flex-1 flex-col p-0">
                <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      در حال بارگذاری پیام‌ها…
                    </div>
                  ) : messages.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      اولین پیام را بفرستید.
                    </p>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className="rounded-lg border bg-background px-3 py-2">
                        <div className="text-xs font-medium text-primary">{m.user.name}</div>
                        <p className="mt-1 whitespace-pre-wrap text-sm">{m.body}</p>
                        <time
                          className="mt-1 block text-[10px] text-muted-foreground"
                          dateTime={m.createdAt}
                        >
                          {new Date(m.createdAt).toLocaleString('fa-IR')}
                        </time>
                      </div>
                    ))
                  )}
                  <div ref={bottomRef} />
                </div>
                <div className="flex gap-2 border-t p-3">
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="پیام خود را بنویسید…"
                    rows={2}
                    className="min-h-0 resize-none"
                    aria-label="متن پیام"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void send();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="icon"
                    className="cursor-pointer shrink-0"
                    disabled={sending || !draft.trim()}
                    aria-label="ارسال پیام"
                    onClick={() => void send()}
                  >
                    {sending ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <Send className="size-4" aria-hidden />
                    )}
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
