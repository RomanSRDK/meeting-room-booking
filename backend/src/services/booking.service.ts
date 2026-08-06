import createHttpError from "http-errors";

import { Prisma } from "../../generated/prisma/client.ts";
import { prisma } from "../lib/prisma.ts";
import type {
  CreateBookingInput,
  GetMyBookingsInput,
  UpdateBookingTitleInput,
} from "../types/booking.types.ts";

const MAX_TRANSACTION_RETRIES = 3;

type GetBookingsInput = {
  start: Date;
  end: Date;
};

export async function getBookingsService({ start, end }: GetBookingsInput) {
  return prisma.booking.findMany({
    where: {
      startsAt: {
        lt: end,
      },
      endsAt: {
        gt: start,
      },
    },
    select: {
      id: true,
      title: true,
      startsAt: true,
      endsAt: true,
      roomId: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      startsAt: "asc",
    },
  });
}

export async function createBookingService({
  title,
  roomId,
  userId,
  startsAt,
  endsAt,
}: CreateBookingInput) {
  const room = await prisma.room.findUnique({
    where: {
      id: roomId,
    },
    select: {
      id: true,
    },
  });

  if (!room) {
    throw createHttpError(404, "Room not found");
  }

  for (let attempt = 1; attempt <= MAX_TRANSACTION_RETRIES; attempt += 1) {
    try {
      return await prisma.$transaction(
        async (transaction) => {
          const conflictingBooking = await transaction.booking.findFirst({
            where: {
              roomId,
              startsAt: {
                lt: endsAt,
              },
              endsAt: {
                gt: startsAt,
              },
            },
            select: {
              id: true,
            },
          });

          if (conflictingBooking) {
            throw createHttpError(
              409,
              "Room is already booked for the selected time",
            );
          }

          return transaction.booking.create({
            data: {
              title,
              roomId,
              userId,
              startsAt,
              endsAt,
            },
            select: {
              id: true,
              title: true,
              startsAt: true,
              endsAt: true,
              room: {
                select: {
                  id: true,
                  name: true,
                  floor: true,
                  capacity: true,
                },
              },
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              createdAt: true,
            },
          });
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );
    } catch (error: unknown) {
      const isTransactionConflict =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034";

      if (!isTransactionConflict) {
        throw error;
      }

      if (attempt === MAX_TRANSACTION_RETRIES) {
        throw createHttpError(
          409,
          "Booking conflict occurred. Please try again",
        );
      }
    }
  }

  throw createHttpError(409, "Booking conflict occurred. Please try again");
}

export async function getMyBookingsService({
  userId,
  status,
  page,
  limit,
}: GetMyBookingsInput) {
  const now = new Date();

  const where =
    status === "upcoming"
      ? {
          userId,
          endsAt: {
            gt: now,
          },
        }
      : {
          userId,
          endsAt: {
            lte: now,
          },
        };

  const orderBy =
    status === "upcoming"
      ? {
          startsAt: "asc" as const,
        }
      : {
          startsAt: "desc" as const,
        };

  const skip = (page - 1) * limit;

  const [items, totalItems] = await prisma.$transaction([
    prisma.booking.findMany({
      where,
      select: {
        id: true,
        title: true,
        startsAt: true,
        endsAt: true,
        createdAt: true,
        room: {
          select: {
            id: true,
            name: true,
            floor: true,
            capacity: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),

    prisma.booking.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    items,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
    },
  };
}

export async function deleteBookingService(bookingId: string, userId: string) {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    select: {
      id: true,
      userId: true,
      endsAt: true,
    },
  });

  if (!booking) {
    throw createHttpError(404, "Booking not found");
  }

  if (booking.userId !== userId) {
    throw createHttpError(403, "You are not allowed to delete this booking");
  }

  if (booking.endsAt <= new Date()) {
    throw createHttpError(400, "Completed booking cannot be cancelled");
  }

  return prisma.booking.delete({
    where: {
      id: bookingId,
    },
    select: {
      id: true,
      title: true,
    },
  });
}

export async function updateBookingTitleService({
  bookingId,
  userId,
  title,
}: UpdateBookingTitleInput) {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    select: {
      id: true,
      userId: true,
      endsAt: true,
    },
  });

  if (!booking) {
    throw createHttpError(404, "Booking not found");
  }

  if (booking.userId !== userId) {
    throw createHttpError(403, "You are not allowed to edit this booking");
  }

  if (booking.endsAt <= new Date()) {
    throw createHttpError(400, "Completed booking cannot be edited");
  }

  return prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      title,
    },
    select: {
      id: true,
      title: true,
      startsAt: true,
      endsAt: true,
      roomId: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}
