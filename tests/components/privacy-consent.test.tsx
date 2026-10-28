import React from "react";
import { afterEach, beforeAll, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import AnalyticsConsent from "../../src/components/AnalyticsConsent";

vi.mock("next/navigation", () => ({ usePathname: () => "/home" }));
vi.mock("posthog-js", () => ({ default: { opt_out_capturing: vi.fn(), stopSessionRecording: vi.fn(), reset: vi.fn() } }));
const key = "skautreg.analytics-consent";
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
});
beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("requires a first choice, persists it, and reopens from app navigation", () => {
  render(<AnalyticsConsent />);
  const dialog = screen.getByRole("dialog", { name: "Nastavení soukromí" });
  fireEvent(dialog, new Event("cancel", { cancelable: true }));
  expect(dialog).toHaveAttribute("open");
  fireEvent.click(screen.getByRole("button", { name: "Pouze nezbytné" }));
  expect(JSON.parse(localStorage.getItem(key)!)).toMatchObject({ analytics: false, version: "2026-07-25" });
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  act(() => window.dispatchEvent(new Event("skautreg:open-privacy")));
  const reopened = screen.getByRole("dialog");
  fireEvent(reopened, new Event("cancel", { cancelable: true }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it("keeps a session choice usable when browser storage fails", () => {
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Storage unavailable"); });
  render(<AnalyticsConsent />);
  fireEvent.click(screen.getByRole("button", { name: "Pouze nezbytné" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Soukromí" }));
  expect(screen.getByRole("dialog")).toHaveAccessibleName("Nastavení soukromí");
});
