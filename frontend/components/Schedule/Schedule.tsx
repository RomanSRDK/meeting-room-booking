"use client";

import type { CSSProperties } from "react";
import { useUserTimeZone } from "@/hooks/useUserTimeZone";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  addMinutes,
  differenceInCalendarDays,
  differenceInMinutes,
} from "date-fns";
import {
  getNextOfficeWeek,
  getOfficeWeekDays,
  getOfficeWeekEnd,
  getOfficeWeekStart,
  getOfficeWorkdayEnd,
  getOfficeWorkdayStart,
  getPreviousOfficeWeek,
  getSlotsCount,
  isOfficeTimeZone,
  SLOT_DURATION_MINUTES,
  toOfficeDate,
  WEEK_DAYS_COUNT,
} from "@/lib/date-time";
import { ScheduleToolbar } from "./ScheduleToolbar";
import { ScheduleDaysHeader } from "./ScheduleDaysHeader";
import { ScheduleTimeScale } from "./ScheduleTimeScale";
import { ScheduleBooking } from "./ScheduleBooking";
import { ScheduleTimeZoneNotice } from "./ScheduleTimeZoneNotice";
import { ScheduleSlots } from "./ScheduleSlots";
import { currentUserQueryOptions } from "@/queries/auth-queries";
import { bookingsQueryOptions } from "@/queries/booking-queries";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  openBookingDetailsModal,
  openBookingModal,
} from "@/store/slices/schedule-slice";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import styles from "./Schedule.module.css";

const SLOT_HEIGHT_PX = 32;

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
  const now = useCurrentTime();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedRoomId = useAppSelector(
    (state) => state.schedule.selectedRoomId,
  );

  const userTimeZone = useUserTimeZone();

  const weekStart = getInitialWeekStart(searchParams.get("date"));

  const weekEnd = getOfficeWeekEnd(weekStart);

  const start = weekStart.toISOString();
  const end = weekEnd.toISOString();

  const {
    data: bookings,
    isPending: isBookingsPending,
    isError: isBookingsError,
    isPlaceholderData,
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

  return (
    <section className={styles.schedule}>
      <ScheduleToolbar
        weekStart={weekStart}
        onPreviousWeek={handlePreviousWeek}
        onCurrentWeek={handleCurrentWeek}
        onNextWeek={handleNextWeek}
      />

      <ScheduleTimeZoneNotice userTimeZone={userTimeZone} now={now} />

      <div
        className={`${styles.scheduleWrapper} ${
          isPlaceholderData ? styles.scheduleUpdating : ""
        }`}
      >
        <div className={styles.scheduleContent}>
          <ScheduleDaysHeader
            weekDays={weekDays}
            officeNow={officeNow}
            userTimeZone={userTimeZone}
            userUsesOfficeTimeZone={userUsesOfficeTimeZone}
          />

          <div className={styles.scheduleBody}>
            <ScheduleTimeScale
              timeLabels={timeLabels}
              scheduleHeight={scheduleHeight}
              slotHeight={SLOT_HEIGHT_PX}
              userTimeZone={userTimeZone}
            />

            <div
              className={styles.daysGrid}
              style={{
                ...gridStyle,
                height: scheduleHeight,
              }}
            >
              <ScheduleSlots
                weekDays={weekDays}
                slotsCount={slotsCount}
                bookings={roomBookings}
                now={now}
                userTimeZone={userTimeZone}
                onSlotClick={handleSlotClick}
              />

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

              {visibleRoomBookings.map((booking) => (
                <ScheduleBooking
                  key={booking.id}
                  booking={booking}
                  weekStart={weekStart}
                  now={now}
                  currentUserId={currentUser?.id}
                  userTimeZone={userTimeZone}
                  slotHeight={SLOT_HEIGHT_PX}
                  onOpen={(selectedBooking) => {
                    dispatch(openBookingDetailsModal(selectedBooking));
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
