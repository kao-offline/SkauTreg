"use client";

import { useSidebar } from "@/context/SidebarContext";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useEffect, useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import Link from "next/link";
import TripForm, { TripFormData } from "../../../components/TripForm";
import { useFeedback } from "@/context/FeedbackContext";
import { CalendarPlus, House, MapPin, Plus, X } from "lucide-react";
import { Button, Card, CollectionToolbar, EmptyStateCard, ModalShell, PageContent, PageHeader, PageTitle } from "@/components/ui";
import styles from "./TripsPage.module.css";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function TripsPage() {
    const { showError, showSuccess } = useFeedback();
    const troops = useQuery(api.troops.getByUser);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const troopIdParam = searchParams.get("troopId");
    const { activeTroopId } = useSidebar();

    const [selectedTroopId, setSelectedTroopId] = useState<Id<"troops"> | null>(
        troopIdParam ? (troopIdParam as Id<"troops">) : null
    );

    // Update URL when troop is selected
    const handleTroopChange = (newTroopId: string) => {
        setSelectedTroopId(newTroopId as Id<"troops">);
        const params = new URLSearchParams(searchParams);
        params.set("troopId", newTroopId);
        router.replace(`${pathname}?${params.toString()}`);
    };

    useEffect(() => {
        if (troopIdParam) {
            setSelectedTroopId(troopIdParam as Id<"troops">);
        } else if (troops && troops.length > 0) {
            setSelectedTroopId(troops.find(t => t._id === activeTroopId)?._id || troops[0]._id);
        }
    }, [troopIdParam, troops, activeTroopId]);

    // Get currently selected troop details

    const trips = useQuery(api.trips.list, selectedTroopId ? { troopId: selectedTroopId } : "skip");
    const createTrip = useMutation(api.trips.create);

    const [isCreating, setIsCreating] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"upcoming" | "old">("upcoming");

    useEffect(() => {
        const requestedTab = searchParams.get("tab");
        if (requestedTab === "upcoming" || requestedTab === "old") {
            setActiveTab(requestedTab);
        }
        if (searchParams.get("create") === "true") {
            setShowAddModal(true);
        }
    }, [searchParams]);

    const handleCreate = async (data: TripFormData) => {
        if (!selectedTroopId) return;

        setIsCreating(true);
        try {
            await createTrip({
                troopId: selectedTroopId,
                ...data
            });
            setShowAddModal(false);
            showSuccess({
                title: "Uloženo",
                message: "Výprava byla vytvořena.",
                duration: 2500,
            });
        } catch (error) {
            showError({
                title: "Výpravu se nepodařilo vytvořit",
                message: error instanceof Error ? error.message : "Zkontrolujte údaje a zkuste to znovu.",
                icon: "error",
            });
        } finally {
            setIsCreating(false);
        }
    };

    if (troops === undefined) return <div><PageHeader><PageTitle>Výpravy</PageTitle></PageHeader><PageContent><p role="status">Načítám oddíly…</p></PageContent></div>;

    if (troops.length === 0) {
        return <div><PageHeader><PageTitle>Výpravy</PageTitle></PageHeader><PageContent>
            <EmptyStateCard title="Nejdřív vytvořte oddíl" description="Členy a výpravy spravujete v rámci svého oddílu." action={<Button href="/troop?create=true">Vytvořit oddíl</Button>} />
        </PageContent></div>;
    }

    // Filter trips
    const filteredTrips = trips?.filter((t) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.location && t.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Helper function to check if trip is upcoming or old
    const isUpcomingTrip = (trip: NonNullable<typeof trips>[number]) => {
        if (!trip.startDate) return true;
        const [y, m, d] = trip.startDate.split("-").map(Number);
        const tripStart = new Date(y, m - 1, d);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return tripStart >= today;
    };

    // Filter by tab
    const tabFilteredTrips = filteredTrips?.filter((t) => {
        const isUpcoming = isUpcomingTrip(t);
        return activeTab === "upcoming" ? isUpcoming : !isUpcoming;
    }) || [];

    return (
        <div style={{ width: "100%", position: "relative", overflowX: "hidden", paddingBottom: "2rem" }}>
            {/* Top Title Bar */}
            <PageHeader><PageTitle>Výpravy</PageTitle></PageHeader>

            <div className="dashboardContent">
                <CollectionToolbar troops={troops} troopId={selectedTroopId} onTroopChange={handleTroopChange} search={searchTerm} onSearchChange={setSearchTerm} searchLabel="Hledat výpravy" filters={<>
                    <button aria-pressed={activeTab === "upcoming"} onClick={() => setActiveTab("upcoming")}>Nadcházející</button>
                    <button aria-pressed={activeTab === "old"} onClick={() => setActiveTab("old")}>Archiv</button>
                </>}>
                    <Button onClick={() => setShowAddModal(true)} disabled={!selectedTroopId}><Plus size={20} /> Přidat výpravu</Button>
                </CollectionToolbar>

            {/* Content Area */}
            <div>
                {!trips ? (
                    <div>Načítám výpravy...</div>
                ) : tabFilteredTrips.length === 0 ? (
                    <div style={{
                        padding: "3rem",
                        textAlign: "center",
                        border: "3px dashed #ccc",
                        borderRadius: "12px",
                        fontWeight: "bold",
                        color: "#888"
                    }}>
                        Žádné výpravy nenalezeny. Klikněte na Přidat výpravu pro naplánování nové.
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))", gap: "1.25rem" }}>
                        {tabFilteredTrips.map((trip) => (
                            <Link key={trip._id} href={`/trips/${trip._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Card interactive className={styles.tripCard}>
                                    <div>
                                        <div style={{
                                            marginBottom: "0.5rem",
                                            fontSize: "0.9rem",
                                            fontWeight: "800",
                                            textTransform: "uppercase",
                                            color: "#666",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                        }}>
                                            <span>
                                                {(() => {
                                                    if (!trip.startDate) return "";
                                                    const [y, m, d] = trip.startDate.split("-");
                                                    return `${parseInt(d)}. ${parseInt(m)}. ${y}`;
                                                })()}
                                            </span>
                                            <span style={{
                                                padding: "0.3rem 0.75rem",
                                                borderRadius: "6px",
                                                fontSize: "0.75rem",
                                                fontWeight: "700",
                                                backgroundColor: isUpcomingTrip(trip) ? "#dbeafe" : "#fecaca",
                                                color: isUpcomingTrip(trip) ? "#075985" : "#991b1b",
                                                border: "1px solid " + (isUpcomingTrip(trip) ? "#0284c7" : "#dc2626")
                                            }}>
                                                {isUpcomingTrip(trip) ? "BUDE" : "Proběhlo"}
                                            </span>
                                        </div>
                                        <h3>{trip.name}</h3>
                                        <p style={{ fontWeight: "600", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                            <MapPin size={18} aria-hidden="true" style={{ flexShrink: 0 }} /> {trip.location}
                                        </p>
                                        {trip.baseName && (
                                            <div style={{
                                                marginTop: "0.75rem",
                                                padding: "0.5rem 0.75rem",
                                                backgroundColor: "#E3F2FD",
                                                border: "2px solid #000",
                                                borderRadius: "8px",
                                                fontSize: "0.85rem",
                                                fontWeight: "700",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "0.5rem"
                                            }}>
                                                <House size={18} aria-hidden="true" />
                                                {trip.baseName}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{
                                        marginTop: "1.5rem",
                                        paddingTop: "1rem",
                                        borderTop: "2px solid #000",
                                        fontWeight: "600",
                                        display: "flex",
                                        justifyContent: "space-between"
                                    }}>
                                        <span>{trip.formType === 'apology' ? "Pouze omluvenky" : "Registrace"}</span>
                                        <span>➜</span>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            </div>

            {/* Create Modal */}
            {showAddModal && (
                <ModalShell className={styles.createDialog} width="980px" maxHeight="820px" onClose={isCreating ? undefined : () => setShowAddModal(false)} aria-labelledby="create-trip-title">
                        <header className={styles.createHeader}>
                            <div className={styles.createHeading}>
                                <span className={styles.createIcon}><CalendarPlus size={21} /></span>
                                <div><span>Nová výprava</span><h2 id="create-trip-title">Naplánovat výpravu</h2></div>
                            </div>
                            <button disabled={isCreating} type="button" className={styles.closeButton} onClick={() => setShowAddModal(false)} aria-label="Zavřít"><X size={20} /></button>
                        </header>

                        <div className={styles.createBody}>
                            <p className={styles.createIntro}>Nejdřív vyplňte základní údaje. Způsob přihlašování a vlastní otázky nastavíte ve druhé části.</p>
                            <TripForm
                                onSubmit={handleCreate}
                                isLoading={isCreating}
                                buttonText="Vytvořit výpravu"
                            />
                        </div>
                </ModalShell>
            )}
        </div>
    );
}
