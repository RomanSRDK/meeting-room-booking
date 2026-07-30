import "dotenv/config";
import { seedRooms } from "./seeds/seed-rooms.ts";
import { seedUsers } from "./seeds/seed-users.ts";
import { seedBookings } from "./seeds/seed-bookings.ts";
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
  const seededRooms = await seedRooms(prisma);
  const { firstUser, secondUser } = await seedUsers(prisma);
  await seedBookings({
    prisma,
    rooms: seededRooms,
    firstUser,
    secondUser,
  });
})()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
