import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CosmeticPreviewDialog } from "./CosmeticPreviewDialog";
import { ProfileProvider, useProfile } from "@/providers/ProfileProvider";
import { LOCAL_PROFILE_STORAGE_KEY } from "@/lib/storage/local-profile-storage";

function PreviewHarness({
  target,
}: {
  target: {
    kind: "avatar";
    itemId: string;
    category: "avatars";
  };
}) {
  const { openPreview } = useProfile();

  return (
    <>
      <button
        type="button"
        onClick={() =>
          openPreview({
            kind: target.kind,
            itemId: target.itemId,
            category: target.category,
          })
        }
      >
        Open preview
      </button>
      <CosmeticPreviewDialog />
    </>
  );
}

describe("CosmeticPreviewDialog", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    window.localStorage.clear();
  });

  it("opens locked cosmetic and disables equip", async () => {
    window.localStorage.setItem(
      LOCAL_PROFILE_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        equippedAvatarId: "avatar-tier-1",
        equippedRockSkinId: "rock-tier-1",
        equippedPaperSkinId: "paper-tier-1",
        equippedScissorsSkinId: "scissors-tier-1",
        unlockedAvatarIds: ["avatar-tier-1"],
        unlockedRockSkinIds: ["rock-tier-1"],
        unlockedPaperSkinIds: ["paper-tier-1"],
        unlockedScissorsSkinIds: ["scissors-tier-1"],
      }),
    );

    const user = userEvent.setup();
    render(
      <ProfileProvider>
        <PreviewHarness
          target={{
            kind: "avatar",
            itemId: "avatar-tier-2",
            category: "avatars",
          }}
        />
      </ProfileProvider>,
    );

    await user.click(screen.getByRole("button", { name: /open preview/i }));

    expect(screen.getByTestId("cosmetic-preview-dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^locked$/i })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /close preview/i }));
    expect(
      screen.queryByTestId("cosmetic-preview-dialog"),
    ).not.toBeInTheDocument();
  });

  it("equips unlocked cosmetic and closes on escape", async () => {
    window.localStorage.setItem(
      LOCAL_PROFILE_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        equippedAvatarId: "avatar-tier-1",
        equippedRockSkinId: "rock-tier-1",
        equippedPaperSkinId: "paper-tier-1",
        equippedScissorsSkinId: "scissors-tier-1",
        unlockedAvatarIds: ["avatar-tier-1", "avatar-tier-2"],
        unlockedRockSkinIds: ["rock-tier-1"],
        unlockedPaperSkinIds: ["paper-tier-1"],
        unlockedScissorsSkinIds: ["scissors-tier-1"],
      }),
    );

    const user = userEvent.setup();
    render(
      <ProfileProvider>
        <PreviewHarness
          target={{
            kind: "avatar",
            itemId: "avatar-tier-2",
            category: "avatars",
          }}
        />
      </ProfileProvider>,
    );

    await user.click(screen.getByRole("button", { name: /open preview/i }));
    await user.click(screen.getByRole("button", { name: /^equip$/i }));

    const saved = JSON.parse(
      window.localStorage.getItem(LOCAL_PROFILE_STORAGE_KEY) ?? "{}",
    );
    expect(saved.equippedAvatarId).toBe("avatar-tier-2");
    expect(
      screen.queryByTestId("cosmetic-preview-dialog"),
    ).not.toBeInTheDocument();
  });

  it("closes when clicking the backdrop", async () => {
    const user = userEvent.setup();
    render(
      <ProfileProvider>
        <PreviewHarness
          target={{
            kind: "avatar",
            itemId: "avatar-tier-1",
            category: "avatars",
          }}
        />
      </ProfileProvider>,
    );

    await user.click(screen.getByRole("button", { name: /open preview/i }));
    await user.click(screen.getByTestId("cosmetic-preview-backdrop"));
    expect(
      screen.queryByTestId("cosmetic-preview-dialog"),
    ).not.toBeInTheDocument();
  });
});
