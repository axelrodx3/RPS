/** @vitest-environment happy-dom */

import { cleanup, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { LeaderboardPanel } from "@/features/practice/components/LeaderboardPanel";
import { renderWithProviders } from "@/test/render";

describe("LeaderboardPanel", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("renders a single LEADERBOARDS page heading and Global Ranking tab", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LeaderboardPanel reducedMotion={false} />);
    const panel = screen.getByTestId("leaderboard-panel");

    expect(
      screen.getByRole("heading", { level: 1, name: "LEADERBOARDS" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/competitive hub/i)).toBeNull();
    expect(screen.queryByRole("heading", { name: "Leaderboard" })).toBeNull();
    expect(
      within(panel).getByRole("tab", { name: "Global Ranking" }),
    ).toBeInTheDocument();
    expect(
      within(panel).getByRole("tab", { name: "My Stats" }),
    ).toBeInTheDocument();
    expect(
      within(panel).getByText(/Global rankings will appear here/i),
    ).toBeInTheDocument();
    expect(within(panel).queryByText(/Wagered leaderboards/i)).toBeNull();

    await user.click(within(panel).getByRole("tab", { name: "My Stats" }));
    expect(within(panel).getByText("Favorite Move")).toBeInTheDocument();
    expect(within(panel).getByText("Average Match Length")).toBeInTheDocument();
    expect(within(panel).getByText(/practice stats/i)).toBeInTheDocument();
  });

  it("requires confirmation before resetting statistics", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LeaderboardPanel reducedMotion={false} />);
    const panel = screen.getByTestId("leaderboard-panel");

    await user.click(within(panel).getByRole("tab", { name: "My Stats" }));
    await user.click(
      within(panel).getByRole("button", { name: "Reset Practice statistics" }),
    );
    await user.click(
      within(panel).getByRole("button", { name: "Confirm reset" }),
    );

    expect(within(panel).getAllByText("0").length).toBeGreaterThan(0);
  });
});
