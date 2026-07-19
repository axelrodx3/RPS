export type ProfilePanelTab = "overview" | "unlocks" | "progress" | "stats";

export type UnlockCategory = "avatars" | "rock" | "paper" | "scissors";

export type ProfileNavigationState = {
  tab: ProfilePanelTab;
  category: UnlockCategory;
  itemId: string | null;
};

export const DEFAULT_PROFILE_NAVIGATION: ProfileNavigationState = {
  tab: "overview",
  category: "avatars",
  itemId: null,
};

const PROFILE_TABS: ProfilePanelTab[] = [
  "overview",
  "unlocks",
  "progress",
  "stats",
];

const UNLOCK_CATEGORIES: UnlockCategory[] = [
  "avatars",
  "rock",
  "paper",
  "scissors",
];

export function parseProfileTab(value: string | null): ProfilePanelTab {
  if (value && PROFILE_TABS.includes(value as ProfilePanelTab)) {
    return value as ProfilePanelTab;
  }
  return "overview";
}

export function parseUnlockCategory(value: string | null): UnlockCategory {
  if (value && UNLOCK_CATEGORIES.includes(value as UnlockCategory)) {
    return value as UnlockCategory;
  }
  return "avatars";
}

export function parseProfileNavigation(
  searchParams: URLSearchParams,
): ProfileNavigationState {
  return {
    tab: parseProfileTab(searchParams.get("tab")),
    category: parseUnlockCategory(searchParams.get("category")),
    itemId: searchParams.get("item"),
  };
}

export function buildProfileSearchParams(
  navigation: ProfileNavigationState,
): URLSearchParams {
  const params = new URLSearchParams();
  if (navigation.tab !== "overview") {
    params.set("tab", navigation.tab);
  }
  if (navigation.tab === "unlocks" && navigation.category !== "avatars") {
    params.set("category", navigation.category);
  }
  if (navigation.itemId) {
    params.set("item", navigation.itemId);
  }
  return params;
}

export function buildProfileHref(
  navigation: Partial<ProfileNavigationState>,
  current: ProfileNavigationState = DEFAULT_PROFILE_NAVIGATION,
): string {
  const next: ProfileNavigationState = {
    tab: navigation.tab ?? current.tab,
    category: navigation.category ?? current.category,
    itemId:
      navigation.itemId === undefined ? current.itemId : navigation.itemId,
  };
  const params = buildProfileSearchParams(next);
  const query = params.toString();
  return query ? `/profile?${query}` : "/profile";
}

export type CosmeticPreviewTarget = {
  kind: "avatar" | "rock" | "paper" | "scissors";
  itemId: string;
  category: UnlockCategory;
};

export function getUnlockCategoryForPreviewKind(
  kind: CosmeticPreviewTarget["kind"],
): UnlockCategory {
  if (kind === "avatar") return "avatars";
  return kind;
}

export function inferPreviewKindFromItemId(
  itemId: string,
): CosmeticPreviewTarget["kind"] | null {
  if (itemId.startsWith("avatar-tier-")) return "avatar";
  if (itemId.startsWith("rock-tier-")) return "rock";
  if (itemId.startsWith("paper-tier-")) return "paper";
  if (itemId.startsWith("scissors-tier-")) return "scissors";
  return null;
}

export function buildPreviewTarget(
  itemId: string,
): CosmeticPreviewTarget | null {
  const kind = inferPreviewKindFromItemId(itemId);
  if (!kind) return null;
  return {
    kind,
    itemId,
    category: getUnlockCategoryForPreviewKind(kind),
  };
}
