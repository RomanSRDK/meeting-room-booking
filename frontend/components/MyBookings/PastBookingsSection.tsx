"use client";

import type { MyBooking } from "@/types/booking";
import { MyBookingCard } from "./MyBookingCard";
import styles from "./MyBookings.module.css";

type PastBookingsSectionProps = {
  bookings: MyBooking[];
  totalCount: number;
  userTimeZone: string;
  userUsesOfficeTimeZone: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
};

export function PastBookingsSection({
  bookings,
  totalCount,
  userTimeZone,
  userUsesOfficeTimeZone,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: PastBookingsSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Previous bookings</h2>

        <span className={styles.sectionCount}>{totalCount}</span>
      </div>

      {bookings.length === 0 ? (
        <div className={styles.emptyState}>
          <h3 className={styles.emptyTitle}>No previous bookings</h3>

          <p className={styles.emptyDescription}>
            Completed bookings will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.list}>
            {bookings.map((booking) => (
              <MyBookingCard
                key={booking.id}
                booking={booking}
                userTimeZone={userTimeZone}
                isPast
                showOfficeTime={!userUsesOfficeTimeZone}
              />
            ))}
          </div>

          {hasNextPage && (
            <div className={styles.loadMoreWrapper}>
              <button
                className={styles.loadMoreButton}
                type="button"
                disabled={isFetchingNextPage}
                onClick={onLoadMore}
              >
                {isFetchingNextPage ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
