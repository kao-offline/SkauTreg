import { describe, expect, it } from "vitest";
import { tripDateRange } from "../src/lib/calendar";

describe("calendar date ranges", () => {
  it("supports single-day and month-spanning trips", () => {
    const single = tripDateRange({ startDate: "2026-10-12" })!;
    expect(single.start).toEqual(single.end);
    const spanning = tripDateRange({ startDate: "2026-09-30", endDate: "2026-10-02" })!;
    expect(spanning.end.getMonth()).toBe(9);
    expect(spanning.end > spanning.start).toBe(true);
  });
  it("ignores invalid and inverted ranges instead of crashing the calendar", () => {
    for (const trip of [{ startDate: "" }, { startDate: "2026-02-30" }, { startDate: "2026-10-12", endDate: "invalid" }, { startDate: "2026-10-12", endDate: "2026-10-01" }]) {
      expect(tripDateRange(trip)).toBeNull();
    }
  });
});
