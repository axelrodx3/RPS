/** @vitest-environment happy-dom */

import { cleanup, screen, within } from "@testing-library/react";
import { describe, expect, it, afterEach } from "vitest";
import { LeaderboardPanel } from "@/features/practice/components/LeaderboardPanel";
import { renderWithProviders } from "@/test/render";

describe("LeaderboardPanel", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a single LEADERBOARDS page heading and global ranking placeholder", () => {
    renderWithProviders(<LeaderboardPanel reducedMotion={false} />);
    const panel = screen.getByTestId("leaderboard-panel");

    expect(
      screen.getByRole("heading", { level: 1, name: "LEADERBOARDS" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/competitive hub/i)).toBeNull();
    expect(screen.queryByRole("heading", { name: "Leaderboard" })).toBeNull();
    expect(
      within(panel).getByText(/Global rankings will appear here/i),
    ).toBeInTheDocument();
    expect(within(panel).queryByRole("tab", { name: "My Stats" })).toBeNull();
    expect(within(panel).queryByText(/Wagered leaderboards/i)).toBeNull();
    expect(within(panel).queryByText(/Practice stats/i)).toBeNull();
  });
});
