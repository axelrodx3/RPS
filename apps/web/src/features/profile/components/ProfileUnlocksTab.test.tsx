/** @vitest-environment happy-dom */

import fs from "node:fs";
import path from "node:path";
import { cleanup, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AVATAR_FANART_SOURCE_FILES,
  AVATAR_TIERS,
} from "@/features/identity/avatar-registry";
import { ProfileUnlocksTab } from "@/features/profile/components/ProfileUnlocksTab";
import {
  MOVE_ASSET_SETS,
  MOVE_PROFILE_PREVIEW_PRESENTATION,
  PROFILE_PREVIEW_CONTAINER_PX,
  TIER_ONE_SOURCE_FILENAMES,
} from "@/features/practice/moves/move-asset-registry";
import { renderWithProviders } from "@/test/render";

const defaultProps = {
  activeCategory: "avatars" as const,
  onCategoryChange: vi.fn(),
};

describe("ProfileUnlocksTab avatars", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders seven avatar tiers with real preview assets", () => {
    renderWithProviders(<ProfileUnlocksTab {...defaultProps} />);
    const avatarPanel = screen.getByRole("tabpanel", { name: "Avatars" });
    const previews = within(avatarPanel).getAllByTestId(/avatar-preview-/);
    expect(previews).toHaveLength(7);
    expect(within(avatarPanel).getByText("Robot")).toBeInTheDocument();
    expect(within(avatarPanel).getByText("Avatar Tier 7")).toBeInTheDocument();
  });

  it("shows tier 1 equipped and tiers 2 through 7 locked with artwork visible", () => {
    renderWithProviders(<ProfileUnlocksTab {...defaultProps} />);
    const avatarPanel = screen.getByRole("tabpanel", { name: "Avatars" });

    expect(within(avatarPanel).getAllByText("Equipped")).toHaveLength(1);
    expect(within(avatarPanel).getAllByText("Locked")).toHaveLength(6);
    expect(within(avatarPanel).getAllByText("🔒")).toHaveLength(6);
    expect(
      within(avatarPanel).getByTestId("avatar-preview-2"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Future unlock — not available in Practice yet"),
    ).toBeNull();
  });

  it("maps fan art source filenames to avatar tiers 2 through 7", () => {
    AVATAR_FANART_SOURCE_FILES.forEach((sourceFilename, index) => {
      expect(AVATAR_TIERS[index + 1]?.sourceFilename).toBe(sourceFilename);
    });
  });
});

describe("ProfileUnlocksTab move skins", () => {
  afterEach(() => {
    cleanup();
  });

  it("uses vertical category navigation instead of a horizontal pill row", () => {
    const cssPath = path.resolve(
      process.cwd(),
      "src/features/profile/profile-panel.module.css",
    );
    const css = fs.readFileSync(cssPath, "utf8");
    expect(css).toContain(".categorySidebar");
    expect(css).toContain(".categoryFilterList");
    expect(css).toMatch(/\.categoryFilterList[\s\S]*display:\s*none/);
  });

  it("renders seven rock tiers with real preview assets in order", () => {
    renderWithProviders(
      <ProfileUnlocksTab {...defaultProps} activeCategory="rock" />,
    );

    const rockPanel = screen.getByRole("tabpanel", { name: "Rock" });
    const previews = within(rockPanel).getAllByTestId(
      /move-skin-preview-rock-/,
    );
    expect(previews).toHaveLength(7);
    expect(MOVE_ASSET_SETS.rock.skins.map((skin) => skin.tier)).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
  });

  it("renders seven paper and scissors tiers with lock overlays on tiers 2 through 7", async () => {
    renderWithProviders(
      <ProfileUnlocksTab {...defaultProps} activeCategory="paper" />,
    );
    const paperPanel = screen.getByRole("tabpanel", { name: "Paper" });
    expect(
      within(paperPanel).getAllByTestId(/move-skin-preview-paper-/),
    ).toHaveLength(7);
    expect(within(paperPanel).getAllByText("Equipped")).toHaveLength(1);
    expect(within(paperPanel).getAllByText("Locked")).toHaveLength(6);

    cleanup();
    renderWithProviders(
      <ProfileUnlocksTab {...defaultProps} activeCategory="scissors" />,
    );
    const scissorsPanel = screen.getByRole("tabpanel", { name: "Scissors" });
    expect(
      within(scissorsPanel).getAllByTestId(/move-skin-preview-scissors-/),
    ).toHaveLength(7);
    expect(within(scissorsPanel).getAllByText("Equipped")).toHaveLength(1);
    expect(within(scissorsPanel).getAllByText("Locked")).toHaveLength(6);
  });

  it("maps tier order to approved source filenames", () => {
    expect(TIER_ONE_SOURCE_FILENAMES.rock).toBe("stone block tier 1.png");
    expect(TIER_ONE_SOURCE_FILENAMES.paper).toBe("blank paper tier 1.png");
    expect(TIER_ONE_SOURCE_FILENAMES.scissors).toBe("1.png");
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

  it("uses contain-based profile preview settings", () => {
    const cssPath = path.resolve(
      process.cwd(),
      "src/features/profile/profile-panel.module.css",
    );
    const css = fs.readFileSync(cssPath, "utf8");
    expect(MOVE_PROFILE_PREVIEW_PRESENTATION.scissors.maxWidth).toBe("68%");
    expect(css).toContain(".avatarPreviewImage");
    expect(css).toContain("object-fit: contain");
    expect(PROFILE_PREVIEW_CONTAINER_PX).toBe(88);
  });
});
