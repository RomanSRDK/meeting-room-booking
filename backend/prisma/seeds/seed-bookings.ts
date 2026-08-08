import { addDays, set } from "date-fns";
import { TZDate } from "@date-fns/tz";

import type {
  PrismaClient,
  Room,
  User,
} from "../../generated/prisma/client.ts";

type SeedBookingsParams = {
  prisma: PrismaClient;
  rooms: Room[];
  firstUser: User;
  secondUser: User;
};

export async function seedBookings({
  prisma,
  rooms,
  firstUser,
  secondUser,
}: SeedBookingsParams) {
  const timeZone = "Europe/Kyiv";

  const nowInKyiv = new TZDate(new Date(), timeZone);

  const mondayInKyiv = addDays(nowInKyiv, -((nowInKyiv.getDay() + 6) % 7));

  function createBookingDate(
    dayOffset: number,
    hours: number,
    minutes = 0,
  ): Date {
    const day = addDays(mondayInKyiv, dayOffset);

    return set(day, {
      hours,
      minutes,
      seconds: 0,
      milliseconds: 0,
    });
  }

  const firstRoom = rooms[0];
  const secondRoom = rooms[1];
  const thirdRoom = rooms[2];

  if (!firstRoom || !secondRoom || !thirdRoom) {
    throw new Error("At least 3 rooms are required to seed demo bookings");
  }

  await prisma.booking.deleteMany({
    where: {
      title: {
        in: ["Daily Standup", "Frontend Planning", "Product Discussion"],
      },
      userId: {
        in: [firstUser.id, secondUser.id],
      },
    },
  });

  await prisma.booking.createMany({
    data: [
      {
        title: "Daily Standup",
        startsAt: createBookingDate(0, 10),
        endsAt: createBookingDate(0, 10, 30),
        userId: firstUser.id,
        roomId: firstRoom.id,
      },
      {
        title: "Frontend Planning",
        startsAt: createBookingDate(2, 14, 30),
        endsAt: createBookingDate(2, 15, 30),
        userId: secondUser.id,
        roomId: secondRoom.id,
      },
      {
        title: "Product Discussion",
        startsAt: createBookingDate(4, 12),
        endsAt: createBookingDate(4, 13),
        userId: firstUser.id,
        roomId: thirdRoom.id,
      },
    ],
  });

  console.log("Bookings seeded successfully");
}
