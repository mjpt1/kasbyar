import { describe, expect, it } from 'vitest';

import { chunkText, cosineSimilarity } from '@/server/memory/memory.chunk';

describe('memory.chunk', () => {
  it('chunks long text', () => {
    const text = 'الف'.repeat(2000);
    const chunks = chunkText(text, 500, 50);
    expect(chunks.length).toBeGreaterThan(1);
  });

  it('computes cosine similarity', () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBe(1);
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
  });
});
