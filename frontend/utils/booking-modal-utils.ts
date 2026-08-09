import { addMinutes } from "date-fns";
import type { Booking } from "@/types/booking";

type GetAvailableBookingDurationsParams = {
  durations: number[];
  startsAt: Date;
  workingDayEnd: Date;
  roomId: string;
  bookings: Booking[];
};

export function getAvailableBookingDurations({
  durations,
  startsAt,
  workingDayEnd,
  roomId,
  bookings,
}: GetAvailableBookingDurationsParams) {
  return durations.filter((duration) => {
    const candidateEnd = addMinutes(startsAt, duration);

    if (candidateEnd > workingDayEnd) {
      return false;
    }

    const hasConflict = bookings.some((booking) => {
      if (booking.roomId !== roomId) {
        return false;
      }

      const existingStart = new Date(booking.startsAt);
      const existingEnd = new Date(booking.endsAt);

      return existingStart < candidateEnd && existingEnd > startsAt;
    });

    return !hasConflict;
  });
}
