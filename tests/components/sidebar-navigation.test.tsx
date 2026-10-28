import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import Sidebar from "../../src/components/Sidebar";
import { SidebarProvider } from "../../src/context/SidebarContext";

const route = vi.hoisted(() => ({ path: "/members", search: "troopId=b" }));
const troops = [{ _id: "a", name: "Vlčata" }, { _id: "b", name: "Skauti" }];
vi.mock("next/navigation", () => ({ usePathname: () => route.path, useSearchParams: () => new URLSearchParams(route.search) }));
vi.mock("convex/react", () => ({ useQuery: () => troops }));
vi.mock("../../src/context/ProfileModalContext", () => ({ useProfileModal: () => ({ openProfile: vi.fn() }) }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("keeps the route's troop selected when returning to the overview", () => {
  const view = render(<SidebarProvider><Sidebar /></SidebarProvider>);
  expect(screen.getByRole("link", { name: "Členové" })).toHaveAttribute("href", "/members?troopId=b");
  route.path = "/home";
  route.search = "";
  view.rerender(<SidebarProvider><Sidebar /></SidebarProvider>);
  expect(screen.getByRole("link", { name: "Členové" })).toHaveAttribute("href", "/members?troopId=b");
  expect(screen.getByRole("link", { name: "Přehled" })).toHaveAttribute("aria-current", "page");
});

it("focuses mobile navigation, closes with Escape and restores focus", () => {
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  const trigger = document.createElement("button");
  document.body.append(trigger);
  trigger.focus();
  const close = vi.fn();
  const view = render(<SidebarProvider><Sidebar isOpen onClose={close} /></SidebarProvider>);
  expect(screen.getByRole("link", { name: "SkautReg – přehled" })).toHaveFocus();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(close).toHaveBeenCalledOnce();
  view.unmount();
  expect(trigger).toHaveFocus();
  trigger.remove();
});
