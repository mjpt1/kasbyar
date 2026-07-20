import type { AgentTypeName, RecommendedAction } from '@kesbyar/shared';
import { defineTool } from '@kasbyar/agent-sdk';

export const DEPARTMENT_PROMPTS: Record<
  AgentTypeName,
  { name: string; systemPrompt: string; focus: string[] }
> = {
  CEO: {
    name: 'مدیرعامل',
    systemPrompt:
      'شما AI CEO هستید. اولویت با تصمیم‌های اجرایی، ریسک نقدینگی، رشد و هماهنگی بین‌بخشی است. پیشنهادهای تأییدپذیر بدهید.',
    focus: ['خلاصه وضعیت', 'اولویت‌بندی', 'اقدامات بین‌بخشی'],
  },
  SALES: {
    name: 'مدیر فروش',
    systemPrompt:
      'شما مدیر فروش هستید. روی لیدها، نرخ تبدیل، پیگیری فروش و پیشنهاد ساخت وظیفه تمرکز کنید.',
    focus: ['لیدهای راکد', 'فروش هفته/ماه', 'پیگیری مشتری'],
  },
  FINANCE: {
    name: 'مدیر مالی',
    systemPrompt:
      'شما مدیر مالی هستید. مطالبات، نقدینگی، فاکتورهای معوق و ریسک مالی را تحلیل کنید.',
    focus: ['مطالبات', 'نقدینگی', 'فاکتورها'],
  },
  HR: {
    name: 'مدیر منابع انسانی',
    systemPrompt:
      'شما مدیر منابع انسانی هستید. بار کاری، انباشت وظایف و نیاز به نیرو را بررسی کنید.',
    focus: ['بار وظایف', 'ظرفیت تیم'],
  },
  OPERATIONS: {
    name: 'مدیر عملیات',
    systemPrompt:
      'شما مدیر عملیات هستید. گردش کار، سررسید وظایف و گلوگاه‌های اجرایی را مدیریت کنید.',
    focus: ['وظایف امروز', 'گلوگاه عملیات'],
  },
  MARKETING: {
    name: 'مدیر مارکتینگ',
    systemPrompt:
      'شما مدیر مارکتینگ هستید. کمپین، محتوا، جذب و رشد کانال‌ها را پیشنهاد دهید.',
    focus: ['کمپین', 'محتوا', 'رشد'],
  },
  SUPPORT: {
    name: 'پشتیبانی',
    systemPrompt:
      'شما پشتیبان مشتریان هستید. رضایت، شکایت و حفظ مشتری را اولویت دهید.',
    focus: ['رضایت مشتری', 'پیگیری شکایت'],
  },
  INVENTORY: {
    name: 'مدیر انبار',
    systemPrompt:
      'شما مدیر انبار هستید. موجودی، نقطه سفارش و ریسک اتمام موجودی را بررسی کنید.',
    focus: ['موجودی', 'stockout'],
  },
  LEGAL: {
    name: 'حقوقی',
    systemPrompt:
      'شما مشاور حقوقی کسب‌وکار هستید. ریسک قرارداد، تعهد و مستندسازی را یادآوری کنید.',
    focus: ['قرارداد', 'ریسک حقوقی'],
  },
};

export const DEPARTMENT_TOOLS = {
  CEO: [
    defineTool('query_ops', 'خلاصه عملیاتی کل سازمان', { type: 'object', properties: {} }, [
      'read:finance',
      'read:leads',
    ]),
    defineTool(
      'create_task',
      'ایجاد وظیفه اجرایی',
      { type: 'object', properties: { title: { type: 'string' } }, required: ['title'] },
      ['write:tasks'],
    ),
  ],
  SALES: [
    defineTool('query_sales', 'خلاصه فروش و لید', { type: 'object', properties: {} }, [
      'read:leads',
    ]),
    defineTool(
      'create_task',
      'وظیفه پیگیری فروش',
      { type: 'object', properties: { title: { type: 'string' } }, required: ['title'] },
      ['write:tasks'],
    ),
  ],
  FINANCE: [
    defineTool('query_invoices', 'خلاصه مطالبات و فاکتور', { type: 'object', properties: {} }, [
      'read:invoices',
      'read:finance',
    ]),
  ],
  HR: [
    defineTool('query_ops', 'بار کاری و وظایف', { type: 'object', properties: {} }, [
      'write:tasks',
    ]),
  ],
  OPERATIONS: [
    defineTool('query_ops', 'وضعیت عملیات', { type: 'object', properties: {} }),
    defineTool(
      'create_task',
      'وظیفه عملیاتی',
      { type: 'object', properties: { title: { type: 'string' } }, required: ['title'] },
      ['write:tasks'],
    ),
  ],
  MARKETING: [
    defineTool('query_sales', 'سیگنال رشد فروش', { type: 'object', properties: {} }, [
      'read:leads',
    ]),
  ],
  SUPPORT: [
    defineTool('query_customers', 'وضعیت مشتریان', { type: 'object', properties: {} }, [
      'read:customers',
    ]),
  ],
  INVENTORY: [
    defineTool('query_ops', 'وضعیت موجودی و عملیات', { type: 'object', properties: {} }),
  ],
  LEGAL: [
    defineTool(
      'search_memory',
      'جستجوی اسناد و قراردادها',
      {
        type: 'object',
        properties: { query: { type: 'string' } },
        required: ['query'],
      },
      ['read:memory'],
    ),
  ],
} as const;

export function buildDepartmentSuggestedActions(
  agentType: AgentTypeName,
  question: string,
): RecommendedAction[] {
  const titlePrefix = DEPARTMENT_PROMPTS[agentType]?.name ?? agentType;
  return [
    {
      id: `dept-action-${Date.now()}`,
      title: `وظیفه ${titlePrefix}`,
      description: question.slice(0, 120),
      actionType: 'CREATE_TASK',
      payload: {
        actionType: 'CREATE_TASK',
        title: `[${titlePrefix}] ${question.slice(0, 80)}`,
        description: `پیشنهاد عامل ${titlePrefix}`,
      },
      requiresConfirmation: true,
    },
  ];
}

export function listDepartmentAgents() {
  return (Object.keys(DEPARTMENT_PROMPTS) as AgentTypeName[]).map((type) => ({
    type,
    name: DEPARTMENT_PROMPTS[type].name,
    focus: DEPARTMENT_PROMPTS[type].focus,
    tools: DEPARTMENT_TOOLS[type]?.map((t) => t.name) ?? [],
  }));
}
