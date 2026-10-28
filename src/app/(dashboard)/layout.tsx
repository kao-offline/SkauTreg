"use client";

import { useConvexAuth } from "convex/react";
import { useAuth, useClerk } from "@clerk/nextjs";
import Sidebar from "../../components/Sidebar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ProfileModalProvider } from "../../context/ProfileModalContext";
import { SidebarProvider, useSidebar } from "../../context/SidebarContext";
import styles from "./DashboardLayout.module.css";
import ProfileModal from "../../components/ProfileModal";
import { CommandMenu } from "../../components/CommandMenu";
import { UpdateNotification } from "../../components/UpdateNotification";
import { ChevronRight, Menu } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <DashboardLayoutInner>{children}</DashboardLayoutInner>
        </SidebarProvider>
    );
}

function DashboardLayoutInner({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isLoading, isAuthenticated } = useConvexAuth();
    const { isLoaded: isClerkLoaded, isSignedIn } = useAuth();
    const { signOut } = useClerk();
    const router = useRouter();
    const pathname = usePathname();
    const isTripWorkspace = /^\/trips\/[^/]+/.test(pathname || "");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
    const { isSidebarCollapsed, setIsSidebarCollapsed } = useSidebar();

    const convexAuthReady = useMemo(() => !isLoading && isAuthenticated, [isLoading, isAuthenticated]);
    const isAppLoading = isLoading || !isClerkLoaded;

    useEffect(() => {
        if (isClerkLoaded && !isSignedIn) {
            router.replace("/sign-in");
        }
    }, [isClerkLoaded, isSignedIn, router]);

    if (isAppLoading) {
        return (
            <div className={styles.loadingScreen} role="status" aria-live="polite">
                <div className={styles.loadingContent}>
                    <img src="/Logo-light.svg" alt="SkauTreg" />
                    <div className={styles.loadingTrack} aria-hidden="true"><span /></div>
                    <span className={styles.loadingLabel}>Načítám…</span>
                </div>
            </div>
        );
    }

    // If Clerk is loaded and user is not signed in, bounce to sign-in for safety
    if (isClerkLoaded && !isSignedIn) {
        return null;
    }

    // Surface a clear error when Clerk session exists but Convex auth failed
    if (isClerkLoaded && isSignedIn && !convexAuthReady) {
        return (
            <div className={styles.statusScreen}>
              <div className={styles.statusCard}>
                <span className={styles.statusEyebrow}>Problém s připojením</span>
                <h2>Pracovní prostor se nepodařilo načíst</h2>
                <p>
                    Připojení se nepodařilo ověřit. Zkuste stránku načíst znovu. Pokud problém přetrvává, odhlaste se a znovu se přihlaste.
                </p>
                <div className={styles.statusActions}>
                    <button
                        onClick={() => window.location.reload()}
                    >
                        Zkusit znovu
                    </button>
                    <button
                        onClick={() => signOut()}
                    >
                        Odhlásit se
                    </button>
                </div>
              </div>
            </div>
        );
    }

    if (!convexAuthReady) {
        return null;
    }

    return (
        <ProfileModalProvider>
            <div className={styles.container}>
                {!isTripWorkspace && <Sidebar
                    isOpen={isSidebarOpen} 
                    onClose={closeSidebar}
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />}
                {!isTripWorkspace && <button className={styles.mobileMenuButton} onClick={() => setIsSidebarOpen(true)} aria-expanded={isSidebarOpen} aria-controls="app-sidebar" aria-label="Otevřít navigaci"><Menu size={22} /></button>}

                {/* Desktop Sidebar Expand Button */}
                {isSidebarCollapsed && !isTripWorkspace && (
                    <button 
                        className={styles.expandButton}
                        onClick={() => setIsSidebarCollapsed(false)}
                        title="Rozbalit sidebar"
                    >
                        <ChevronRight size={28} strokeWidth={3} />
                    </button>
                )}

                <CommandMenu />
                <UpdateNotification />

                <main inert={isSidebarOpen || undefined} className={`${styles.mainContent} ${isSidebarCollapsed || isTripWorkspace ? styles.mainContentExpanded : ''}`}>
                    {children}
                </main>
                <ProfileModal />
            </div>
        </ProfileModalProvider>
    );
}
