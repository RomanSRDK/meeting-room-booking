import { addDays } from "date-fns";
import { formatInOfficeTimeZone, WEEK_DAYS_COUNT } from "@/lib/date-time";
import styles from "./Schedule.module.css";

type ScheduleToolbarProps = {
  weekStart: Date;
  onPreviousWeek: () => void;
  onCurrentWeek: () => void;
  onNextWeek: () => void;
};

export function ScheduleToolbar({
  weekStart,
  onPreviousWeek,
  onCurrentWeek,
  onNextWeek,
}: ScheduleToolbarProps) {
  return (
    <header className={styles.toolbar}>
      <div className={styles.navigation}>
        <button
          className={styles.button}
          type="button"
          onClick={onPreviousWeek}
        >
          Previous
        </button>

        <button className={styles.button} type="button" onClick={onCurrentWeek}>
          This Week
        </button>

        <button className={styles.button} type="button" onClick={onNextWeek}>
          Next
        </button>
      </div>

      <h2 className={styles.title}>
        {formatInOfficeTimeZone(weekStart, "dd.MM.yyyy")} –{" "}
        {formatInOfficeTimeZone(
          addDays(weekStart, WEEK_DAYS_COUNT - 1),
          "dd.MM.yyyy",
        )}
      </h2>
    </header>
  );
}
