import Link from 'next/link';
import { Bot } from 'lucide-react';

export function ConversationNavLink() {
  return (
    <Link
      href="/conversation"
      className="flex items-center gap-2 text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Bot className="h-4 w-4" aria-hidden />
      دستیار هوشمند
    </Link>
  );
}
