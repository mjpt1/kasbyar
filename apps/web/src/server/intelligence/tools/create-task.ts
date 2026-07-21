import type { RecommendedAction } from '@kesbyar/shared';

import { prisma } from '@/lib/prisma';
import { logAudit } from '@/server/audit/audit.service';
import { recordAgentFeedback } from '@/server/platform/platform.service';
import { requireCustomerInOrg, requireLeadInOrg } from '@/server/tenant/tenant-scope';

async function validateTaskForeignKeys(
  organizationId: string,
  customerId?: string,
  leadId?: string,
) {
  if (customerId) await requireCustomerInOrg(organizationId, customerId);
  if (leadId) await requireLeadInOrg(organizationId, leadId);
}

export async function createTaskFromAgent(params: {
  organizationId: string;
  userId: string;
  title: string;
  description?: string;
  customerId?: string;
  leadId?: string;
  dueDate?: Date;
}): Promise<{ taskId: string; action: RecommendedAction }> {
  await validateTaskForeignKeys(params.organizationId, params.customerId, params.leadId);

  const task = await prisma.task.create({
    data: {
      organizationId: params.organizationId,
      createdById: params.userId,
      title: params.title,
      description: params.description,
      customerId: params.customerId,
      leadId: params.leadId,
      dueDate: params.dueDate,
      status: 'TODO',
      priority: 'MEDIUM',
    },
  });

  await logAudit({
    organizationId: params.organizationId,
    userId: params.userId,
    action: 'AGENT_CREATE_TASK',
    entityType: 'Task',
    entityId: task.id,
    metadata: { title: params.title },
  });

  return {
    taskId: task.id,
    action: {
      id: task.id,
      title: 'وظیفه ایجاد شد',
      description: params.title,
      actionType: 'CREATE_TASK',
      payload: { taskId: task.id },
      requiresConfirmation: false,
    },
  };
}

export async function confirmAgentAction(params: {
  organizationId: string;
  userId: string;
  actionId: string;
  approved: boolean;
  payload: Record<string, unknown>;
}) {
  const agentType =
    typeof params.payload.agentType === 'string' ? params.payload.agentType : undefined;

  if (!params.approved) {
    await Promise.all([
      logAudit({
        organizationId: params.organizationId,
        userId: params.userId,
        action: 'AGENT_ACTION_REJECTED',
        entityId: params.actionId,
        metadata: params.payload,
      }),
      recordAgentFeedback(params.organizationId, {
        userId: params.userId,
        feedbackType: 'ACTION_REJECTED',
        agentType,
        referenceId: params.actionId,
        metadata: params.payload,
      }),
    ]);
    return { success: false, message: 'اقدام لغو شد' };
  }

  if (params.payload.actionType === 'CREATE_TASK' && typeof params.payload.title === 'string') {
    const result = await createTaskFromAgent({
      organizationId: params.organizationId,
      userId: params.userId,
      title: params.payload.title,
      description:
        typeof params.payload.description === 'string' ? params.payload.description : undefined,
      customerId:
        typeof params.payload.customerId === 'string' ? params.payload.customerId : undefined,
      leadId: typeof params.payload.leadId === 'string' ? params.payload.leadId : undefined,
    });

    await recordAgentFeedback(params.organizationId, {
      userId: params.userId,
      feedbackType: 'ACTION_APPROVED',
      agentType,
      referenceId: params.actionId,
      metadata: { taskId: result.taskId, ...params.payload },
    });

    return { success: true, message: 'وظیفه ایجاد شد', taskId: result.taskId };
  }

  return { success: false, message: 'نوع اقدام پشتیبانی نمی‌شود' };
}
