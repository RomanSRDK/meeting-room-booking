import { differenceInCalendarDays } from "date-fns";

import {
  formatInOfficeTimeZone,
  formatInUserTimeZone,
  getOfficeWorkdayEnd,
  getOfficeWorkdayStart,
} from "@/lib/date-time";

import styles from "./Schedule.module.css";

type ScheduleDaysHeaderProps = {
  weekDays: Date[];
  officeNow: Date;
  userTimeZone: string;
  userUsesOfficeTimeZone: boolean;
};

export function ScheduleDaysHeader({
  weekDays,
  officeNow,
  userTimeZone,
  userUsesOfficeTimeZone,
}: ScheduleDaysHeaderProps) {
  return (
    <div className={styles.daysHeader}>
      <div className={styles.headerCorner} />

      {weekDays.map((officeDay) => {
        const officeWorkdayStart = getOfficeWorkdayStart(officeDay);
        const officeWorkdayEnd = getOfficeWorkdayEnd(officeDay);

        const isToday = differenceInCalendarDays(officeDay, officeNow) === 0;

        const officeDateKey = formatInOfficeTimeZone(officeDay, "yyyy-MM-dd");

        const localStartDateKey = formatInUserTimeZone(
          officeWorkdayStart,
          "yyyy-MM-dd",
          userTimeZone,
        );

        const localEndDateKey = formatInUserTimeZone(
          officeWorkdayEnd,
          "yyyy-MM-dd",
          userTimeZone,
        );

        const shouldShowLocalRange =
          !userUsesOfficeTimeZone &&
          (localStartDateKey !== officeDateKey ||
            localEndDateKey !== officeDateKey);

        return (
          <div
            className={`${styles.dayHeader} ${
              isToday ? styles.todayHeader : ""
            }`}
            key={officeDay.toISOString()}
          >
            <div className={styles.officeDay}>
              <span className={styles.dayName}>
                {formatInOfficeTimeZone(officeDay, "EEE")}
              </span>

              <span className={styles.dayDate}>
                {formatInOfficeTimeZone(officeDay, "dd.MM")}
              </span>
            </div>

            {shouldShowLocalRange && (
              <span className={styles.localTimeRange}>
                {formatInUserTimeZone(
                  officeWorkdayStart,
                  "EEE dd.MM, HH:mm",
                  userTimeZone,
                )}
                {" – "}
                {formatInUserTimeZone(
                  officeWorkdayEnd,
                  "EEE dd.MM, HH:mm",
                  userTimeZone,
                )}
                {" local"}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
