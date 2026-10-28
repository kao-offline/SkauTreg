"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "./ui/Button";
import { ModalShell, ModalHeader, ModalTitle, ModalBody, ModalFooter } from "./ui/Modal";

const CONSENT_KEY = "skautreg.analytics-consent";
const CONSENT_VERSION = "2026-07-25";
type Consent = { analytics: boolean; version: string; updatedAt: string };

function readConsent(): Consent | null {
  try {
    const value = JSON.parse(localStorage.getItem(CONSENT_KEY) || "null") as Consent | null;
    return value?.version === CONSENT_VERSION ? value : null;
  } catch {
    return null;
  }
}

export default function AnalyticsConsent() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [consent, setConsent] = useState<Consent | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    const stored = readConsent();
    setConsent(stored);
    setOpen(!stored);
  }, []);

  useEffect(() => {
    if (!consent?.analytics) return;
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    if (!key || host !== "https://eu.i.posthog.com") return;
    let cancelled = false;
    void Promise.all([
      import("posthog-js"),
      fetch("/api/analytics-id", { cache: "no-store" }).then((response) =>
        response.ok ? response.json() as Promise<{ id: string }> : null,
      ),
    ]).then(([module, identity]) => {
      if (cancelled) return;
      const posthog = module.default;
      if (!initialized.current) posthog.init(key, {
        api_host: host,
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        disable_session_recording: true,
        person_profiles: "never",
        persistence: "localStorage",
        sanitize_properties: (properties) => {
          delete properties.$current_url;
          delete properties.$referrer;
          delete properties.$ip;
          return properties;
        },
      });
      initialized.current = true;
      if (identity?.id) posthog.identify(identity.id);
      posthog.capture("page_view", { path: window.location.pathname });
    });
    return () => { cancelled = true; };
  }, [consent]);

  useEffect(() => {
    if (!consent?.analytics || !initialized.current) return;
    void import("posthog-js").then(({ default: posthog }) => posthog.capture("page_view", { path: pathname }));
  }, [consent, pathname]);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("skautreg:open-privacy", show);
    return () => window.removeEventListener("skautreg:open-privacy", show);
  }, []);

  const save = async (analytics: boolean) => {
    const value = { analytics, version: CONSENT_VERSION, updatedAt: new Date().toISOString() };
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(value)); } catch { /* Retain the session choice if storage is unavailable. */ }
    setConsent(value);
    setOpen(false);
    if (!analytics) {
      const posthog = (await import("posthog-js")).default;
      posthog.opt_out_capturing();
      posthog.stopSessionRecording();
      posthog.reset();
    }
  };

  return (
    <>
      <footer className="privacy-footer">
        <Button type="button" variant="ghost" onClick={() => setOpen(true)}>Soukromí</Button>
      </footer>
      {open && (
        <ModalShell width="520px" onClose={consent ? () => setOpen(false) : undefined}>
          <ModalHeader><ModalTitle>Nastavení soukromí</ModalTitle></ModalHeader>
          <ModalBody>
            <p>Nezbytné zpracování zajišťuje přihlášení a chod aplikace a nelze je vypnout. Anonymizovaná produktová analytika PostHog EU je volitelná.</p>
            <p style={{ marginTop: "1rem" }}>Analytika neodesílá jméno, e-mail, ID oddílu, obsah formulářů ani úplné URL. Záznam relace je zatím vypnutý.</p>
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => save(false)}>Pouze nezbytné</Button>
            <Button type="button" onClick={() => save(true)}>Povolit analytiku</Button>
          </ModalFooter>
        </ModalShell>
      )}
    </>
  );
}
