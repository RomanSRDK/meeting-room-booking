"use client";

import { differenceInCalendarDays, differenceInMinutes } from "date-fns";

import {
  formatInUserTimeZone,
  getOfficeWorkdayStart,
  SLOT_DURATION_MINUTES,
  toOfficeDate,
  WEEK_DAYS_COUNT,
} from "@/lib/date-time";

import type { Booking } from "@/types/booking";

import styles from "./Schedule.module.css";

type ScheduleBookingProps = {
  booking: Booking;
  weekStart: Date;
  now: Date;
  currentUserId?: string;
  userTimeZone: string;
  slotHeight: number;
  onOpen: (booking: Booking) => void;
};

export function ScheduleBooking({
  booking,
  weekStart,
  now,
  currentUserId,
  userTimeZone,
  slotHeight,
  onOpen,
}: ScheduleBookingProps) {
  const bookingStart = new Date(booking.startsAt);
  const bookingEnd = new Date(booking.endsAt);

  const bookingOfficeDate = toOfficeDate(bookingStart);

  const bookingDayIndex = differenceInCalendarDays(
    bookingOfficeDate,
    weekStart,
  );

  const bookingOfficeWorkdayStart = getOfficeWorkdayStart(bookingOfficeDate);

  const minutesFromWorkingDayStart = differenceInMinutes(
    bookingStart,
    bookingOfficeWorkdayStart,
  );

  const durationMinutes = differenceInMinutes(bookingEnd, bookingStart);

  const isCompactBooking = durationMinutes === SLOT_DURATION_MINUTES;

  const top = (minutesFromWorkingDayStart / SLOT_DURATION_MINUTES) * slotHeight;

  const height = (durationMinutes / SLOT_DURATION_MINUTES) * slotHeight;

  const left = (bookingDayIndex / WEEK_DAYS_COUNT) * 100;

  const width = 100 / WEEK_DAYS_COUNT;

  const isOwnBooking = booking.user.id === currentUserId;

  const canOpenBooking = isOwnBooking && bookingEnd > now;

  const bookingClassName = `${styles.booking} ${
    isOwnBooking ? styles.ownBooking : styles.otherBooking
  } ${canOpenBooking ? styles.clickableBooking : ""} ${
    isCompactBooking ? styles.compactBooking : ""
  }`;

  const formattedBookingTime = `${formatInUserTimeZone(
    bookingStart,
    "HH:mm",
    userTimeZone,
  )}–${formatInUserTimeZone(bookingEnd, "HH:mm", userTimeZone)}`;

  const bookingAuthor = isOwnBooking ? "You" : booking.user.name;

  const bookingContent = (
    <>
      <strong className={styles.bookingTitle} title={booking.title}>
        {booking.title}
      </strong>

      {isCompactBooking ? (
        <span className={styles.compactBookingDetails}>
          <span>{formattedBookingTime}</span>

          <span aria-hidden="true">·</span>

          <span className={styles.compactBookingAuthor}>{bookingAuthor}</span>
        </span>
      ) : (
        <>
          <span className={styles.bookingTime}>{formattedBookingTime}</span>

          <span className={styles.bookingAuthor}>{bookingAuthor}</span>
        </>
      )}
    </>
  );

  const bookingStyle = {
    top,
    height,
    left: `${left}%`,
    width: `${width}%`,
  };

  if (canOpenBooking) {
    return (
      <button
        className={bookingClassName}
        style={bookingStyle}
        type="button"
        aria-label={`Open booking ${booking.title}`}
        onClick={() => onOpen(booking)}
      >
        {bookingContent}
      </button>
    );
  }

  return (
    <article className={bookingClassName} style={bookingStyle}>
      {bookingContent}
    </article>
  );
}
