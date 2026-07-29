import "dotenv/config";
import bcrypt from "bcrypt";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

(async function () {
  const rooms = [
    {
      name: "Акваріум",
      floor: 2,
      capacity: 6,
    },
    {
      name: "Марс",
      floor: 3,
      capacity: 8,
    },
    {
      name: "Гагарін",
      floor: 4,
      capacity: 10,
    },
    {
      name: "Юпітер",
      floor: 2,
      capacity: 4,
    },
    {
      name: "Космос",
      floor: 5,
      capacity: 12,
    },
    {
      name: "Сатурн",
      floor: 3,
      capacity: 6,
    },
  ];

  const seededRooms = [];

  for (const room of rooms) {
    const seededRoom = await prisma.room.upsert({
      where: {
        name: room.name,
      },
      update: {
        floor: room.floor,
        capacity: room.capacity,
      },
      create: room,
    });

    seededRooms.push(seededRoom);
  }

  console.log("Rooms seeded successfully");

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

  console.log({
    firstUserId: firstUser.id,
    secondUserId: secondUser.id,
  });

  console.log("Users seeded successfully");
})()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
