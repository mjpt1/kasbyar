import { describe, expect, it } from 'vitest';

import {
  checkAgentPermissions,
  checkToolPermissions,
  createAgentSdkTemplate,
  defineTool,
  getAgentByType,
  listAgentTools,
  mergeManifests,
  registerAgent,
  validateAgentManifest,
} from '@kasbyar/agent-sdk';

describe('@kasbyar/agent-sdk', () => {
  it('validates manifest', () => {
    const template = createAgentSdkTemplate('demo-agent');
    expect(validateAgentManifest(template)).toEqual([]);
  });

  it('reports missing slug', () => {
    expect(validateAgentManifest({ slug: '', version: '1', agents: [] })).toContain(
      'slug is required',
    );
  });

  it('registers agents and lists tools', () => {
    const base = createAgentSdkTemplate('ops');
    const next = registerAgent(base, {
      type: 'SALES',
      name: 'فروش',
      goal: 'رشد فروش',
      tools: [
        defineTool('query_sales', 'خلاصه فروش', { type: 'object', properties: {} }, [
          'read:leads',
        ]),
      ],
      permissions: ['read:leads', 'write:tasks'],
    });
    expect(getAgentByType(next, 'SALES')?.name).toBe('فروش');
    expect(listAgentTools(next, 'SALES')).toHaveLength(1);
  });

  it('checks permissions', () => {
    const agent = createAgentSdkTemplate('x').agents[0]!;
    expect(checkAgentPermissions(agent, ['read:customers']).allowed).toBe(true);
    expect(checkAgentPermissions(agent, []).missing).toContain('read:customers');

    const tool = defineTool('t', 'd', {}, ['write:tasks']);
    expect(checkToolPermissions(tool, ['write:tasks']).allowed).toBe(true);
    expect(checkToolPermissions(tool, []).allowed).toBe(false);
  });

  it('merges manifests', () => {
    const merged = mergeManifests(createAgentSdkTemplate('a'), {
      version: '2.0.0',
      metadata: { region: 'IR' },
    });
    expect(merged.version).toBe('2.0.0');
    expect(merged.metadata?.region).toBe('IR');
  });
});
