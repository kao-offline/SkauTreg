import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import CalendarPage from "../../src/app/(dashboard)/calendar/page";

vi.mock("convex/react", () => ({ useQuery: () => [
  { _id: "overlap", name: "Podzimní tábor", location: "Jizerské hory", startDate: "2026-09-30", endDate: "2026-10-02" },
  { _id: "next", name: "Listopadová výprava", location: "Brdy", startDate: "2026-11-07" },
  { _id: "invalid", name: "Neúplná výprava", location: "", startDate: "" },
] }));
afterEach(() => { cleanup(); vi.useRealTimers(); });
it("includes month-spanning trips in the agenda and navigates months", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 10));
  render(<CalendarPage />);
  const agenda = screen.getByRole("region", { name: "Výpravy v měsíci" });
  expect(within(agenda).getByRole("link", { name: /Podzimní tábor/ })).toHaveAttribute("href", "/trips/overlap");
  expect(within(agenda).queryByText("Listopadová výprava")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Následující měsíc" }));
  expect(within(agenda).getByRole("link", { name: /Listopadová výprava/ })).toHaveAttribute("href", "/trips/next");
  expect(within(agenda).queryByText("Podzimní tábor")).not.toBeInTheDocument();
});
