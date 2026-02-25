import { OrganizationRole } from "@prisma/client";
import { prisma } from "../prisma";

export async function createOrganization(userId: number, name: string) {
  return prisma.organization.create({
    data: {
      name,
      users: {
        create: {
          userId,
          role: OrganizationRole.OWNER,
        },
      },
    },
  });
}

export async function listUserOrganizations(userId: number) {
  return prisma.organization.findMany({
    where: {
      users: {
        some: {
          userId,
        },
      },
    },
  });
}
