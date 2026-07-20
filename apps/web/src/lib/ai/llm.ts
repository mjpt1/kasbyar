import { getAiServiceConfig } from './config';

export async function chatWithLlm(params: {
  systemPrompt: string;
  userContent: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string | null> {
  const config = getAiServiceConfig();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const res = await fetch(`${config.baseUrl}/api/v1/llm/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Token': config.token,
        Authorization: `Bearer ${config.token}`,
      },
      body: JSON.stringify({
        system_prompt: params.systemPrompt,
        messages: [{ role: 'user', content: params.userContent }],
        temperature: params.temperature ?? 0.3,
        max_tokens: params.maxTokens ?? 1000,
      }),
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { content?: string };
    return data.content?.trim() || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
