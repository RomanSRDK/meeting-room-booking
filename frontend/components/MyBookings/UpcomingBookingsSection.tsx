"use client";

import type { MyBooking } from "@/types/booking";
import { MyBookingCard } from "./MyBookingCard";
import styles from "./MyBookings.module.css";

type UpcomingBookingsSectionProps = {
  bookings: MyBooking[];
  now: Date;
  userTimeZone: string;
  userUsesOfficeTimeZone: boolean;
  isDeletePending: boolean;
  deletingBookingId?: string;
  onCancel: (bookingId: string, bookingTitle: string) => void;
};

export function UpcomingBookingsSection({
  bookings,
  now,
  userTimeZone,
  userUsesOfficeTimeZone,
  isDeletePending,
  deletingBookingId,
  onCancel,
}: UpcomingBookingsSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Current and upcoming bookings</h2>

        <span className={styles.sectionCount}>{bookings.length}</span>
      </div>

      {bookings.length === 0 ? (
        <div className={styles.emptyState}>
          <h3 className={styles.emptyTitle}>No current or upcoming bookings</h3>

          <p className={styles.emptyDescription}>
            Your current and future room bookings will appear here.
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {bookings.map((booking) => {
            const startsAt = new Date(booking.startsAt);
            const endsAt = new Date(booking.endsAt);

            const isOngoing = startsAt <= now && endsAt > now;

            return (
              <MyBookingCard
                key={booking.id}
                booking={booking}
                userTimeZone={userTimeZone}
                isOngoing={isOngoing}
                isDeleting={deletingBookingId === booking.id}
                isDeletePending={isDeletePending}
                showOfficeTime={!userUsesOfficeTimeZone}
                onCancel={() => {
                  onCancel(booking.id, booking.title);
                }}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
