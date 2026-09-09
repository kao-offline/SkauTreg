"use client";

import { useEffect, useMemo, useState } from "react";
import { useConvexConnectionState, useMutation, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Check, ChevronLeft, ChevronRight, CircleSlash2, Clock3, UserCheck } from "lucide-react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { meetingDateInCurrentWeek, shiftMeetingDate } from "../../../../../lib/attendance";
import styles from "./AttendancePage.module.css";

type AttendanceStatus = "present" | "absent" | "excused" | "unmarked";

const STATUS_OPTIONS: ReadonlyArray<{
  value: Exclude<AttendanceStatus, "unmarked">;
  label: string;
  shortLabel: string;
}> = [
  { value: "present", label: "Přítomen", shortLabel: "Ano" },
  { value: "absent", label: "Nepřítomen", shortLabel: "Ne" },
  { value: "excused", label: "Omluven", shortLabel: "Omluven" },
];

export default function AttendancePage() {
  const params = useParams();
  const troopId = params.troopId as Id<"troops">;
  const troop = useQuery(api.troops.getById, { id: troopId });
  const myRole = useQuery(api.troops.getMyRole, { troopId });
  const connectionState = useConvexConnectionState();
  const [meetingDate, setMeetingDate] = useState("");
  const [pendingMemberId, setPendingMemberId] = useState<Id<"members"> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (troop?.meetingDay !== undefined && !meetingDate) {
      setMeetingDate(meetingDateInCurrentWeek(new Date(), troop.meetingDay));
    }
  }, [meetingDate, troop?.meetingDay]);

  useEffect(() => {
    const updateOnlineState = () => setIsOnline(navigator.onLine);
    updateOnlineState();
    window.addEventListener("online", updateOnlineState);
    window.addEventListener("offline", updateOnlineState);
    return () => {
      window.removeEventListener("online", updateOnlineState);
      window.removeEventListener("offline", updateOnlineState);
    };
  }, []);

  const attendance = useQuery(
    api.attendance.getForDate,
    meetingDate ? { troopId, meetingDate } : "skip",
  );
  const setStatus = useMutation(api.attendance.setStatus).withOptimisticUpdate((store, args) => {
    const queryArgs = { troopId: args.troopId, meetingDate: args.meetingDate };
    const current = store.getQuery(api.attendance.getForDate, queryArgs);
    if (!current) return;
    store.setQuery(
      api.attendance.getForDate,
      queryArgs,
      current.map((row) => row.memberId === args.memberId ? { ...row, status: args.status } : row),
    );
  });

  const summary = useMemo(() => {
    const rows = attendance ?? [];
    return rows.reduce(
      (counts, row) => ({ ...counts, [row.status]: counts[row.status] + 1 }),
      { present: 0, absent: 0, excused: 0, unmarked: 0 } as Record<AttendanceStatus, number>,
    );
  }, [attendance]);

  const canEdit = myRole !== undefined && myRole !== null && myRole !== "rover";
  const isLive = isOnline && connectionState.isWebSocketConnected;

  const handleStatusChange = async (memberId: Id<"members">, status: AttendanceStatus) => {
    if (!meetingDate || !canEdit) return;
    setError(null);
    setPendingMemberId(memberId);
    try {
      await setStatus({ troopId, memberId, meetingDate, status });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Docházku se nepodařilo uložit.");
    } finally {
      setPendingMemberId(null);
    }
  };

  if (troop === undefined) {
    return <div className={styles.centerState} role="status">Načítám docházku…</div>;
  }

  if (troop === null) {
    return <div className={styles.centerState}>Oddíl nebyl nalezen.</div>;
  }

  if (troop.meetingDay === undefined) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <h1>Docházka</h1>
        </header>
        <section className={styles.setupCard}>
          <CalendarDays size={42} aria-hidden="true" />
          <h2>Nejdřív nastavte den schůzky</h2>
          <p>V základním nastavení oddílu vyberte pravidelný den. Potom se zde automaticky otevře správné datum.</p>
          <Link href={`/settings/${troopId}?section=general#attendance-settings`}>Nastavit den schůzky</Link>
        </section>
      </main>
    );
  }

  const formattedDate = meetingDate
    ? new Intl.DateTimeFormat("cs-CZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      .format(new Date(`${meetingDate}T12:00:00`))
    : "";

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Docházka</h1>
      </header>

      <section className={styles.toolbar} aria-label="Výběr schůzky">
        <button type="button" disabled={!meetingDate} onClick={() => setMeetingDate((date) => shiftMeetingDate(date, -1))} aria-label="Předchozí schůzka">
          <ChevronLeft size={20} />
        </button>
        <label>
          <span>Datum schůzky</span>
          <input type="date" value={meetingDate} onChange={(event) => setMeetingDate(event.target.value)} />
        </label>
        <button type="button" disabled={!meetingDate} onClick={() => setMeetingDate((date) => shiftMeetingDate(date, 1))} aria-label="Následující schůzka">
          <ChevronRight size={20} />
        </button>
        <strong>{formattedDate}</strong>
      </section>

      <section className={styles.summary} aria-label="Souhrn docházky">
        <div><UserCheck size={19} /><span>Přítomní</span><strong>{summary.present}</strong></div>
        <div><CircleSlash2 size={19} /><span>Nepřítomní</span><strong>{summary.absent}</strong></div>
        <div><Clock3 size={19} /><span>Omluvení</span><strong>{summary.excused}</strong></div>
        <div><span className={styles.dot} /><span>Neoznačení</span><strong>{summary.unmarked}</strong></div>
      </section>

      {error && <div className={styles.error} role="alert">{error}</div>}
      {!canEdit && <div className={styles.notice}>Docházku můžete prohlížet. Měnit ji mohou vedoucí oddílu.</div>}

      <section className={styles.roster} aria-label={`Docházka pro ${formattedDate}`}>
        {attendance === undefined ? (
          <div className={styles.centerState} role="status">Načítám členy…</div>
        ) : attendance.length === 0 ? (
          <div className={styles.centerState}>V oddílu zatím nejsou žádní členové.</div>
        ) : attendance.map((member) => (
          <article className={styles.memberRow} key={member.memberId}>
            <div className={styles.memberIdentity}>
              <span className={styles.avatar}>{(member.nickname || member.name).slice(0, 2).toUpperCase()}</span>
              <span><strong>{member.name}</strong>{member.nickname && <small>„{member.nickname}“</small>}</span>
            </div>
            <div className={styles.statusButtons} aria-label={`Stav: ${member.name}`}>
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  data-status={option.value}
                  data-active={member.status === option.value}
                  aria-pressed={member.status === option.value}
                  aria-label={`${member.name}: ${option.label}`}
                  disabled={!canEdit || pendingMemberId === member.memberId || !isLive}
                  onClick={() => handleStatusChange(member.memberId, member.status === option.value ? "unmarked" : option.value)}
                >
                  {option.value === "present" && <Check size={17} aria-hidden="true" />}
                  <span className={styles.longLabel}>{option.label}</span>
                  <span className={styles.shortLabel}>{option.shortLabel}</span>
                </button>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
