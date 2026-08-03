import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import type { RegisterUserInput, LoginUserInput } from "../types/auth.types.ts";
import { Prisma } from "../../generated/prisma/client.ts";
import { prisma } from "../lib/prisma.ts";

export async function registerUserService({
  name,
  email,
  password,
}: RegisterUserInput) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw createHttpError(409, "Email is already in use");
  }

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await bcrypt.hash(password, 10),
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return user;
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw createHttpError(409, "Email is already in use");
      }
    }

    throw error;
  }
}

export async function loginUserService({ email, password }: LoginUserInput) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw createHttpError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw createHttpError(401, "Invalid email or password");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

export async function getCurrentUserService(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw createHttpError(401, "User no longer exists");
  }

  return user;
}
