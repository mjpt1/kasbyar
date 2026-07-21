import type { AutomationAction, AutomationTrigger } from '@prisma/client';

import { APP_LOG_EVENTS, logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/server/audit/audit.service';
import { getStaleLeads } from '@/server/leads/lead.service';
import { listAutomationRules } from '@/server/reports/reports.service';

export interface AutomationRunResult {
  ruleId: string;
  ruleName: string;
  trigger: AutomationTrigger;
  action: AutomationAction;
  affected: number;
  details: string[];
}

export async function runAutomationForOrganization(
  organizationId: string,
  userId?: string,
): Promise<AutomationRunResult[]> {
  const rules = await listAutomationRules(organizationId);
  const activeRules = rules.filter((r) => r.isActive);
  const results: AutomationRunResult[] = [];

  for (const rule of activeRules) {
    try {
      const result = await executeRule(organizationId, rule, userId);
      if (result.affected > 0) {
        results.push(result);
      }
    } catch (error) {
      logger.warn(APP_LOG_EVENTS.AUTOMATION_RULE_FAILED, {
        organizationId,
        ruleId: rule.id,
        ruleName: rule.name,
        message: error instanceof Error ? error.message : String(error),
      });
      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        trigger: rule.trigger,
        action: rule.action,
        affected: 0,
        details: ['خطا در اجرای قانون — سایر قوانین ادامه یافت'],
      });
    }
  }

  if (results.length > 0 && userId) {
    await logActivity({
      organizationId,
      userId,
      type: 'SYSTEM',
      title: 'اجرای اتوماسیون',
      description: `${results.length} قانون اجرا شد`,
    });
  }

  return results;
}

async function executeRule(
  organizationId: string,
  rule: {
    id: string;
    name: string;
    trigger: AutomationTrigger;
    action: AutomationAction;
    description: string | null;
  },
  userId?: string,
): Promise<AutomationRunResult> {
  const details: string[] = [];
  let affected = 0;

  switch (rule.trigger) {
    case 'INVOICE_OVERDUE': {
      const invoices = await prisma.invoice.findMany({
        where: {
          organizationId,
          status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] },
          dueDate: { lt: new Date() },
        },
        include: { customer: true },
        take: 20,
      });

      for (const invoice of invoices) {
        const done = await applyAction(organizationId, rule.action, {
          title: `پیگیری فاکتور معوق ${invoice.number}`,
          description: `مشتری: ${invoice.customer.name} — قانون: ${rule.name}`,
          userId,
        });
        if (done) {
          affected += 1;
          details.push(invoice.number);
        }
      }
      break;
    }

    case 'LEAD_STALE': {
      const leads = await getStaleLeads(organizationId, 7);
      for (const lead of leads) {
        const done = await applyAction(organizationId, rule.action, {
          title: `پیگیری لید: ${lead.title}`,
          description: rule.description ?? `لید بدون پیگیری — ${rule.name}`,
          userId,
        });
        if (done) {
          affected += 1;
          details.push(lead.title);
        }
      }
      break;
    }

    case 'TASK_DUE': {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const tasks = await prisma.task.findMany({
        where: {
          organizationId,
          status: { in: ['TODO', 'IN_PROGRESS'] },
          dueDate: { gte: start, lte: end },
        },
        take: 20,
      });

      for (const task of tasks) {
        const done = await applyAction(organizationId, rule.action, {
          title: `یادآوری وظیفه: ${task.title}`,
          description: task.description ?? rule.name,
          userId,
          taskId: task.id,
        });
        if (done) {
          affected += 1;
          details.push(task.title);
        }
      }
      break;
    }

    case 'PAYMENT_RECEIVED': {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const payments = await prisma.payment.findMany({
        where: { organizationId, status: 'COMPLETED', paidAt: { gte: since } },
        include: { customer: true },
        take: 20,
      });
      for (const payment of payments) {
        const done = await applyAction(organizationId, rule.action, {
          title: `پرداخت دریافت شد: ${payment.customer.name}`,
          description: `مبلغ ${payment.amount} — قانون: ${rule.name}`,
          userId,
        });
        if (done) {
          affected += 1;
          details.push(payment.customer.name);
        }
      }
      break;
    }

    case 'CUSTOMER_CREATED': {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const customers = await prisma.customer.findMany({
        where: { organizationId, createdAt: { gte: since }, deletedAt: null },
        take: 20,
      });
      for (const customer of customers) {
        const done = await applyAction(organizationId, rule.action, {
          title: `مشتری جدید: ${customer.name}`,
          description: rule.description ?? rule.name,
          userId,
        });
        if (done) {
          affected += 1;
          details.push(customer.name);
        }
      }
      break;
    }
  }

  return {
    ruleId: rule.id,
    ruleName: rule.name,
    trigger: rule.trigger,
    action: rule.action,
    affected,
    details,
  };
}

async function applyAction(
  organizationId: string,
  action: AutomationAction,
  payload: {
    title: string;
    description?: string;
    userId?: string;
    taskId?: string;
  },
): Promise<boolean> {
  switch (action) {
    case 'CREATE_TASK': {
      const existing = await prisma.task.findFirst({
        where: {
          organizationId,
          title: payload.title,
          status: { in: ['TODO', 'IN_PROGRESS'] },
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      });
      if (existing) return false;

      await prisma.task.create({
        data: {
          organizationId,
          title: payload.title,
          description: payload.description,
          createdById: payload.userId,
          priority: 'MEDIUM',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
      return true;
    }

    case 'SEND_REMINDER': {
      const existing = await prisma.reminder.findFirst({
        where: {
          organizationId,
          title: payload.title,
          remindAt: { gte: new Date() },
          isSent: false,
        },
      });
      if (existing) return false;

      await prisma.reminder.create({
        data: {
          organizationId,
          title: payload.title,
          message: payload.description,
          remindAt: new Date(Date.now() + 60 * 60 * 1000),
          userId: payload.userId,
          taskId: payload.taskId,
        },
      });
      return true;
    }

    case 'NOTIFY_USER': {
      await prisma.reminder.create({
        data: {
          organizationId,
          title: payload.title,
          message: payload.description,
          remindAt: new Date(Date.now() + 30 * 60 * 1000),
          userId: payload.userId,
        },
      });
      if (payload.userId) {
        const { createNotification } = await import('@/server/notifications/notification.service');
        await createNotification({
          organizationId,
          userId: payload.userId,
          title: payload.title,
          body: payload.description || payload.title,
          href: '/tasks',
          category: 'AUTOMATION',
        });
      }
      return true;
    }

    case 'UPDATE_STATUS':
      return false;
  }
}
