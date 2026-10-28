import { isValid, parseISO } from "date-fns";

export function tripDateRange(trip: { startDate: string; endDate?: string }) {
  const start = parseISO(trip.startDate);
  const end = trip.endDate ? parseISO(trip.endDate) : start;
  if (!isValid(start) || !isValid(end) || end < start) return null;
  return { start, end };
}
