"use client";

import { useState } from "react";
import { TripList } from "@/components/trip/TripList";
import { useSidebar } from "@/context/SidebarContext";
import { useQuery } from "convex/react";
import {
  ChartNoAxesColumn,
  ClipboardList,
  HelpCircle,
  House,
  Lightbulb,
  Search,
  Settings,
  ShieldCheck,
  Tent,
  Users,
} from "lucide-react";
import { api } from "../../../convex/_generated/api";
import {
  Button,
  Card,
  EmptyStateCard,
  Field,
  PageActions,
  PageContent,
  PageHeader,
  PageTitle,
  StatCard,
  TextInput,
  SelectInput,
  FieldLabel,
} from "../../components/ui";

const helpTopics = [
  {
    Icon: House,
    title: "Správa oddílů",
    description: "Vytvářejte a spravujte své skautské oddíly",
    keywords: ["oddíl", "vytvoření", "správa", "vedoucí"],
  },
  {
    Icon: Users,
    title: "Správa členů",
    description: "Přidávejte členy, upravujte profily a spravujte role",
    keywords: ["člen", "profil", "přidání", "smazání"],
  },
  {
    Icon: Tent,
    title: "Správa výprav",
    description: "Plánujte a organizujte výpravy a tábory",
    keywords: ["výprava", "tábor", "plánování", "datum"],
  },
  {
    Icon: ClipboardList,
    title: "Formuláře a otázky",
    description: "Přidávejte vlastní otázky a formuláře k výpravám",
    keywords: ["formulář", "otázka", "textové pole", "checkbox"],
  },
  {
    Icon: ChartNoAxesColumn,
    title: "Sledování účastníků",
    description: "Sledujte přihlášky a odpovědi na otázky",
    keywords: ["účastník", "přihláška", "odpověď", "export"],
  },
  {
    Icon: Lightbulb,
    title: "Tipy a triky",
    description: "Užitečné tipy pro efektivní řízení oddílu",
    keywords: ["tip", "trik", "optimalizace", "komunikace"],
  },
  {
    Icon: ShieldCheck,
    title: "Bezpečnost a přihlášení",
    description: "Hesla, přihlašování a ochrana účtu",
    keywords: ["heslo", "přihlášení", "obnova", "bezpečnost"],
  },
  {
    Icon: Settings,
    title: "Nastavení a profil",
    description: "Upravujte svůj profil a předvolby aplikace",
    keywords: ["nastavení", "profil", "preference", "jazyk"],
  },
];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  const troops = useQuery(api.troops.getByUser);
  const { activeTroopId, setActiveTroopId } = useSidebar();
  const activeTroop = troops?.find(t => t._id === activeTroopId) || troops?.[0];
  const troopQuery = activeTroop ? `?troopId=${activeTroop._id}` : "";
  const trips = useQuery(
    api.trips.list,
    activeTroop ? { troopId: activeTroop._id } : "skip",
  );
  const members = useQuery(
    api.members.list,
    activeTroop ? { troopId: activeTroop._id } : "skip",
  );
  const dashboardDataReady = troops !== undefined && (troops.length === 0 || (trips !== undefined && members !== undefined));

  const filteredTopics = helpTopics.filter(
    (topic) =>
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.keywords.some((keyword) => keyword.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div>
      <PageHeader>
        <PageTitle>Přehled</PageTitle>
        <PageActions>
          <Button href="/troop" variant="secondary">
            Spravovat oddíly
          </Button>
        </PageActions>
      </PageHeader>

      <PageContent>
        {troops && troops.length > 0 && (
          <Field style={{ maxWidth: "360px", marginBottom: "1.5rem" }}>
            <FieldLabel>Údaje pro oddíl</FieldLabel>
            <SelectInput value={activeTroop?._id || ""} onChange={event => setActiveTroopId(event.target.value)}>
              {troops.map(troop => <option key={troop._id} value={troop._id}>{troop.name}</option>)}
            </SelectInput>
          </Field>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          <StatCard href="/troop" label="Vaše oddíly" value={troops === undefined ? "…" : troops.length} icon={<House size={22} strokeWidth={3} />} />
          <StatCard href={`/trips${troopQuery}`} label="Výpravy oddílu" value={activeTroop && trips === undefined ? "…" : trips?.length || 0} icon={<Tent size={22} strokeWidth={3} />} />
          <StatCard href={`/members${troopQuery}`} label="Členové oddílu" value={activeTroop && members === undefined ? "…" : members?.length || 0} icon={<Users size={22} strokeWidth={3} />} />
        </div>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: "900", marginBottom: "1rem" }}>Nejbližší výpravy</h2>
          {!dashboardDataReady ? (<p role="status">Načítám údaje oddílu…</p>) : trips && trips.length > 0 ? (
            <TripList trips={trips.slice(0, 5)} />
          ) : (
            <EmptyStateCard
              title="Žádné výpravy"
              description="Zatím tu nejsou žádné nejbližší výpravy."
              action={
                <Button href={activeTroop ? `/trips${troopQuery}&create=true` : "/troop?create=true"} variant="secondary">
                  {activeTroop ? "Vytvořit výpravu" : "Vytvořit oddíl"}
                </Button>
              }
            />
          )}
        </section>

        <section>
          <h2 style={{ fontSize: "1.125rem", fontWeight: "900", marginBottom: "1rem" }}>Nápověda a tipy</h2>

          {!showHelp ? (
            <Card padding="lg" style={{ backgroundColor: "var(--color-primary)", textAlign: "center" }}>
              <HelpCircle size={40} strokeWidth={3} style={{ marginBottom: "0.75rem" }} />
              <div style={{ fontSize: "1.1rem", fontWeight: "900", marginBottom: "0.75rem" }}>Potřebujete pomoc?</div>
              <Button type="button" variant="secondary" onClick={() => setShowHelp(true)}>
                Otevřít nápovědu
              </Button>
            </Card>
          ) : (
            <Card padding="lg">
              <Field style={{ marginBottom: "1.5rem" }}>
                <TextInput
                  aria-label="Hledat v nápovědě"
                  type="text"
                  placeholder="Hledat: výprava, člen, heslo..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  autoFocus
                />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))", gap: "1rem", marginBottom: "1rem" }}>
                {filteredTopics.length > 0 ? (
                  filteredTopics.map(({ Icon, ...topic }) => (
                    <Card key={topic.title} padding="sm">
                      <Icon size={28} strokeWidth={3} style={{ marginBottom: "0.5rem" }} />
                      <h4 style={{ fontSize: "0.95rem", fontWeight: "900", marginBottom: "0.25rem" }}>{topic.title}</h4>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: "1.4", fontWeight: 600 }}>
                        {topic.description}
                      </p>
                    </Card>
                  ))
                ) : (
                  <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "1rem", color: "var(--text-muted)" }}>
                    <Search size={28} strokeWidth={3} style={{ marginBottom: "0.5rem" }} />
                    <p>Žádné výsledky na &quot;{searchTerm}&quot;</p>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem", paddingTop: "1rem", borderTop: "var(--border-ui)" }}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowHelp(false);
                    setSearchTerm("");
                  }}
                >
                  Zavřít
                </Button>
              </div>
            </Card>
          )}
        </section>
      </PageContent>
    </div>
  );
}
