import bcrypt from "bcrypt";
import type { PrismaClient } from "../../generated/prisma/client.ts";

export async function seedUsers(prisma: PrismaClient) {
  const [firstUserPasswordHash, secondUserPasswordHash] = await Promise.all([
    bcrypt.hash("password123", 10),
    bcrypt.hash("password456", 10),
  ]);

  const [firstUser, secondUser] = await Promise.all([
    prisma.user.upsert({
      where: {
        email: "roman@example.com",
      },
      update: {
        name: "Roman",
        passwordHash: firstUserPasswordHash,
      },
      create: {
        name: "Roman",
        email: "roman@example.com",
        passwordHash: firstUserPasswordHash,
      },
    }),

    prisma.user.upsert({
      where: {
        email: "anna@example.com",
      },
      update: {
        name: "Anna",
        passwordHash: secondUserPasswordHash,
      },
      create: {
        name: "Anna",
        email: "anna@example.com",
        passwordHash: secondUserPasswordHash,
      },
    }),
  ]);

  console.log("Users seeded successfully");

  return {
    firstUser,
    secondUser,
  };
}
