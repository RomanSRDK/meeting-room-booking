import type { PrismaClient } from "../../generated/prisma/client.ts";

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

export async function seedRooms(prisma: PrismaClient) {
  const seededRooms = await Promise.all(
    rooms.map((room) =>
      prisma.room.upsert({
        where: {
          name: room.name,
        },
        update: {
          floor: room.floor,
          capacity: room.capacity,
        },
        create: room,
      }),
    ),
  );

  console.log("Rooms seeded successfully");

  return seededRooms;
}
