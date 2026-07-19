/** @vitest-environment happy-dom */

import { describe, expect, it } from "vitest";
import {
  buildProfileHref,
  parseProfileNavigation,
  parseProfileTab,
  parseUnlockCategory,
} from "@/features/profile/profile-navigation";

describe("profile navigation", () => {
  it("parses tab, category, and item query params safely", () => {
    const params = new URLSearchParams(
      "tab=unlocks&category=rock&item=rock-tier-2",
    );
    expect(parseProfileNavigation(params)).toEqual({
      tab: "unlocks",
      category: "rock",
      itemId: "rock-tier-2",
    });
  });

  it("falls back for invalid query values", () => {
    expect(parseProfileTab("invalid")).toBe("overview");
    expect(parseUnlockCategory("invalid")).toBe("avatars");
    expect(
      parseProfileNavigation(new URLSearchParams("tab=bad&category=nope")),
    ).toEqual({
      tab: "overview",
      category: "avatars",
      itemId: null,
    });
  });

  it("builds profile hrefs without empty params", () => {
    expect(buildProfileHref({ tab: "overview" })).toBe("/profile");
    expect(
      buildProfileHref({
        tab: "unlocks",
        category: "avatars",
        itemId: "avatar-tier-2",
      }),
    ).toBe("/profile?tab=unlocks&item=avatar-tier-2");
  });
});
