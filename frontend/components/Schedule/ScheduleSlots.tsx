import { addMinutes } from "date-fns";
import type { Booking } from "@/types/booking";
import {
  formatInUserTimeZone,
  getOfficeSlotStart,
  SLOT_DURATION_MINUTES,
  WEEK_DAYS_COUNT,
} from "@/lib/date-time";
import styles from "./Schedule.module.css";

type ScheduleSlotsProps = {
  weekDays: Date[];
  slotsCount: number;
  bookings: Booking[];
  now: Date;
  userTimeZone: string;
  onSlotClick: (slotStart: Date) => void;
};

export function ScheduleSlots({
  weekDays,
  slotsCount,
  bookings,
  now,
  userTimeZone,
  onSlotClick,
}: ScheduleSlotsProps) {
  return Array.from(
    {
      length: WEEK_DAYS_COUNT * slotsCount,
    },
    (_, cellIndex) => {
      const dayIndex = cellIndex % WEEK_DAYS_COUNT;

      const slotIndex = Math.floor(cellIndex / WEEK_DAYS_COUNT);

      const officeDay = weekDays[dayIndex];

      const slotStart = getOfficeSlotStart(officeDay, slotIndex);

      const slotEnd = addMinutes(slotStart, SLOT_DURATION_MINUTES);

      const isOccupied = bookings.some((booking) => {
        const bookingStart = new Date(booking.startsAt);
        const bookingEnd = new Date(booking.endsAt);

        return bookingStart < slotEnd && bookingEnd > slotStart;
      });

      const isPast = slotStart < now;

      const isDisabled = isOccupied || isPast;

      return (
        <button
          className={`${styles.slot} ${
            isOccupied ? styles.occupiedSlot : ""
          } ${isPast ? styles.pastSlot : ""}`}
          disabled={isDisabled}
          key={`${dayIndex}-${slotIndex}`}
          type="button"
          aria-label={`Book ${formatInUserTimeZone(
            slotStart,
            "dd.MM.yyyy HH:mm",
            userTimeZone,
          )}`}
          onClick={() => onSlotClick(slotStart)}
        />
      );
    },
  );
}
