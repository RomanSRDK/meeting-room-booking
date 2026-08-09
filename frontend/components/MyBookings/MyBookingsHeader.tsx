import { getTimeZoneOffsetLabel, OFFICE_TIME_ZONE } from "@/lib/date-time";

import styles from "./MyBookings.module.css";

type MyBookingsHeaderProps = {
  upcomingBookingsCount: number;
  userTimeZone: string;
  userUsesOfficeTimeZone: boolean;
  now: Date;
};

export function MyBookingsHeader({
  upcomingBookingsCount,
  userTimeZone,
  userUsesOfficeTimeZone,
  now,
}: MyBookingsHeaderProps) {
  const currentUserTimeZoneOffset = getTimeZoneOffsetLabel(userTimeZone, now);

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div>
          <h1 className={styles.title}>My bookings</h1>

          <p className={styles.description}>
            Review your upcoming and previous room bookings.
          </p>

          <p className={styles.timeZoneNotice}>
            Times are shown in <strong>{userTimeZone}</strong> (
            {currentUserTimeZoneOffset}).
            {!userUsesOfficeTimeZone &&
              ` Office time is also displayed in ${OFFICE_TIME_ZONE}.`}
          </p>
        </div>
      </div>

      <div className={styles.counter}>
        <strong className={styles.counterValue}>{upcomingBookingsCount}</strong>

        <span className={styles.counterLabel}>Active</span>
      </div>
    </header>
  );
}
