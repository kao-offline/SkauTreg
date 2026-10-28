"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { Settings2, ChevronRight } from "lucide-react";
import { Card, EmptyStateCard, PageContent, PageHeader, PageTitle, Button } from "@/components/ui";
import styles from "./SettingsList.module.css";

export default function SettingsPage() {
  const troops = useQuery(api.troops.getByUser);
  return <div>
    <PageHeader><PageTitle>Nastavení</PageTitle></PageHeader>
    <PageContent>
      <h2 className={styles.heading}>Vyberte oddíl k úpravě</h2>
      {troops === undefined ? <p role="status">Načítám nastavení…</p> : !troops.length ? <EmptyStateCard title="Zatím nemáte žádné oddíly" action={<Button href="/troop?create=true">Vytvořit oddíl</Button>} /> : <div className={styles.grid}>
        {troops.map(troop => <Link href={`/settings/${troop._id}`} key={troop._id}>
          <Card interactive className={styles.option}>
            <div className={styles.logo}>{troop.logo ? <img src={troop.logo} alt="" /> : <Settings2 size={24} />}</div>
            <div className={styles.copy}><h3>{troop.name}</h3>{troop.number && <p>{troop.number}. oddíl</p>}</div>
            <ChevronRight size={20} aria-hidden="true" />
          </Card>
        </Link>)}
      </div>}
    </PageContent>
  </div>;
}
