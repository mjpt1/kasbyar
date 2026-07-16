import type {
  Customer,
  Invoice,
  Lead,
  Organization,
  PipelineStage,
  Product,
  Service,
  User,
  Workspace,
} from '@prisma/client';

export interface SeedUsers {
  superAdmin: User;
  owner: User;
  manager: User;
  staff: User;
}

export interface OrgSeedContext {
  organization: Organization;
  workspace: Workspace;
  users: SeedUsers;
  stages: PipelineStage[];
  customers: Customer[];
  products: Product[];
  services: Service[];
  leads: Lead[];
  invoices: Invoice[];
}

export interface SeedSummary {
  organizations: number;
  users: number;
  customers: number;
  leads: number;
  invoices: number;
  payments: number;
  tasks: number;
  reminders: number;
  activities: number;
}
