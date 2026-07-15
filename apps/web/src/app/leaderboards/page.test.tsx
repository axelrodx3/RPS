/** @vitest-environment happy-dom */

import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LeaderboardsPageContent } from "@/app/leaderboards/LeaderboardsPageContent";
import { renderWithProviders } from "@/test/render";

describe("LeaderboardsPageContent", () => {
  it("renders the tabbed leaderboard panel", () => {
    renderWithProviders(<LeaderboardsPageContent />);
    expect(screen.getByTestId("leaderboard-panel")).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Leaderboard" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "My Stats" })).toBeInTheDocument();
    expect(screen.getByText("Wagered leaderboards")).toBeInTheDocument();
  });
});
