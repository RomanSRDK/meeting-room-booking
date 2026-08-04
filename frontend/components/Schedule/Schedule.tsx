"use client";

import { useState, type CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  addDays,
  addMinutes,
  addWeeks,
  differenceInCalendarDays,
  differenceInMinutes,
  format,
  startOfDay,
  startOfWeek,
  subWeeks,
} from "date-fns";

import { bookingsQueryOptions } from "@/queries/booking-queries";
import { useAppSelector } from "@/store/hooks";

import styles from "./Schedule.module.css";

const WORKING_DAY_START_HOUR = 9;
const WORKING_DAY_END_HOUR = 19;
const SLOT_DURATION_MINUTES = 30;
const SLOT_HEIGHT_PX = 32;
const WEEK_DAYS_COUNT = 7;

export function Schedule() {
  const selectedRoomId = useAppSelector(
    (state) => state.schedule.selectedRoomId,
  );

  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), {
      weekStartsOn: 1,
    }),
  );

  const weekEnd = addDays(weekStart, WEEK_DAYS_COUNT);

  const start = weekStart.toISOString();
  const end = weekEnd.toISOString();

  const {
    data: bookings,
    isPending,
    isError,
  } = useQuery(
    bookingsQueryOptions({
      start,
      end,
    }),
  );

  function handlePreviousWeek() {
    setWeekStart((currentWeekStart) => subWeeks(currentWeekStart, 1));
  }

  function handleCurrentWeek() {
    setWeekStart(
      startOfWeek(new Date(), {
        weekStartsOn: 1,
      }),
    );
  }

  function handleNextWeek() {
    setWeekStart((currentWeekStart) => addWeeks(currentWeekStart, 1));
  }

  if (!selectedRoomId) {
    return <p className={styles.state}>Select a room to view its schedule</p>;
  }

  if (isPending) {
    return <p className={styles.state}>Loading bookings...</p>;
  }

  if (isError) {
    return <p className={styles.state}>Failed to load bookings</p>;
  }

  const weekDays = Array.from({ length: WEEK_DAYS_COUNT }, (_, dayIndex) =>
    addDays(weekStart, dayIndex),
  );

  const slotsCount =
    ((WORKING_DAY_END_HOUR - WORKING_DAY_START_HOUR) * 60) /
    SLOT_DURATION_MINUTES;

  const scheduleHeight = slotsCount * SLOT_HEIGHT_PX;

  const timeScaleStart = startOfDay(new Date());

  timeScaleStart.setHours(WORKING_DAY_START_HOUR, 0, 0, 0);

  /*
   * Здесь создаём 21 отметку времени:
   *
   * 09:00
   * 09:30
   * ...
   * 18:30
   * 19:00
   *
   * При этом рабочих интервалов остаётся ровно 20.
   */
  const timeLabels = Array.from({ length: slotsCount + 1 }, (_, labelIndex) =>
    addMinutes(timeScaleStart, labelIndex * SLOT_DURATION_MINUTES),
  );

  const roomBookings = bookings.filter(
    (booking) => booking.roomId === selectedRoomId,
  );

  const visibleRoomBookings = roomBookings.filter((booking) => {
    const bookingStart = new Date(booking.startsAt);
    const bookingEnd = new Date(booking.endsAt);

    const bookingDayIndex = differenceInCalendarDays(
      startOfDay(bookingStart),
      startOfDay(weekStart),
    );

    const bookingStartMinutes =
      bookingStart.getHours() * 60 + bookingStart.getMinutes();

    const bookingEndMinutes =
      bookingEnd.getHours() * 60 + bookingEnd.getMinutes();

    const workingDayStartMinutes = WORKING_DAY_START_HOUR * 60;

    const workingDayEndMinutes = WORKING_DAY_END_HOUR * 60;

    return (
      bookingDayIndex >= 0 &&
      bookingDayIndex < WEEK_DAYS_COUNT &&
      bookingStartMinutes >= workingDayStartMinutes &&
      bookingEndMinutes <= workingDayEndMinutes
    );
  });

  const gridStyle = {
    "--days-count": WEEK_DAYS_COUNT,
    "--slots-count": slotsCount,
    "--slot-height": `${SLOT_HEIGHT_PX}px`,
  } as CSSProperties;

  return (
    <section className={styles.schedule}>
      <header className={styles.toolbar}>
        <div className={styles.navigation}>
          <button
            className={styles.button}
            type="button"
            onClick={handlePreviousWeek}
          >
            Previous
          </button>

          <button
            className={styles.button}
            type="button"
            onClick={handleCurrentWeek}
          >
            This Week
          </button>

          <button
            className={styles.button}
            type="button"
            onClick={handleNextWeek}
          >
            Next
          </button>
        </div>

        <h2 className={styles.title}>
          {format(weekStart, "dd.MM.yyyy")} –{" "}
          {format(addDays(weekStart, WEEK_DAYS_COUNT - 1), "dd.MM.yyyy")}
        </h2>
      </header>

      <div className={styles.scheduleWrapper}>
        <div className={styles.scheduleContent}>
          <div className={styles.daysHeader}>
            <div className={styles.headerCorner} />

            {weekDays.map((day) => (
              <div className={styles.dayHeader} key={day.toISOString()}>
                <span className={styles.dayName}>{format(day, "EEE")}</span>

                <span className={styles.dayDate}>{format(day, "dd.MM")}</span>
              </div>
            ))}
          </div>

          <div className={styles.scheduleBody}>
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
                    top: labelIndex * SLOT_HEIGHT_PX,
                  }}
                >
                  {format(timeLabel, "HH:mm")}
                </span>
              ))}
            </div>

            <div
              className={styles.daysGrid}
              style={{
                ...gridStyle,
                height: scheduleHeight,
              }}
            >
              {Array.from(
                {
                  length: WEEK_DAYS_COUNT * slotsCount,
                },
                (_, cellIndex) => {
                  const dayIndex = cellIndex % WEEK_DAYS_COUNT;

                  const slotIndex = Math.floor(cellIndex / WEEK_DAYS_COUNT);

                  return (
                    <div
                      className={styles.slot}
                      key={`${dayIndex}-${slotIndex}`}
                    />
                  );
                },
              )}

              {visibleRoomBookings.map((booking) => {
                const bookingStart = new Date(booking.startsAt);

                const bookingEnd = new Date(booking.endsAt);

                const dayIndex = differenceInCalendarDays(
                  startOfDay(bookingStart),
                  startOfDay(weekStart),
                );

                const bookingWorkingDayStart = new Date(bookingStart);

                bookingWorkingDayStart.setHours(
                  WORKING_DAY_START_HOUR,
                  0,
                  0,
                  0,
                );

                const minutesFromWorkingDayStart = differenceInMinutes(
                  bookingStart,
                  bookingWorkingDayStart,
                );

                const durationMinutes = differenceInMinutes(
                  bookingEnd,
                  bookingStart,
                );

                const top =
                  (minutesFromWorkingDayStart / SLOT_DURATION_MINUTES) *
                  SLOT_HEIGHT_PX;

                const height =
                  (durationMinutes / SLOT_DURATION_MINUTES) * SLOT_HEIGHT_PX;

                const left = (dayIndex / WEEK_DAYS_COUNT) * 100;

                const width = 100 / WEEK_DAYS_COUNT;

                return (
                  <article
                    className={styles.booking}
                    key={booking.id}
                    style={{
                      top,
                      height,
                      left: `${left}%`,
                      width: `${width}%`,
                    }}
                  >
                    <strong className={styles.bookingTitle}>
                      {booking.title}
                    </strong>

                    <span className={styles.bookingTime}>
                      {format(bookingStart, "HH:mm")}–
                      {format(bookingEnd, "HH:mm")}
                    </span>

                    <span className={styles.bookingAuthor}>
                      {booking.user.name}
                    </span>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
