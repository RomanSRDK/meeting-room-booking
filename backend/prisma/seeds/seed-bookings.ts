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

  const demoBookingTitles = [
    "Daily Standup",
    "Frontend Planning",
    "Product Discussion",
  ];

  await prisma.booking.deleteMany({
    where: {
      title: {
        in: demoBookingTitles,
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
        roomId: rooms[0].id,
      },
      {
        title: "Frontend Planning",
        startsAt: createBookingDate(2, 14, 30),
        endsAt: createBookingDate(2, 15, 30),
        userId: secondUser.id,
        roomId: rooms[1].id,
      },
      {
        title: "Product Discussion",
        startsAt: createBookingDate(4, 12),
        endsAt: createBookingDate(4, 13),
        userId: firstUser.id,
        roomId: rooms[2].id,
      },
    ],
  });

  console.log("Bookings seeded successfully");
}
