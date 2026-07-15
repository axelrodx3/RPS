/** @vitest-environment happy-dom */

import { readFileSync } from "node:fs";
import path from "node:path";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LeaderboardsPageContent } from "@/app/leaderboards/LeaderboardsPageContent";
import { renderWithProviders } from "@/test/render";
import styles from "@/features/practice/components/practice-game.module.css";

describe("LeaderboardsPageContent", () => {
  it("renders the refined leaderboards page shell", () => {
    renderWithProviders(<LeaderboardsPageContent />);
    expect(screen.getByTestId("leaderboard-panel")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "LEADERBOARDS" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Global Ranking" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "My Stats" })).toBeInTheDocument();
    expect(
      screen.getByText(/Global rankings will appear here/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Wagered leaderboards/i)).toBeNull();
  });
});

describe("Match timeline layout", () => {
  it("uses a narrower desktop timeline column", () => {
    const cssPath = path.resolve(
      process.cwd(),
      "src/features/practice/components/practice-game.module.css",
    );
    const css = readFileSync(cssPath, "utf8");
    expect(css).toContain(
      "grid-template-columns: minmax(0, 1fr) clamp(190px, 18vw, 210px)",
    );
    expect(css).toContain(".roundTimelineFilled");
    expect(css).toContain("overflow-y: auto");
    expect(css).toContain("overflow-x: hidden");
  });

  it("defines compact timeline entry and empty state classes", () => {
    expect(styles.roundTimelineEmpty).toBeTruthy();
    expect(styles.roundTimelineFilled).toBeTruthy();
    expect(styles.timelineEntry).toBeTruthy();
  });
});
