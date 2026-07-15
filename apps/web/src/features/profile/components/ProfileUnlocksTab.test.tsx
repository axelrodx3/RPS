/** @vitest-environment happy-dom */

import fs from "node:fs";
import path from "node:path";
import { cleanup, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { DEFAULT_LOCAL_PROFILE } from "@/features/profile/profile-model";
import { ProfileUnlocksTab } from "@/features/profile/components/ProfileUnlocksTab";
import {
  MOVE_ASSET_SETS,
  MOVE_PROFILE_PREVIEW_PRESENTATION,
  PROFILE_PREVIEW_CONTAINER_PX,
  TIER_ONE_SOURCE_FILENAMES,
} from "@/features/practice/moves/move-asset-registry";
import { renderWithProviders } from "@/test/render";

describe("ProfileUnlocksTab move skins", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders seven rock tiers with real preview assets in order", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfileUnlocksTab />);
    await user.click(screen.getByRole("tab", { name: "Rock" }));

    const rockPanel = screen.getByRole("tabpanel", { name: "Rock" });
    const previews = within(rockPanel).getAllByTestId(
      /move-skin-preview-rock-/,
    );
    expect(previews).toHaveLength(7);
    expect(MOVE_ASSET_SETS.rock.skins.map((skin) => skin.tier)).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
    expect(
      within(rockPanel).getByTestId("move-skin-preview-rock-1"),
    ).toBeInTheDocument();
    expect(
      within(rockPanel).getByTestId("move-skin-preview-rock-7"),
    ).toBeInTheDocument();
  });

  it("renders seven paper and scissors tiers with lock overlays on tiers 2 through 7", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfileUnlocksTab />);

    await user.click(screen.getByRole("tab", { name: "Paper" }));
    const paperPanel = screen.getByRole("tabpanel", { name: "Paper" });
    expect(
      within(paperPanel).getAllByTestId(/move-skin-preview-paper-/),
    ).toHaveLength(7);
    expect(within(paperPanel).getAllByText("Equipped")).toHaveLength(1);
    expect(within(paperPanel).getAllByText("🔒")).toHaveLength(6);

    await user.click(screen.getByRole("tab", { name: "Scissors" }));
    const scissorsPanel = screen.getByRole("tabpanel", { name: "Scissors" });
    expect(
      within(scissorsPanel).getAllByTestId(/move-skin-preview-scissors-/),
    ).toHaveLength(7);
    expect(within(scissorsPanel).getAllByText("Equipped")).toHaveLength(1);
    expect(within(scissorsPanel).queryAllByText("🔒")).toHaveLength(6);
  });

  it("marks tier 1 equipped without a lock overlay and tiers 2 through 7 locked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfileUnlocksTab profile={DEFAULT_LOCAL_PROFILE} />);
    await user.click(screen.getByRole("tab", { name: "Rock" }));

    const rockPanel = screen.getByRole("tabpanel", { name: "Rock" });
    const tierOneCard = within(rockPanel)
      .getByText("Rock Tier 1")
      .closest("article");
    const tierTwoCard = within(rockPanel)
      .getByText("Rock Tier 2")
      .closest("article");

    expect(tierOneCard).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Equipped"),
    );
    expect(tierTwoCard).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Locked"),
    );
    expect(
      within(tierOneCard as HTMLElement).getByText("Equipped"),
    ).toBeInTheDocument();
    expect(within(tierOneCard as HTMLElement).queryByText("🔒")).toBeNull();
    expect(
      within(tierTwoCard as HTMLElement).getByText("🔒"),
    ).toBeInTheDocument();
  });

  it("maps tier order to approved source filenames", () => {
    expect(TIER_ONE_SOURCE_FILENAMES.rock).toBe("stone block tier 1.png");
    expect(TIER_ONE_SOURCE_FILENAMES.paper).toBe("blank paper tier 1.png");
    expect(TIER_ONE_SOURCE_FILENAMES.scissors).toBe("1.png");
    expect(MOVE_ASSET_SETS.rock.skins[6]?.sourceFilename).toBe(
      "stone block tier 7.png",
    );
    expect(MOVE_ASSET_SETS.paper.skins[6]?.sourceFilename).toBe(
      "blank paper tier 7.png",
    );
    expect(MOVE_ASSET_SETS.scissors.skins[6]?.sourceFilename).toBe("7.png");
  });

  it("ships runtime PNG and WebP files for all 21 move skins", () => {
    for (const move of ["rock", "paper", "scissors"] as const) {
      for (let tier = 1; tier <= 7; tier += 1) {
        const pngPath = path.resolve(
          process.cwd(),
          `public/assets/moves/skins/${move}/tier-${tier}.png`,
        );
        const webpPath = path.resolve(
          process.cwd(),
          `public/assets/moves/skins/${move}/tier-${tier}.webp`,
        );
        expect(fs.existsSync(pngPath)).toBe(true);
        expect(fs.existsSync(webpPath)).toBe(true);
      }
    }
  });

  it("uses contain-based scissors profile preview settings", () => {
    const cssPath = path.resolve(
      process.cwd(),
      "src/features/profile/profile-panel.module.css",
    );
    const css = fs.readFileSync(cssPath, "utf8");
    expect(MOVE_PROFILE_PREVIEW_PRESENTATION.scissors.maxWidth).toBe("68%");
    expect(MOVE_PROFILE_PREVIEW_PRESENTATION.scissors.padding).toBe("16%");
    expect(css).toContain(".moveSkinPreviewImage");
    expect(css).toContain("object-fit: contain");
    expect(PROFILE_PREVIEW_CONTAINER_PX).toBe(88);
  });
});
