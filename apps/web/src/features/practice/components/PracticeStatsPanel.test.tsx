/** @vitest-environment happy-dom */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { PracticeStatsPanel } from "@/features/practice/components/PracticeStatsPanel";
import { renderWithProviders } from "@/test/render";

describe("PracticeStatsPanel", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("requires confirmation before resetting statistics", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PracticeStatsPanel />);

    await user.click(
      screen.getByRole("button", { name: "Reset Practice statistics" }),
    );
    await user.click(screen.getByRole("button", { name: "Confirm reset" }));

    expect(screen.getByText("Matches played")).toBeInTheDocument();
    expect(screen.getAllByText("0")[0]).toBeInTheDocument();
  });
});
