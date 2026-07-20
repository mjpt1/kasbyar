import type { LlmEmbedResponse } from '@kesbyar/shared/ai';

import { getAiServiceConfig } from '@/lib/ai/config';

export async function embedTexts(texts: string[]): Promise<number[][] | null> {
  if (texts.length === 0) return [];
  const config = getAiServiceConfig();
  try {
    const res = await fetch(`${config.baseUrl}/api/v1/llm/embed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Token': config.token,
        Authorization: `Bearer ${config.token}`,
      },
      body: JSON.stringify({ texts }),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as LlmEmbedResponse;
    return data.embeddings;
  } catch {
    return null;
  }
}
