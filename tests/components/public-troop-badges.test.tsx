import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PublicTroopBadges from "../../src/components/PublicTroopBadges";

const { queryMock, convexMock } = vi.hoisted(() => {
  const queryMock = vi.fn();
  return { queryMock, convexMock: { query: queryMock } };
});

vi.mock("convex/react", () => ({
  useConvex: () => convexMock,
}));

afterEach(cleanup);

describe("PublicTroopBadges", () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  it("renders the static badges when Convex is unavailable", async () => {
    queryMock.mockRejectedValue(new Error("Convex deployment disabled"));

    render(<PublicTroopBadges />);

    expect(screen.getByAltText("Roveři")).toBeInTheDocument();
    expect(screen.getByAltText("Vedoucí")).toBeInTheDocument();
    expect(screen.getByAltText("Vlastník")).toBeInTheDocument();
    await waitFor(() => expect(queryMock).toHaveBeenCalledOnce());
  });

  it("renders public troop data when Convex is healthy", async () => {
    queryMock.mockResolvedValue([
      { _id: "troop-1", name: "Testovací oddíl", logo: null },
    ]);

    render(<PublicTroopBadges />);

    expect(await screen.findByLabelText("Testovací oddíl")).toHaveTextContent(
      "TO",
    );
    expect(queryMock).toHaveBeenCalledOnce();
  });
});
