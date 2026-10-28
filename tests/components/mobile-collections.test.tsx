import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { CollectionToolbar } from "../../src/components/ui/CollectionToolbar";
import MemberDirectory from "../../src/components/members/MemberDirectory";

afterEach(cleanup);
it("labels shared search and troop controls and preserves their callbacks", () => {
  const changeTroop = vi.fn();
  const search = vi.fn();
  render(<CollectionToolbar troops={[{ _id: "a", name: "Vlčata" }, { _id: "b", name: "Skauti" }]} troopId="a" onTroopChange={changeTroop} search="" onSearchChange={search} searchLabel="Hledat členy"><button>Přidat člena</button></CollectionToolbar>);
  fireEvent.change(screen.getByRole("combobox", { name: "Oddíl" }), { target: { value: "b" } });
  fireEvent.change(screen.getByRole("searchbox", { name: "Hledat členy" }), { target: { value: "Anna" } });
  expect(changeTroop).toHaveBeenCalledWith("b");
  expect(search).toHaveBeenCalledWith("Anna");
});
it("keeps member identity, guardian and the detail action in mobile cards", () => {
  const member = { _id: "a", name: "Anna Nováková", nickname: "Sova", parentName: "Eva Nováková" };
  const select = vi.fn();
  render(<MemberDirectory members={[member]} onSelect={select} />);
  const list = screen.getByRole("list", { name: "Členové oddílu" });
  expect(within(list).getByText("Eva Nováková")).toBeInTheDocument();
  fireEvent.click(within(list).getByRole("button", { name: "Zobrazit člena Anna Nováková" }));
  expect(select).toHaveBeenCalledWith(member);
});
it("distinguishes loading from an empty member search", () => {
  const view = render(<MemberDirectory members={undefined} onSelect={() => {}} />);
  expect(screen.getByRole("status")).toHaveTextContent("Načítám");
  view.rerender(<MemberDirectory members={[]} onSelect={() => {}} />);
  expect(screen.getByRole("heading", { name: "Žádní členové" })).toBeInTheDocument();
});
