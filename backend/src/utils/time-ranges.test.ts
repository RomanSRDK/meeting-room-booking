import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { doTimeRangesOverlap } from "./time-ranges.ts";

describe("doTimeRangesOverlap", () => {
  it("returns true when the second interval starts inside the first", () => {
    const result = doTimeRangesOverlap(
      new Date("2026-08-03T10:00:00.000Z"),
      new Date("2026-08-03T11:00:00.000Z"),
      new Date("2026-08-03T10:30:00.000Z"),
      new Date("2026-08-03T11:30:00.000Z"),
    );

    assert.equal(result, true);
  });

  it("returns true when the second interval ends inside the first", () => {
    const result = doTimeRangesOverlap(
      new Date("2026-08-03T10:00:00.000Z"),
      new Date("2026-08-03T11:00:00.000Z"),
      new Date("2026-08-03T09:30:00.000Z"),
      new Date("2026-08-03T10:30:00.000Z"),
    );

    assert.equal(result, true);
  });

  it("returns true when one interval fully contains the other", () => {
    const result = doTimeRangesOverlap(
      new Date("2026-08-03T10:00:00.000Z"),
      new Date("2026-08-03T12:00:00.000Z"),
      new Date("2026-08-03T10:30:00.000Z"),
      new Date("2026-08-03T11:00:00.000Z"),
    );

    assert.equal(result, true);
  });

  it("returns true when the intervals are identical", () => {
    const result = doTimeRangesOverlap(
      new Date("2026-08-03T10:00:00.000Z"),
      new Date("2026-08-03T11:00:00.000Z"),
      new Date("2026-08-03T10:00:00.000Z"),
      new Date("2026-08-03T11:00:00.000Z"),
    );

    assert.equal(result, true);
  });

  it("returns false when the intervals only touch", () => {
    const result = doTimeRangesOverlap(
      new Date("2026-08-03T10:00:00.000Z"),
      new Date("2026-08-03T11:00:00.000Z"),
      new Date("2026-08-03T11:00:00.000Z"),
      new Date("2026-08-03T12:00:00.000Z"),
    );

    assert.equal(result, false);
  });

  it("returns false when the intervals are separate", () => {
    const result = doTimeRangesOverlap(
      new Date("2026-08-03T10:00:00.000Z"),
      new Date("2026-08-03T11:00:00.000Z"),
      new Date("2026-08-03T12:00:00.000Z"),
      new Date("2026-08-03T13:00:00.000Z"),
    );

    assert.equal(result, false);
  });

  it("returns false for intervals on adjacent days", () => {
    const firstStartsAt = new Date("2026-08-06T15:00:00.000Z");

    const firstEndsAt = new Date("2026-08-06T16:00:00.000Z");

    const secondStartsAt = new Date("2026-08-07T06:00:00.000Z");

    const secondEndsAt = new Date("2026-08-07T07:00:00.000Z");

    const result = doTimeRangesOverlap(
      firstStartsAt,
      firstEndsAt,
      secondStartsAt,
      secondEndsAt,
    );

    assert.equal(result, false);
  });
});
