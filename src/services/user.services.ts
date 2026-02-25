import { prisma } from "../prisma";

export async function getProfile(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found!");
  }

  return user;
}

export async function updateProfile(userId: number, data: any) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });

  return user;
}
