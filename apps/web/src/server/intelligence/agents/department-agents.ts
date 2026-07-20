import type { AgentTypeName } from '@kesbyar/shared';

import { runAgentOrchestrator } from '../agent-orchestrator';
import {
  DEPARTMENT_PROMPTS,
  DEPARTMENT_TOOLS,
  buildDepartmentSuggestedActions,
  listDepartmentAgents,
} from './department-profiles';

export {
  DEPARTMENT_PROMPTS,
  DEPARTMENT_TOOLS,
  buildDepartmentSuggestedActions,
  listDepartmentAgents,
};

export async function runDepartmentAgent(params: {
  organizationId: string;
  userId: string;
  agentType: AgentTypeName;
  question: string;
  sessionId?: string;
}) {
  const profile = DEPARTMENT_PROMPTS[params.agentType] ?? DEPARTMENT_PROMPTS.CEO;
  return runAgentOrchestrator({
    organizationId: params.organizationId,
    userId: params.userId,
    question: params.question,
    sessionId: params.sessionId,
    agentType: params.agentType,
    systemPrompt: profile.systemPrompt,
  });
}
