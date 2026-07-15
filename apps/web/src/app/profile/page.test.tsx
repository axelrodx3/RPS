/** @vitest-environment happy-dom */

import { readFileSync } from "node:fs";
import path from "node:path";
import { cleanup, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { ProfilePageContent } from "@/app/profile/ProfilePageContent";
import { AVATAR_TIERS } from "@/features/identity/avatar-registry";
import { MOVE_ASSET_SETS } from "@/features/practice/moves/move-asset-registry";
import { HIGHEST_RANK_ID, RANK_LADDER } from "@/features/profile/rank-registry";
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

  it("shows overview identity and practice summary by default", () => {
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
    expect(within(overviewPanel).getByText("Level 3")).toBeInTheDocument();
    expect(within(overviewPanel).getByText("Bronze")).toBeInTheDocument();
    expect(
      within(overviewPanel).getByText("Practice performance"),
    ).toBeInTheDocument();
  });

  it("lists seven avatars and seven skins per move in unlocks", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePageContent />);
    await user.click(screen.getByRole("tab", { name: "Unlocks" }));

    expect(AVATAR_TIERS).toHaveLength(7);
    expect(MOVE_ASSET_SETS.rock.skins).toHaveLength(7);
    expect(MOVE_ASSET_SETS.paper.skins).toHaveLength(7);
    expect(MOVE_ASSET_SETS.scissors.skins).toHaveLength(7);

    expect(screen.getByText("Avatars")).toBeInTheDocument();
    expect(screen.getByText("Robot")).toBeInTheDocument();
    expect(screen.getAllByText("Locked").length).toBeGreaterThan(20);
  });

  it("shows champion as the highest rank and excludes master", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePageContent />);
    await user.click(screen.getByRole("tab", { name: "Progress" }));

    expect(RANK_LADDER).toHaveLength(7);
    expect(HIGHEST_RANK_ID).toBe("champion");
    expect(RANK_LADDER.some((rank) => rank.name === "Master")).toBe(false);
    expect(screen.getByText("Champion")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("reuses the shared practice stats panel in stats tab", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePageContent />);
    await user.click(screen.getByRole("tab", { name: "Stats" }));

    const statsPanel = screen.getByRole("tabpanel", { name: "Stats" });
    expect(within(statsPanel).getByText("Practice stats")).toBeInTheDocument();
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
    expect(css).not.toContain(".timelineEmptyIcon");
    expect(css).not.toMatch(/\.timelineEntry[\s\S]*overflow:\s*hidden/);
  });
});
