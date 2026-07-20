export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export interface SessionContext {
  user: SessionUser;
  organizationId: string;
  organizationName: string;
  role: string;
  workspaceId: string;
  industryPack: string;
  industrySpecialty: string | null;
  platformRole: 'USER' | 'SUPER_ADMIN';
  isSuperAdmin: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardStats {
  todaySales: number;
  openInvoices: number;
  overdueReceivables: number;
  activeLeads: number;
  pendingTasks: number;
  newCustomersThisMonth: number;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export * from './ai';
export * from './memory';
export * from './agents';
export * from './briefing';
