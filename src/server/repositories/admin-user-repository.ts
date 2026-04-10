import { prisma } from "@/lib/prisma";

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

const userPublicSelect = {
  id: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function listUsersForAdmin() {
  return prisma.user.findMany({
    select: userPublicSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function findUserPublicById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: userPublicSelect,
  });
}

export async function createUser(data: {
  email: string;
  passwordHash: string;
  role: "admin" | "user";
  isActive?: boolean;
}) {
  return prisma.user.create({
    data: {
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role,
      isActive: data.isActive ?? true,
    },
    select: userPublicSelect,
  });
}

export async function updateUser(
  id: string,
  data: {
    email?: string;
    passwordHash?: string;
    role?: "admin" | "user";
    isActive?: boolean;
  },
) {
  return prisma.user.update({
    where: { id },
    data,
    select: userPublicSelect,
  });
}
