import {
  getTimeZoneOffsetLabel,
  isOfficeTimeZone,
  OFFICE_TIME_ZONE,
} from "@/lib/date-time";

import styles from "./Schedule.module.css";

type ScheduleTimeZoneNoticeProps = {
  userTimeZone: string;
  now: Date;
};

export function ScheduleTimeZoneNotice({
  userTimeZone,
  now,
}: ScheduleTimeZoneNoticeProps) {
  const userUsesOfficeTimeZone = isOfficeTimeZone(userTimeZone);

  const userTimeZoneOffset = getTimeZoneOffsetLabel(userTimeZone, now);

  const officeTimeZoneOffset = getTimeZoneOffsetLabel(OFFICE_TIME_ZONE, now);

  return (
    <div className={styles.timeZoneNotice}>
      {userUsesOfficeTimeZone ? (
        <p className={styles.timeZoneText}>
          Times are shown in <strong>{OFFICE_TIME_ZONE}</strong> (
          {officeTimeZoneOffset}).
        </p>
      ) : (
        <>
          <p className={styles.timeZoneText}>
            Schedule times are shown in your time zone:{" "}
            <strong>{userTimeZone}</strong> ({userTimeZoneOffset}).
          </p>

          <p className={styles.timeZoneSecondary}>
            Each column represents an office working day: 09:00–19:00 in{" "}
            {OFFICE_TIME_ZONE} ({officeTimeZoneOffset}). A working day may cross
            midnight in your local time.
          </p>
        </>
      )}
    </div>
  );
}
