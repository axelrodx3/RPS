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

  it("shows leaderboard placeholder and my stats tabs", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LeaderboardPanel reducedMotion={false} />);
    const panel = screen.getByTestId("leaderboard-panel");

    expect(panel).toBeInTheDocument();
    expect(
      within(panel).getByRole("tab", { name: "Leaderboard" }),
    ).toBeInTheDocument();
    expect(within(panel).getByText("Wagered leaderboards")).toBeInTheDocument();

    await user.click(within(panel).getByRole("tab", { name: "My Stats" }));
    expect(within(panel).getByText("Favorite Move")).toBeInTheDocument();
    expect(within(panel).getByText("Average Match Length")).toBeInTheDocument();
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
