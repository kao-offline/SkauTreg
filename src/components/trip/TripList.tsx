import Link from "next/link";
import { format, isSameDay } from "date-fns";
import { tripDateRange } from "@/lib/calendar";
import styles from "./TripList.module.css";

export function TripList({ trips }: { trips: Array<{ _id: string; name: string; location: string; startDate: string; endDate?: string }> }) {
  return <ul className={styles.list}>{trips.map(trip => {
    const range = tripDateRange(trip);
    const date = range ? `${format(range.start, "d. M. yyyy")}${isSameDay(range.start, range.end) ? "" : ` – ${format(range.end, "d. M. yyyy")}`}` : trip.startDate;
    return <li key={trip._id}><Link href={`/trips/${trip._id}`}>
      <div className={styles.copy}><strong>{trip.name}</strong>{trip.location && <span>{trip.location}</span>}</div>
      <time dateTime={trip.startDate}>{date}</time>
    </Link></li>;
  })}</ul>;
}
