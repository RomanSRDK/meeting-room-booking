import { TZDate } from "@date-fns/tz";
import {
  addDays,
  addMinutes,
  addWeeks,
  format,
  startOfWeek,
  subWeeks,
} from "date-fns";

export const OFFICE_TIME_ZONE = "Europe/Kyiv";

export const WORKING_DAY_START_HOUR = 9;

export const WORKING_DAY_END_HOUR = 19;

export const SLOT_DURATION_MINUTES = 30;

export const MAX_BOOKING_DURATION_MINUTES = 240;

export const WEEK_DAYS_COUNT = 7;

export function getUserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function isOfficeTimeZone(userTimeZone: string): boolean {
  return userTimeZone === OFFICE_TIME_ZONE;
}

export function toZonedDate(
  date: Date | string | number,
  timeZone: string,
): TZDate {
  const timestamp =
    date instanceof Date ? date.getTime() : new Date(date).getTime();

  if (Number.isNaN(timestamp)) {
    throw new Error(`Invalid date value: ${String(date)}`);
  }

  return new TZDate(timestamp, timeZone);
}

export function toOfficeDate(date: Date | string | number): TZDate {
  return toZonedDate(date, OFFICE_TIME_ZONE);
}

export function toUserDate(
  date: Date | string | number,
  userTimeZone: string,
): TZDate {
  return toZonedDate(date, userTimeZone);
}

export function getOfficeWeekStart(
  referenceDate: Date | string | number,
): TZDate {
  const officeDate = toOfficeDate(referenceDate);

  return startOfWeek(officeDate, {
    weekStartsOn: 1,
  });
}

export function getPreviousOfficeWeek(weekStart: Date): TZDate {
  return subWeeks(toOfficeDate(weekStart), 1);
}

export function getNextOfficeWeek(weekStart: Date): TZDate {
  return addWeeks(toOfficeDate(weekStart), 1);
}

export function getOfficeWeekEnd(weekStart: Date): TZDate {
  return addDays(toOfficeDate(weekStart), WEEK_DAYS_COUNT);
}

export function getOfficeWeekDays(weekStart: Date): TZDate[] {
  return Array.from(
    {
      length: WEEK_DAYS_COUNT,
    },
    (_, dayIndex) => addDays(toOfficeDate(weekStart), dayIndex),
  );
}

export function getOfficeWorkdayStart(officeDay: Date): TZDate {
  const zonedDay = toOfficeDate(officeDay);

  return new TZDate(
    zonedDay.getFullYear(),
    zonedDay.getMonth(),
    zonedDay.getDate(),
    WORKING_DAY_START_HOUR,
    0,
    0,
    0,
    OFFICE_TIME_ZONE,
  );
}

export function getOfficeWorkdayEnd(officeDay: Date): TZDate {
  const zonedDay = toOfficeDate(officeDay);

  return new TZDate(
    zonedDay.getFullYear(),
    zonedDay.getMonth(),
    zonedDay.getDate(),
    WORKING_DAY_END_HOUR,
    0,
    0,
    0,
    OFFICE_TIME_ZONE,
  );
}

export function getOfficeSlotStart(officeDay: Date, slotIndex: number): TZDate {
  return addMinutes(
    getOfficeWorkdayStart(officeDay),
    slotIndex * SLOT_DURATION_MINUTES,
  );
}

export function getSlotsCount(): number {
  return (
    ((WORKING_DAY_END_HOUR - WORKING_DAY_START_HOUR) * 60) /
    SLOT_DURATION_MINUTES
  );
}

export function formatInTimeZone(
  date: Date | string | number,
  pattern: string,
  timeZone: string,
): string {
  return format(toZonedDate(date, timeZone), pattern);
}

export function formatInUserTimeZone(
  date: Date | string | number,
  pattern: string,
  userTimeZone: string,
): string {
  return formatInTimeZone(date, pattern, userTimeZone);
}

export function formatInOfficeTimeZone(
  date: Date | string | number,
  pattern: string,
): string {
  return formatInTimeZone(date, pattern, OFFICE_TIME_ZONE);
}

export function getTimeZoneShortName(
  timeZone: string,
  date: Date = new Date(),
): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone,
    timeZoneName: "short",
  }).formatToParts(date);

  return parts.find((part) => part.type === "timeZoneName")?.value ?? timeZone;
}

export function getTimeZoneOffsetLabel(
  timeZone: string,
  date: Date = new Date(),
): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone,
    timeZoneName: "longOffset",
  }).formatToParts(date);

  return parts.find((part) => part.type === "timeZoneName")?.value ?? timeZone;
}

export function doTimeRangesOverlap(
  firstStart: Date,
  firstEnd: Date,
  secondStart: Date,
  secondEnd: Date,
): boolean {
  return firstStart < secondEnd && firstEnd > secondStart;
}
