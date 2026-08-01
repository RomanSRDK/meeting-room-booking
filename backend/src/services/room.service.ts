import { prisma } from "../lib/prisma.ts";

export async function getRoomsService() {
  return prisma.room.findMany({
    select: {
      id: true,
      name: true,
      floor: true,
      capacity: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}
