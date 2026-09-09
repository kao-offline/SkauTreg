import { describe, expect, it } from "vitest";
import { meetingDateInCurrentWeek, shiftMeetingDate, toLocalDateValue } from "../src/lib/attendance";

describe("attendance date helpers", () => {
  it("selects the configured day in the same Czech Monday-to-Sunday week", () => {
    const monday = new Date(2026, 8, 7, 12);
    expect(meetingDateInCurrentWeek(monday, 4)).toBe("2026-09-10");
    expect(meetingDateInCurrentWeek(monday, 0)).toBe("2026-09-13");
  });

  it("keeps Sunday anchored to the week that started on the previous Monday", () => {
    const sunday = new Date(2026, 8, 13, 12);
    expect(meetingDateInCurrentWeek(sunday, 1)).toBe("2026-09-07");
  });

  it("moves between meetings without UTC date drift", () => {
    expect(shiftMeetingDate("2026-10-25", 1)).toBe("2026-11-01");
    expect(shiftMeetingDate("2026-10-25", -1)).toBe("2026-10-18");
    expect(toLocalDateValue(new Date(2026, 0, 5, 12))).toBe("2026-01-05");
  });
});
