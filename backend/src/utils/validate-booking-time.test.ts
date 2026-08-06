import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { validateBookingTime } from "./validate-booking-time.ts";

const FIXED_NOW = new Date("2026-08-05T10:00:00.000Z");

function validate(startsAt: string, endsAt: string) {
  validateBookingTime({
    startsAt: new Date(startsAt),
    endsAt: new Date(endsAt),
    now: FIXED_NOW,
  });
}

describe("validateBookingTime", () => {
  it("accepts a valid 30-minute booking during office hours", () => {
    assert.doesNotThrow(() => {
      validate("2026-08-06T06:00:00.000Z", "2026-08-06T06:30:00.000Z");
    });
  });

  it("accepts a valid four-hour booking", () => {
    assert.doesNotThrow(() => {
      validate("2026-08-06T06:00:00.000Z", "2026-08-06T10:00:00.000Z");
    });
  });

  it("rejects a booking in the past", () => {
    assert.throws(
      () => {
        validate("2026-08-05T09:00:00.000Z", "2026-08-05T09:30:00.000Z");
      },
      {
        message: "Booking start time must be in the future",
      },
    );
  });

  it("rejects a booking shorter than 30 minutes", () => {
    assert.throws(
      () => {
        validate("2026-08-06T06:00:00.000Z", "2026-08-06T06:15:00.000Z");
      },
      {
        message: "Booking duration must be at least 30 minutes",
      },
    );
  });

  it("rejects a booking longer than four hours", () => {
    assert.throws(
      () => {
        validate("2026-08-06T06:00:00.000Z", "2026-08-06T10:30:00.000Z");
      },
      {
        message: "Booking duration must not exceed 4 hours",
      },
    );
  });

  it("rejects a start time outside a 30-minute boundary", () => {
    assert.throws(
      () => {
        validate("2026-08-06T06:15:00.000Z", "2026-08-06T06:45:00.000Z");
      },
      {
        message: "Booking start time must be aligned to a 30-minute slot",
      },
    );
  });

  it("rejects an end time outside a 30-minute boundary", () => {
    assert.throws(
      () => {
        validate("2026-08-06T06:00:00.000Z", "2026-08-06T06:45:00.000Z");
      },
      {
        message: "Booking end time must be aligned to a 30-minute slot",
      },
    );
  });

  it("rejects a booking before office opening time", () => {
    assert.throws(
      () => {
        validate("2026-08-06T05:30:00.000Z", "2026-08-06T06:00:00.000Z");
      },
      {
        message:
          "Booking must be within office working hours from 09:00 to 19:00 Europe/Kyiv",
      },
    );
  });

  it("rejects a booking after office closing time", () => {
    assert.throws(
      () => {
        validate("2026-08-06T15:30:00.000Z", "2026-08-06T16:30:00.000Z");
      },
      {
        message:
          "Booking must be within office working hours from 09:00 to 19:00 Europe/Kyiv",
      },
    );
  });

  it("rejects a booking that crosses into another office day", () => {
    assert.throws(
      () => {
        validate("2026-08-06T20:30:00.000Z", "2026-08-06T21:30:00.000Z");
      },
      {
        message: "Booking must start and end on the same office day",
      },
    );
  });

  it("accepts a booking ending exactly at 19:00 office time", () => {
    assert.doesNotThrow(() => {
      validate("2026-08-06T15:30:00.000Z", "2026-08-06T16:00:00.000Z");
    });
  });
});
