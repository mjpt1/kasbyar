/** Map web deep-link / notification href to mobile route. */
export function resolveDeepLink(href: string): string {
  const path = href.replace(/^https?:\/\/[^/]+/, '').split('?')[0] ?? '/';
  const clean = path.startsWith('/') ? path : `/${path}`;

  if (clean === '/' || clean === '/dashboard') return '/(app)';
  if (clean.startsWith('/leads')) return '/(app)/leads';
  if (clean.startsWith('/customers')) return '/(app)/customers';
  if (clean.startsWith('/invoices')) {
    const id = clean.match(/\/invoices\/([^/]+)/)?.[1];
    if (id) return `/(app)/invoices/${id}`;
    return '/(app)/invoices';
  }
  if (clean.startsWith('/pay/')) {
    const token = clean.split('/')[2];
    return token ? `/(app)/pay/${token}` : '/(app)/invoices';
  }
  if (clean.startsWith('/chat')) return '/(app)/chat';
  if (clean.startsWith('/support')) return '/(app)/support';
  if (clean.startsWith('/tasks')) return '/(app)/tasks';
  if (clean.startsWith('/payments')) return '/(app)/payments';
  if (clean.startsWith('/notifications')) return '/(app)/notifications';
  if (clean.startsWith('/settings')) return '/(app)/settings';
  if (clean.startsWith('/conversation')) return '/(app)/conversation';
  if (clean.startsWith('/command')) return '/(app)/command';

  const trimmed = clean.replace(/^\//, '');
  return `/(app)/feature/${trimmed.split('/').map(encodeURIComponent).join('/')}`;
}

export const LINKING_PREFIXES = ['kesbyar://', 'https://kasbyar.vercel.app', 'https://kasbyar.ir'];
