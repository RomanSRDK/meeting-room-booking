import { formatInUserTimeZone } from "@/lib/date-time";

import styles from "./Schedule.module.css";

type ScheduleTimeScaleProps = {
  timeLabels: Date[];
  scheduleHeight: number;
  slotHeight: number;
  userTimeZone: string;
};

export function ScheduleTimeScale({
  timeLabels,
  scheduleHeight,
  slotHeight,
  userTimeZone,
}: ScheduleTimeScaleProps) {
  return (
    <div
      className={styles.timeScale}
      style={{
        height: scheduleHeight,
      }}
    >
      {timeLabels.map((timeLabel, labelIndex) => (
        <span
          className={styles.timeLabel}
          key={timeLabel.toISOString()}
          style={{
            top: labelIndex * slotHeight,
          }}
        >
          {formatInUserTimeZone(timeLabel, "HH:mm", userTimeZone)}
        </span>
      ))}
    </div>
  );
}
