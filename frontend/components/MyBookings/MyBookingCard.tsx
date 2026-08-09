"use client";

import Link from "next/link";
import { MyBooking } from "@/types/booking";
import {
  formatInOfficeTimeZone,
  formatInUserTimeZone,
  getTimeZoneOffsetLabel,
  OFFICE_TIME_ZONE,
} from "@/lib/date-time";

import styles from "./MyBookings.module.css";

type MyBookingCardProps = {
  booking: MyBooking;
  userTimeZone: string;
  isPast?: boolean;
  isOngoing?: boolean;
  isDeleting?: boolean;
  isDeletePending?: boolean;
  showOfficeTime: boolean;
  onCancel?: () => void;
};

function getScheduleUrl(roomId: string, startsAt: string): string {
  const searchParams = new URLSearchParams({
    roomId,
    date: startsAt,
  });

  return `/?${searchParams.toString()}`;
}

export function MyBookingCard({
  booking,
  userTimeZone,
  isPast = false,
  isOngoing = false,
  isDeleting = false,
  isDeletePending = false,
  showOfficeTime,
  onCancel,
}: MyBookingCardProps) {
  const startsAt = new Date(booking.startsAt);
  const endsAt = new Date(booking.endsAt);

  const officeTimeZoneOffset = getTimeZoneOffsetLabel(
    OFFICE_TIME_ZONE,
    startsAt,
  );

  return (
    <article className={`${styles.card} ${isPast ? styles.pastCard : ""}`}>
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.bookingTitle}>{booking.title}</h3>

            <p className={styles.roomName}>{booking.room.name}</p>
          </div>

          <span
            className={
              isPast
                ? styles.pastBadge
                : isOngoing
                  ? styles.ongoingBadge
                  : styles.upcomingBadge
            }
          >
            {isPast ? "Previous" : isOngoing ? "Ongoing" : "Upcoming"}
          </span>
        </div>

        <dl className={styles.details}>
          <div className={styles.detail}>
            <dt className={styles.detailLabel}>Your date</dt>

            <dd className={styles.detailValue}>
              {formatInUserTimeZone(startsAt, "dd.MM.yyyy", userTimeZone)}
            </dd>
          </div>

          <div className={styles.detail}>
            <dt className={styles.detailLabel}>Your time</dt>

            <dd className={styles.detailValue}>
              {formatInUserTimeZone(startsAt, "HH:mm", userTimeZone)}
              {" – "}
              {formatInUserTimeZone(endsAt, "HH:mm", userTimeZone)}
            </dd>
          </div>

          <div className={styles.detail}>
            <dt className={styles.detailLabel}>Floor</dt>

            <dd className={styles.detailValue}>{booking.room.floor}</dd>
          </div>

          <div className={styles.detail}>
            <dt className={styles.detailLabel}>Capacity</dt>

            <dd className={styles.detailValue}>
              {booking.room.capacity} people
            </dd>
          </div>
        </dl>

        {showOfficeTime && (
          <div className={styles.officeTime}>
            <span className={styles.officeTimeLabel}>Office time</span>

            <strong className={styles.officeTimeValue}>
              {formatInOfficeTimeZone(startsAt, "dd.MM.yyyy, HH:mm")}
              {" – "}
              {formatInOfficeTimeZone(endsAt, "dd.MM.yyyy, HH:mm")}
            </strong>

            <span className={styles.officeTimeZone}>
              {OFFICE_TIME_ZONE} ({officeTimeZoneOffset})
            </span>
          </div>
        )}
      </div>

      {!isPast && (
        <footer className={styles.cardFooter}>
          <Link
            className={styles.scheduleLink}
            href={getScheduleUrl(booking.room.id, booking.startsAt)}
          >
            View in schedule
          </Link>

          <button
            className={styles.cancelButton}
            type="button"
            disabled={isDeletePending}
            onClick={onCancel}
          >
            {isDeleting ? "Cancelling..." : "Cancel booking"}
          </button>
        </footer>
      )}
    </article>
  );
}
