import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { createUser, findUserPublicById, listUsersForAdmin, updateUser } from "@/server/repositories/admin-user-repository";

export async function listUsersUseCase() {
  return listUsersForAdmin();
}

export async function getUserByIdUseCase(id: string) {
  return findUserPublicById(id);
}

export async function createUserUseCase(input: {
  email: string;
  password: string;
  role: "admin" | "user";
  isActive?: boolean;
}) {
  const passwordHash = await bcrypt.hash(input.password, 12);

  try {
    return await createUser({
      email: input.email,
      passwordHash,
      role: input.role,
      isActive: input.isActive,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("Email already exists");
    }
    throw error;
  }
}

export async function updateUserUseCase(
  id: string,
  input: {
    email?: string;
    password?: string;
    role?: "admin" | "user";
    isActive?: boolean;
  },
) {
  const data: {
    email?: string;
    passwordHash?: string;
    role?: "admin" | "user";
    isActive?: boolean;
  } = {};

  if (input.email !== undefined) data.email = input.email;
  if (input.role !== undefined) data.role = input.role;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  if (input.password !== undefined) data.passwordHash = await bcrypt.hash(input.password, 12);

  try {
    return await updateUser(id, data);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("Email already exists");
    }
    throw error;
  }
}
