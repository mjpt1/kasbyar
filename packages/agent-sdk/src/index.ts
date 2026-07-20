export type AgentPermission =
  | 'read:customers'
  | 'write:customers'
  | 'read:leads'
  | 'write:leads'
  | 'read:invoices'
  | 'write:tasks'
  | 'read:memory'
  | 'write:memory'
  | 'read:finance'
  | 'admin:plugins';

export interface AgentToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  requiredPermissions?: AgentPermission[];
}

export interface AgentDefinition {
  type: string;
  name: string;
  goal: string;
  tools: AgentToolDefinition[];
  permissions: AgentPermission[] | string[];
  systemPrompt?: string;
}

export interface AgentManifest {
  slug: string;
  version: string;
  agents: AgentDefinition[];
  metadata?: Record<string, unknown>;
}

export interface PermissionCheckResult {
  allowed: boolean;
  missing: string[];
}

const KNOWN_PERMISSIONS = new Set<string>([
  'read:customers',
  'write:customers',
  'read:leads',
  'write:leads',
  'read:invoices',
  'write:tasks',
  'read:memory',
  'write:memory',
  'read:finance',
  'admin:plugins',
]);

export function validateAgentManifest(manifest: AgentManifest): string[] {
  const errors: string[] = [];
  if (!manifest.slug) errors.push('slug is required');
  if (!manifest.version) errors.push('version is required');
  if (!manifest.agents?.length) errors.push('at least one agent is required');
  for (const agent of manifest.agents ?? []) {
    if (!agent.type) errors.push('agent.type is required');
    if (!agent.goal) errors.push(`agent ${agent.type}: goal is required`);
    if (!agent.name) errors.push(`agent ${agent.type}: name is required`);
    for (const perm of agent.permissions ?? []) {
      if (!KNOWN_PERMISSIONS.has(perm) && !perm.includes(':')) {
        errors.push(`agent ${agent.type}: unknown permission ${perm}`);
      }
    }
    for (const tool of agent.tools ?? []) {
      if (!tool.name) errors.push(`agent ${agent.type}: tool name required`);
      if (!tool.parameters || typeof tool.parameters !== 'object') {
        errors.push(`agent ${agent.type}: tool ${tool.name} needs parameters schema`);
      }
    }
  }
  return errors;
}

export function createAgentSdkTemplate(slug: string): AgentManifest {
  return {
    slug,
    version: '1.0.0',
    agents: [
      {
        type: 'CUSTOM',
        name: 'Custom Agent',
        goal: 'Describe what this agent does',
        tools: [
          {
            name: 'echo',
            description: 'Echo input for smoke tests',
            parameters: {
              type: 'object',
              properties: { message: { type: 'string' } },
              required: ['message'],
            },
            requiredPermissions: ['read:customers'],
          },
        ],
        permissions: ['read:customers'],
        systemPrompt: 'You are a helpful business agent.',
      },
    ],
  };
}

export function registerAgent(manifest: AgentManifest, agent: AgentDefinition): AgentManifest {
  const next = {
    ...manifest,
    agents: [...(manifest.agents ?? []).filter((a) => a.type !== agent.type), agent],
  };
  return next;
}

export function defineTool(
  name: string,
  description: string,
  parameters: Record<string, unknown>,
  requiredPermissions: AgentPermission[] = [],
): AgentToolDefinition {
  return { name, description, parameters, requiredPermissions };
}

export function checkAgentPermissions(
  agent: AgentDefinition,
  granted: string[],
): PermissionCheckResult {
  const grantedSet = new Set(granted);
  const missing = (agent.permissions ?? []).filter((p) => !grantedSet.has(p));
  return { allowed: missing.length === 0, missing };
}

export function checkToolPermissions(
  tool: AgentToolDefinition,
  granted: string[],
): PermissionCheckResult {
  const required = tool.requiredPermissions ?? [];
  const grantedSet = new Set(granted);
  const missing = required.filter((p) => !grantedSet.has(p));
  return { allowed: missing.length === 0, missing };
}

export function listAgentTools(manifest: AgentManifest, agentType?: string): AgentToolDefinition[] {
  const agents = agentType
    ? manifest.agents.filter((a) => a.type === agentType)
    : manifest.agents;
  return agents.flatMap((a) => a.tools ?? []);
}

export function getAgentByType(
  manifest: AgentManifest,
  type: string,
): AgentDefinition | undefined {
  return manifest.agents.find((a) => a.type === type);
}

export function mergeManifests(base: AgentManifest, overlay: Partial<AgentManifest>): AgentManifest {
  return {
    ...base,
    ...overlay,
    slug: overlay.slug ?? base.slug,
    version: overlay.version ?? base.version,
    agents: overlay.agents ?? base.agents,
    metadata: { ...(base.metadata ?? {}), ...(overlay.metadata ?? {}) },
  };
}
