export type MeetingDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const MEETING_DAYS: ReadonlyArray<{ value: MeetingDay; label: string }> = [
  { value: 1, label: "Pondělí" },
  { value: 2, label: "Úterý" },
  { value: 3, label: "Středa" },
  { value: 4, label: "Čtvrtek" },
  { value: 5, label: "Pátek" },
  { value: 6, label: "Sobota" },
  { value: 0, label: "Neděle" },
];

export function toLocalDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function meetingDateInCurrentWeek(reference: Date, meetingDay: MeetingDay): string {
  const result = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate(), 12);
  const currentMondayIndex = reference.getDay() === 0 ? 7 : reference.getDay();
  const targetMondayIndex = meetingDay === 0 ? 7 : meetingDay;
  result.setDate(result.getDate() + targetMondayIndex - currentMondayIndex);
  return toLocalDateValue(result);
}

export function shiftMeetingDate(dateValue: string, weeks: number): string {
  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  date.setDate(date.getDate() + weeks * 7);
  return toLocalDateValue(date);
}
