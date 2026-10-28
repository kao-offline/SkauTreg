import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import Home from "../../src/app/(dashboard)/page";
import { SidebarProvider } from "../../src/context/SidebarContext";

vi.mock("../../convex/_generated/api", () => ({ api: { troops: { getByUser: "troops" }, trips: { list: "trips" }, members: { list: "members" } } }));
vi.mock("convex/react", () => ({
  useQuery: (query: string, args?: { troopId: string }) => {
    if (query === "troops") return [{ _id: "a", name: "Vlčata" }, { _id: "b", name: "Skauti" }];
    if (query === "members") return args?.troopId === "b" ? [{}, {}] : [{}];
    return [];
  },
}));
afterEach(cleanup);
it("shows explicit troop context and carries selection into members and trips links", () => {
  render(<SidebarProvider><Home /></SidebarProvider>);
  fireEvent.change(screen.getByRole("combobox", { name: "Údaje pro oddíl" }), { target: { value: "b" } });
  expect(screen.getByRole("link", { name: "Členové oddílu 2" })).toHaveAttribute("href", "/members?troopId=b");
  expect(screen.getByRole("link", { name: "Výpravy oddílu 0" })).toHaveAttribute("href", "/trips?troopId=b");
  expect(screen.getByRole("link", { name: "Vytvořit výpravu" })).toHaveAttribute("href", "/trips?troopId=b&create=true");
});
