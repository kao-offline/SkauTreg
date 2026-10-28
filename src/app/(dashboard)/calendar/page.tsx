"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isWithinInterval } from "date-fns";
import { cs } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button, EmptyStateCard, PageActions, PageContent, PageHeader, PageTitle } from "@/components/ui";
import { tripDateRange } from "@/lib/calendar";
import { TripList } from "@/components/trip/TripList";
import styles from "./Calendar.module.css";

export default function CalendarPage() {
  const trips = useQuery(api.trips.getAllUserTrips);
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: startOfWeek(monthStart, { weekStartsOn: 1 }), end: endOfWeek(monthEnd, { weekStartsOn: 1 }) });
  const datedTrips = (trips || []).flatMap(trip => {
    const range = tripDateRange(trip);
    return range ? [{ ...trip, range }] : [];
  });
  const monthTrips = datedTrips.filter(trip => trip.range.start <= monthEnd && trip.range.end >= monthStart).sort((a, b) => a.range.start.getTime() - b.range.start.getTime());

  return <div>
    <PageHeader><PageTitle>Kalendář</PageTitle><PageActions><Button variant="secondary" onClick={() => setCurrentDate(new Date())}>Dnes</Button></PageActions></PageHeader>
    <PageContent>
      <div className={styles.monthNavigation}>
        <Button variant="icon" aria-label="Předchozí měsíc" onClick={() => setCurrentDate(subMonths(currentDate, 1))}><ChevronLeft size={20} /></Button>
        <h2 aria-live="polite">{format(currentDate, "MMMM yyyy", { locale: cs })}</h2>
        <Button variant="icon" aria-label="Následující měsíc" onClick={() => setCurrentDate(addMonths(currentDate, 1))}><ChevronRight size={20} /></Button>
      </div>
      {trips === undefined ? <p role="status">Načítám kalendář…</p> : <>
        <div className={styles.monthGrid} aria-label="Měsíční kalendář">
          <div className={styles.weekdays}>{["Po", "Út", "St", "Čt", "Pá", "So", "Ne"].map(day => <div key={day}>{day}</div>)}</div>
          <div className={styles.days}>{days.map(day => <div className={styles.day} key={day.toISOString()} data-outside={!isSameMonth(day, currentDate)}>
            <time dateTime={format(day, "yyyy-MM-dd")} aria-current={isSameDay(day, new Date()) ? "date" : undefined}>{format(day, "d")}</time>
            {datedTrips.filter(trip => isWithinInterval(day, trip.range)).map(trip => <Link className={styles.dayTrip} key={trip._id} href={`/trips/${trip._id}`} title={trip.name}>{trip.name}</Link>)}
          </div>)}</div>
        </div>
        <section className={styles.agenda} aria-label="Výpravy v měsíci">
          {monthTrips.length ? <TripList trips={monthTrips} /> : <EmptyStateCard title="Žádné výpravy v tomto měsíci" description="Vyberte jiný měsíc nebo naplánujte novou výpravu." action={<Button href="/trips" variant="secondary">Zobrazit výpravy</Button>} />}
        </section>
      </>}
    </PageContent>
  </div>;
}
