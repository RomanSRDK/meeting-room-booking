"use client";

import { useSyncExternalStore, type CSSProperties } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  addDays,
  addMinutes,
  differenceInCalendarDays,
  differenceInMinutes,
} from "date-fns";
import {
  formatInOfficeTimeZone,
  formatInUserTimeZone,
  getNextOfficeWeek,
  getOfficeSlotStart,
  getOfficeWeekDays,
  getOfficeWeekEnd,
  getOfficeWeekStart,
  getOfficeWorkdayEnd,
  getOfficeWorkdayStart,
  getPreviousOfficeWeek,
  getSlotsCount,
  getTimeZoneOffsetLabel,
  getUserTimeZone,
  isOfficeTimeZone,
  OFFICE_TIME_ZONE,
  SLOT_DURATION_MINUTES,
  toOfficeDate,
  WEEK_DAYS_COUNT,
} from "@/lib/date-time";
import { currentUserQueryOptions } from "@/queries/auth-queries";
import { bookingsQueryOptions } from "@/queries/booking-queries";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  openBookingDetailsModal,
  openBookingModal,
} from "@/store/slices/schedule-slice";
import styles from "./Schedule.module.css";

const SLOT_HEIGHT_PX = 32;

function subscribeToTimeZone() {
  return () => {};
}

function getInitialWeekStart(dateParameter: string | null) {
  if (!dateParameter) {
    return getOfficeWeekStart(new Date());
  }

  const parsedDate = new Date(dateParameter);

  if (Number.isNaN(parsedDate.getTime())) {
    return getOfficeWeekStart(new Date());
  }

  return getOfficeWeekStart(parsedDate);
}

export function Schedule() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedRoomId = useAppSelector(
    (state) => state.schedule.selectedRoomId,
  );

  const userTimeZone = useSyncExternalStore(
    subscribeToTimeZone,
    getUserTimeZone,
    () => OFFICE_TIME_ZONE,
  );

  const weekStart = getInitialWeekStart(searchParams.get("date"));

  const weekEnd = getOfficeWeekEnd(weekStart);

  const start = weekStart.toISOString();
  const end = weekEnd.toISOString();

  const {
    data: bookings,
    isPending: isBookingsPending,
    isError: isBookingsError,
  } = useQuery(
    bookingsQueryOptions({
      start,
      end,
    }),
  );

  const {
    data: currentUser,
    isPending: isCurrentUserPending,
    isError: isCurrentUserError,
  } = useQuery(currentUserQueryOptions);

  function updateWeekInUrl(nextWeekStart: Date) {
    const nextSearchParams = new URLSearchParams(searchParams.toString());

    nextSearchParams.set("date", nextWeekStart.toISOString());

    router.push(`${pathname}?${nextSearchParams.toString()}`);
  }

  function handlePreviousWeek() {
    updateWeekInUrl(getPreviousOfficeWeek(weekStart));
  }

  function handleCurrentWeek() {
    const nextSearchParams = new URLSearchParams(searchParams.toString());

    nextSearchParams.delete("date");

    const queryString = nextSearchParams.toString();

    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }

  function handleNextWeek() {
    updateWeekInUrl(getNextOfficeWeek(weekStart));
  }

  function handleSlotClick(slotStart: Date) {
    if (!selectedRoomId) {
      return;
    }

    const slotEnd = addMinutes(slotStart, SLOT_DURATION_MINUTES);

    dispatch(
      openBookingModal({
        roomId: selectedRoomId,
        startsAt: slotStart.toISOString(),
        endsAt: slotEnd.toISOString(),
      }),
    );
  }

  if (!selectedRoomId) {
    return <p className={styles.state}>Select a room to view its schedule</p>;
  }

  if (isBookingsPending || isCurrentUserPending) {
    return <p className={styles.state}>Loading schedule...</p>;
  }

  if (isBookingsError || isCurrentUserError) {
    return <p className={styles.state}>Failed to load schedule</p>;
  }

  const now = new Date();

  const officeNow = toOfficeDate(now);

  const weekDays = getOfficeWeekDays(weekStart);

  const slotsCount = getSlotsCount();

  const scheduleHeight = slotsCount * SLOT_HEIGHT_PX;

  const firstOfficeWorkdayStart = getOfficeWorkdayStart(weekDays[0]);

  const timeLabels = Array.from(
    {
      length: slotsCount + 1,
    },
    (_, labelIndex) =>
      addMinutes(firstOfficeWorkdayStart, labelIndex * SLOT_DURATION_MINUTES),
  );

  const currentDayIndex = differenceInCalendarDays(officeNow, weekStart);

  const currentOfficeDay =
    currentDayIndex >= 0 && currentDayIndex < WEEK_DAYS_COUNT
      ? weekDays[currentDayIndex]
      : null;

  const currentOfficeWorkdayStart = currentOfficeDay
    ? getOfficeWorkdayStart(currentOfficeDay)
    : null;

  const currentOfficeWorkdayEnd = currentOfficeDay
    ? getOfficeWorkdayEnd(currentOfficeDay)
    : null;

  const isCurrentTimeVisible =
    currentOfficeDay !== null &&
    currentOfficeWorkdayStart !== null &&
    currentOfficeWorkdayEnd !== null &&
    now >= currentOfficeWorkdayStart &&
    now <= currentOfficeWorkdayEnd;

  const currentTimeTop =
    currentOfficeWorkdayStart === null
      ? 0
      : (differenceInMinutes(now, currentOfficeWorkdayStart) /
          SLOT_DURATION_MINUTES) *
        SLOT_HEIGHT_PX;

  const currentDayLeft =
    currentDayIndex < 0 || currentDayIndex >= WEEK_DAYS_COUNT
      ? 0
      : (currentDayIndex / WEEK_DAYS_COUNT) * 100;

  const dayColumnWidth = 100 / WEEK_DAYS_COUNT;

  const roomBookings = bookings.filter(
    (booking) => booking.roomId === selectedRoomId,
  );

  const visibleRoomBookings = roomBookings.filter((booking) => {
    const bookingStart = new Date(booking.startsAt);

    const bookingEnd = new Date(booking.endsAt);

    const bookingOfficeDate = toOfficeDate(bookingStart);

    const bookingDayIndex = differenceInCalendarDays(
      bookingOfficeDate,
      weekStart,
    );

    if (bookingDayIndex < 0 || bookingDayIndex >= WEEK_DAYS_COUNT) {
      return false;
    }

    const bookingOfficeWorkdayStart = getOfficeWorkdayStart(bookingOfficeDate);

    const bookingOfficeWorkdayEnd = getOfficeWorkdayEnd(bookingOfficeDate);

    return (
      bookingStart >= bookingOfficeWorkdayStart &&
      bookingEnd <= bookingOfficeWorkdayEnd
    );
  });

  const gridStyle = {
    "--days-count": WEEK_DAYS_COUNT,
    "--slots-count": slotsCount,
    "--slot-height": `${SLOT_HEIGHT_PX}px`,
  } as CSSProperties;

  const userUsesOfficeTimeZone = isOfficeTimeZone(userTimeZone);

  const userTimeZoneOffset = getTimeZoneOffsetLabel(userTimeZone, now);

  const officeTimeZoneOffset = getTimeZoneOffsetLabel(OFFICE_TIME_ZONE, now);

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
          {formatInOfficeTimeZone(weekStart, "dd.MM.yyyy")} –{" "}
          {formatInOfficeTimeZone(
            addDays(weekStart, WEEK_DAYS_COUNT - 1),
            "dd.MM.yyyy",
          )}
        </h2>
      </header>

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
              {OFFICE_TIME_ZONE} ({officeTimeZoneOffset}). A working day may
              cross midnight in your local time.
            </p>
          </>
        )}
      </div>

      <div className={styles.scheduleWrapper}>
        <div className={styles.scheduleContent}>
          <div className={styles.daysHeader}>
            <div className={styles.headerCorner} />

            {weekDays.map((officeDay) => {
              const officeWorkdayStart = getOfficeWorkdayStart(officeDay);

              const officeWorkdayEnd = getOfficeWorkdayEnd(officeDay);

              const isToday =
                differenceInCalendarDays(officeDay, officeNow) === 0;

              const officeDateKey = formatInOfficeTimeZone(
                officeDay,
                "yyyy-MM-dd",
              );

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
                  {formatInUserTimeZone(timeLabel, "HH:mm", userTimeZone)}
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

                  const officeDay = weekDays[dayIndex];

                  const slotStart = getOfficeSlotStart(officeDay, slotIndex);

                  const slotEnd = addMinutes(slotStart, SLOT_DURATION_MINUTES);

                  const isOccupied = roomBookings.some((booking) => {
                    const bookingStart = new Date(booking.startsAt);

                    const bookingEnd = new Date(booking.endsAt);

                    return bookingStart < slotEnd && bookingEnd > slotStart;
                  });

                  const isPast = slotStart < now;

                  const isDisabled = isOccupied || isPast;

                  return (
                    <button
                      className={`${styles.slot} ${
                        isOccupied ? styles.occupiedSlot : ""
                      } ${isPast ? styles.pastSlot : ""}`}
                      disabled={isDisabled}
                      key={`${dayIndex}-${slotIndex}`}
                      type="button"
                      aria-label={`Book ${formatInUserTimeZone(
                        slotStart,
                        "dd.MM.yyyy HH:mm",
                        userTimeZone,
                      )}`}
                      onClick={() => handleSlotClick(slotStart)}
                    />
                  );
                },
              )}

              {currentDayIndex >= 0 && currentDayIndex < WEEK_DAYS_COUNT && (
                <div
                  className={styles.todayColumn}
                  style={{
                    left: `${currentDayLeft}%`,
                    width: `${dayColumnWidth}%`,
                  }}
                />
              )}

              {isCurrentTimeVisible && (
                <div
                  className={styles.currentTime}
                  style={{
                    top: currentTimeTop,
                    left: `${currentDayLeft}%`,
                    width: `${dayColumnWidth}%`,
                  }}
                >
                  <span className={styles.currentTimeDot} />
                </div>
              )}

              {visibleRoomBookings.map((booking) => {
                const bookingStart = new Date(booking.startsAt);

                const bookingEnd = new Date(booking.endsAt);

                const bookingOfficeDate = toOfficeDate(bookingStart);

                const bookingDayIndex = differenceInCalendarDays(
                  bookingOfficeDate,
                  weekStart,
                );

                const bookingOfficeWorkdayStart =
                  getOfficeWorkdayStart(bookingOfficeDate);

                const minutesFromWorkingDayStart = differenceInMinutes(
                  bookingStart,
                  bookingOfficeWorkdayStart,
                );

                const durationMinutes = differenceInMinutes(
                  bookingEnd,
                  bookingStart,
                );

                const isCompactBooking =
                  durationMinutes === SLOT_DURATION_MINUTES;

                const top =
                  (minutesFromWorkingDayStart / SLOT_DURATION_MINUTES) *
                  SLOT_HEIGHT_PX;

                const height =
                  (durationMinutes / SLOT_DURATION_MINUTES) * SLOT_HEIGHT_PX;

                const left = (bookingDayIndex / WEEK_DAYS_COUNT) * 100;

                const width = 100 / WEEK_DAYS_COUNT;

                const isOwnBooking = booking.user.id === currentUser?.id;

                const canCancelBooking = isOwnBooking && bookingEnd > now;

                const bookingClassName = `${styles.booking} ${
                  isOwnBooking ? styles.ownBooking : styles.otherBooking
                } ${canCancelBooking ? styles.clickableBooking : ""} ${
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
                    <strong
                      className={styles.bookingTitle}
                      title={booking.title}
                    >
                      {booking.title}
                    </strong>

                    {isCompactBooking ? (
                      <span className={styles.compactBookingDetails}>
                        <span>{formattedBookingTime}</span>

                        <span aria-hidden="true">·</span>

                        <span className={styles.compactBookingAuthor}>
                          {bookingAuthor}
                        </span>
                      </span>
                    ) : (
                      <>
                        <span className={styles.bookingTime}>
                          {formattedBookingTime}
                        </span>

                        <span className={styles.bookingAuthor}>
                          {bookingAuthor}
                        </span>
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

                if (canCancelBooking) {
                  return (
                    <button
                      className={bookingClassName}
                      key={booking.id}
                      style={bookingStyle}
                      type="button"
                      aria-label={`Open booking ${booking.title}`}
                      onClick={() => dispatch(openBookingDetailsModal(booking))}
                    >
                      {bookingContent}
                    </button>
                  );
                }

                return (
                  <article
                    className={bookingClassName}
                    key={booking.id}
                    style={bookingStyle}
                  >
                    {bookingContent}
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
