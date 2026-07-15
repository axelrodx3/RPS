/** @vitest-environment happy-dom */

import { readFileSync } from "node:fs";
import path from "node:path";
import { cleanup, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { ProfilePageContent } from "@/app/profile/ProfilePageContent";
import { AVATAR_TIERS } from "@/features/identity/avatar-registry";
import { MOVE_ASSET_SETS } from "@/features/practice/moves/move-asset-registry";
import {
  HIGHEST_RANK_ID,
  RANK_LADDER,
} from "@/features/profile/rank-registry";
import { renderWithProviders } from "@/test/render";

describe("ProfilePageContent", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the profile foundation with four tabs", () => {
    renderWithProviders(<ProfilePageContent />);
    expect(screen.getByTestId("profile-panel")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "PROFILE" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Unlocks" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Progress" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Stats" })).toBeInTheDocument();
  });

  it("shows overview hero identity and performance snapshot by default", () => {
    renderWithProviders(<ProfilePageContent />);
    const overviewPanel = screen.getByRole("tabpanel", {
      name: "Overview",
    });

    expect(
      within(overviewPanel).getByRole("heading", {
        level: 2,
        name: "Player",
      }),
    ).toBeInTheDocument();
    expect(
      within(overviewPanel).getAllByText("Level 3").length,
    ).toBeGreaterThan(0);
    expect(within(overviewPanel).getByText("Bronze")).toBeInTheDocument();
    expect(
      within(overviewPanel).getByText("Equipped loadout"),
    ).toBeInTheDocument();
    expect(
      within(overviewPanel).getByText("Performance snapshot"),
    ).toBeInTheDocument();
    expect(within(overviewPanel).getByText("Next reward")).toBeInTheDocument();
    expect(
      within(overviewPanel).getByText("180 XP remaining"),
    ).toBeInTheDocument();
  });

  it("shows one unlock category at a time with seven tiers each", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePageContent />);
    await user.click(screen.getByRole("tab", { name: "Unlocks" }));

    expect(AVATAR_TIERS).toHaveLength(7);
    expect(MOVE_ASSET_SETS.rock.skins).toHaveLength(7);
    expect(MOVE_ASSET_SETS.paper.skins).toHaveLength(7);
    expect(MOVE_ASSET_SETS.scissors.skins).toHaveLength(7);

    const unlocksPanel = screen.getByRole("tabpanel", { name: "Unlocks" });
    expect(within(unlocksPanel).getByText("Robot")).toBeInTheDocument();
    expect(within(unlocksPanel).queryByText("Rock Tier 1")).toBeNull();

    await user.click(within(unlocksPanel).getByRole("tab", { name: "Rock" }));
    expect(within(unlocksPanel).getByText("Rock Tier 1")).toBeInTheDocument();
    expect(within(unlocksPanel).queryByText("Robot")).toBeNull();
  });

  it("shows champion as the highest rank and completed ranks before bronze", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePageContent />);
    await user.click(screen.getByRole("tab", { name: "Progress" }));

    expect(RANK_LADDER).toHaveLength(7);
    expect(HIGHEST_RANK_ID).toBe("champion");
    expect(RANK_LADDER.some((rank) => rank.name === "Master")).toBe(false);
    const progressPanel = screen.getByRole("tabpanel", { name: "Progress" });
    expect(within(progressPanel).getByText("Champion")).toBeInTheDocument();
    expect(
      within(progressPanel).getByRole("progressbar", {
        name: "Level 3 progress",
      }),
    ).toBeInTheDocument();
    expect(within(progressPanel).getByText("Completed")).toBeInTheDocument();
    expect(
      within(progressPanel).getByText("Account progression"),
    ).toBeInTheDocument();
    expect(
      within(progressPanel).getByText("Competitive rank"),
    ).toBeInTheDocument();
  });

  it("reuses the shared practice stats panel in stats tab", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePageContent />);
    await user.click(screen.getByRole("tab", { name: "Stats" }));

    const statsPanel = screen.getByRole("tabpanel", { name: "Stats" });
    expect(within(statsPanel).getByText("Practice stats")).toBeInTheDocument();
    expect(within(statsPanel).getByText("Match record")).toBeInTheDocument();
    expect(within(statsPanel).getByText("Move usage")).toBeInTheDocument();
    expect(within(statsPanel).getByText("Wins")).toBeInTheDocument();
    expect(within(statsPanel).getByText("Total Matches")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Reset Practice statistics" }),
    ).toBeNull();
  });
});

describe("Match timeline layout cleanup", () => {
  it("uses balanced arena grid spacing without clipping overflow tricks on entries", () => {
    const cssPath = path.resolve(
      process.cwd(),
      "src/features/practice/components/practice-game.module.css",
    );
    const css = readFileSync(cssPath, "utf8");
    expect(css).toContain(
      "grid-template-columns: minmax(0, 1fr) minmax(0, clamp(180px, 16vw, 200px))",
    );
    expect(css).toContain("width: 100%");
    expect(css).toContain("max-width: 100%");
    expect(css).toContain("minmax(0, 1fr)");
    expect(css).not.toContain(".timelineEmptyIcon");
    expect(css).not.toMatch(/\.timelineEntry[\s\S]*overflow:\s*hidden/);
  });
});
