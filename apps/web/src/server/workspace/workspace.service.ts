import { prisma } from '@/lib/prisma';

export interface WorkspaceOption {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  role: string;
  industryPack: string;
  industrySpecialty: string | null;
  workspaceId: string;
  isDemo: boolean;
}

export async function listUserWorkspaces(userId: string): Promise<WorkspaceOption[]> {
  const memberships = await prisma.membership.findMany({
    where: { userId, isActive: true },
    include: {
      organization: {
        include: {
          workspaces: { where: { isDefault: true }, take: 1 },
        },
      },
    },
    orderBy: { joinedAt: 'asc' },
  });

  const options: WorkspaceOption[] = [];

  for (const membership of memberships) {
    const workspace =
      membership.organization.workspaces[0] ??
      (await prisma.workspace.findFirst({
        where: { organizationId: membership.organizationId },
      }));

    if (!workspace) continue;

    options.push({
      organizationId: membership.organizationId,
      organizationName: membership.organization.name,
      organizationSlug: membership.organization.slug,
      role: membership.role,
      industryPack: membership.organization.industryPack,
      industrySpecialty: membership.organization.industrySpecialty,
      workspaceId: workspace.id,
      isDemo: membership.organization.isDemo,
    });
  }

  return options;
}

export async function resolveMembership(
  userId: string,
  organizationId: string,
) {
  return prisma.membership.findFirst({
    where: { userId, organizationId, isActive: true },
    include: {
      organization: {
        include: {
          workspaces: { where: { isDefault: true }, take: 1 },
        },
      },
    },
  });
}
