import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { ProfileProvider, useProfile } from "./ProfileProvider";
import { LOCAL_PROFILE_STORAGE_KEY } from "@/lib/storage/local-profile-storage";

function wrapper({ children }: { children: ReactNode }) {
  return <ProfileProvider>{children}</ProfileProvider>;
}

describe("ProfileProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("equips only one avatar and persists locally", () => {
    const fixture = {
      schemaVersion: 1,
      equippedAvatarId: "avatar-tier-1",
      equippedRockSkinId: "rock-tier-1",
      equippedPaperSkinId: "paper-tier-1",
      equippedScissorsSkinId: "scissors-tier-1",
      unlockedAvatarIds: ["avatar-tier-1", "avatar-tier-2"],
      unlockedRockSkinIds: ["rock-tier-1"],
      unlockedPaperSkinIds: ["paper-tier-1"],
      unlockedScissorsSkinIds: ["scissors-tier-1"],
    };
    window.localStorage.setItem(
      LOCAL_PROFILE_STORAGE_KEY,
      JSON.stringify(fixture),
    );

    const { result } = renderHook(() => useProfile(), { wrapper });

    act(() => {
      result.current.equipAvatar("avatar-tier-2");
    });

    expect(result.current.profile.equipped.avatarId).toBe("avatar-tier-2");
    expect(result.current.isAvatarEquipped("avatar-tier-2")).toBe(true);
    expect(result.current.isAvatarEquipped("avatar-tier-1")).toBe(false);

    const saved = JSON.parse(
      window.localStorage.getItem(LOCAL_PROFILE_STORAGE_KEY) ?? "{}",
    );
    expect(saved.equippedAvatarId).toBe("avatar-tier-2");
  });

  it("falls back invalid equipped ids to tier 1 defaults", () => {
    window.localStorage.setItem(
      LOCAL_PROFILE_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        equippedAvatarId: "avatar-tier-99",
        equippedRockSkinId: "rock-tier-99",
        equippedPaperSkinId: "paper-tier-99",
        equippedScissorsSkinId: "scissors-tier-99",
        unlockedAvatarIds: ["avatar-tier-1"],
        unlockedRockSkinIds: ["rock-tier-1"],
        unlockedPaperSkinIds: ["paper-tier-1"],
        unlockedScissorsSkinIds: ["scissors-tier-1"],
      }),
    );

    const { result } = renderHook(() => useProfile(), { wrapper });

    expect(result.current.profile.equipped.avatarId).toBe("avatar-tier-1");
    expect(result.current.profile.equipped.rockSkinId).toBe("rock-tier-1");
  });
});
