import { TZDate } from "@date-fns/tz";
import createHttpError from "http-errors";

export const OFFICE_TIME_ZONE = "Europe/Kyiv";

export const WORKING_DAY_START_HOUR = 9;

export const WORKING_DAY_END_HOUR = 19;

export const SLOT_DURATION_MINUTES = 30;

export const MIN_BOOKING_DURATION_MINUTES = 30;

export const MAX_BOOKING_DURATION_MINUTES = 240;

type ValidateBookingTimeInput = {
  startsAt: Date;
  endsAt: Date;
  now?: Date;
};

export function validateBookingTime({
  startsAt,
  endsAt,
  now = new Date(),
}: ValidateBookingTimeInput): void {
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    throw createHttpError(400, "Invalid booking date");
  }

  if (startsAt >= endsAt) {
    throw createHttpError(
      400,
      "Booking start time must be earlier than end time",
    );
  }

  if (startsAt <= now) {
    throw createHttpError(400, "Booking start time must be in the future");
  }

  const durationMinutes = (endsAt.getTime() - startsAt.getTime()) / 60_000;

  if (durationMinutes < MIN_BOOKING_DURATION_MINUTES) {
    throw createHttpError(400, "Booking duration must be at least 30 minutes");
  }

  if (durationMinutes > MAX_BOOKING_DURATION_MINUTES) {
    throw createHttpError(400, "Booking duration must not exceed 4 hours");
  }

  const officeStartsAt = new TZDate(startsAt.getTime(), OFFICE_TIME_ZONE);

  const officeEndsAt = new TZDate(endsAt.getTime(), OFFICE_TIME_ZONE);

  const startsOnSlotBoundary =
    officeStartsAt.getMinutes() % SLOT_DURATION_MINUTES === 0 &&
    officeStartsAt.getSeconds() === 0 &&
    officeStartsAt.getMilliseconds() === 0;

  if (!startsOnSlotBoundary) {
    throw createHttpError(
      400,
      "Booking start time must be aligned to a 30-minute slot",
    );
  }

  const endsOnSlotBoundary =
    officeEndsAt.getMinutes() % SLOT_DURATION_MINUTES === 0 &&
    officeEndsAt.getSeconds() === 0 &&
    officeEndsAt.getMilliseconds() === 0;

  if (!endsOnSlotBoundary) {
    throw createHttpError(
      400,
      "Booking end time must be aligned to a 30-minute slot",
    );
  }

  const startsAndEndsOnSameOfficeDay =
    officeStartsAt.getFullYear() === officeEndsAt.getFullYear() &&
    officeStartsAt.getMonth() === officeEndsAt.getMonth() &&
    officeStartsAt.getDate() === officeEndsAt.getDate();

  if (!startsAndEndsOnSameOfficeDay) {
    throw createHttpError(
      400,
      "Booking must start and end on the same office day",
    );
  }

  const officeStartMinutes =
    officeStartsAt.getHours() * 60 + officeStartsAt.getMinutes();

  const officeEndMinutes =
    officeEndsAt.getHours() * 60 + officeEndsAt.getMinutes();

  const workdayStartMinutes = WORKING_DAY_START_HOUR * 60;

  const workdayEndMinutes = WORKING_DAY_END_HOUR * 60;

  if (
    officeStartMinutes < workdayStartMinutes ||
    officeEndMinutes > workdayEndMinutes
  ) {
    throw createHttpError(
      400,
      "Booking must be within office working hours from 09:00 to 19:00 Europe/Kyiv",
    );
  }
}
