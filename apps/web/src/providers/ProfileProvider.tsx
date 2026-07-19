"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Move } from "@/features/practice/engine/practice-engine";
import {
  getMoveSkinById,
  getDefaultMoveSkin,
} from "@/features/practice/moves/move-asset-registry";
import { getPlayerAvatar } from "@/features/identity/avatar-registry";
import {
  DEFAULT_LOCAL_PROFILE,
  type LocalProfile,
} from "@/features/profile/profile-model";
import type {
  CosmeticPreviewTarget,
  ProfileNavigationState,
  UnlockCategory,
} from "@/features/profile/profile-navigation";
import { DEFAULT_PROFILE_NAVIGATION } from "@/features/profile/profile-navigation";
import {
  mergeStoredProfileWithDefaults,
  readStoredLocalProfile,
  toStoredLocalProfile,
  writeStoredLocalProfile,
} from "@/lib/storage/local-profile-storage";

type PreviewState = CosmeticPreviewTarget & {
  returnFocusRef: React.RefObject<HTMLElement | null> | null;
};

type ProfileContextValue = {
  profile: LocalProfile;
  ready: boolean;
  preview: PreviewState | null;
  openPreview: (
    target: CosmeticPreviewTarget,
    returnFocusRef?: React.RefObject<HTMLElement | null> | null,
  ) => void;
  closePreview: () => void;
  equipPreviewTarget: () => boolean;
  equipAvatar: (avatarId: string) => boolean;
  equipMoveSkin: (move: Move, skinId: string) => boolean;
  isAvatarUnlocked: (avatarId: string) => boolean;
  isMoveSkinUnlocked: (move: Move, skinId: string) => boolean;
  isAvatarEquipped: (avatarId: string) => boolean;
  isMoveSkinEquipped: (move: Move, skinId: string) => boolean;
  navigation: ProfileNavigationState;
  setNavigation: (navigation: ProfileNavigationState) => void;
  navigateToUnlockItem: (
    category: UnlockCategory,
    itemId: string,
  ) => ProfileNavigationState;
  queuePreviewFromNavigation: (target: CosmeticPreviewTarget) => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<LocalProfile>(DEFAULT_LOCAL_PROFILE);
  const [ready, setReady] = useState(false);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [navigation, setNavigationState] = useState<ProfileNavigationState>(
    DEFAULT_PROFILE_NAVIGATION,
  );

  const setNavigation = useCallback((next: ProfileNavigationState) => {
    setNavigationState((current) => {
      if (
        current.tab === next.tab &&
        current.category === next.category &&
        current.itemId === next.itemId
      ) {
        return current;
      }
      return next;
    });
  }, []);
  const queuedPreviewRef = useRef<CosmeticPreviewTarget | null>(null);

  useEffect(() => {
    const stored = readStoredLocalProfile(window.localStorage);
    // Hydrate local profile once on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time localStorage hydration
    setProfile(mergeStoredProfileWithDefaults(stored));
    setReady(true);
  }, []);

  const persistProfile = useCallback((next: LocalProfile) => {
    setProfile(next);
    writeStoredLocalProfile(window.localStorage, toStoredLocalProfile(next));
  }, []);

  const isAvatarUnlocked = useCallback(
    (avatarId: string) => profile.unlockedAvatarIds.includes(avatarId),
    [profile.unlockedAvatarIds],
  );

  const isMoveSkinUnlocked = useCallback(
    (move: Move, skinId: string) => {
      const key =
        move === "rock"
          ? profile.unlockedRockSkinIds
          : move === "paper"
            ? profile.unlockedPaperSkinIds
            : profile.unlockedScissorsSkinIds;
      return key.includes(skinId);
    },
    [
      profile.unlockedPaperSkinIds,
      profile.unlockedRockSkinIds,
      profile.unlockedScissorsSkinIds,
    ],
  );

  const isAvatarEquipped = useCallback(
    (avatarId: string) => profile.equipped.avatarId === avatarId,
    [profile.equipped.avatarId],
  );

  const isMoveSkinEquipped = useCallback(
    (move: Move, skinId: string) => {
      if (move === "rock") return profile.equipped.rockSkinId === skinId;
      if (move === "paper") return profile.equipped.paperSkinId === skinId;
      return profile.equipped.scissorsSkinId === skinId;
    },
    [profile.equipped],
  );

  const equipAvatar = useCallback(
    (avatarId: string) => {
      if (!isAvatarUnlocked(avatarId)) return false;
      getPlayerAvatar(avatarId);
      persistProfile({
        ...profile,
        avatarId,
        equipped: {
          ...profile.equipped,
          avatarId,
        },
      });
      return true;
    },
    [isAvatarUnlocked, persistProfile, profile],
  );

  const equipMoveSkin = useCallback(
    (move: Move, skinId: string) => {
      if (!isMoveSkinUnlocked(move, skinId)) return false;
      getMoveSkinById(move, skinId);
      persistProfile({
        ...profile,
        equipped: {
          ...profile.equipped,
          rockSkinId: move === "rock" ? skinId : profile.equipped.rockSkinId,
          paperSkinId: move === "paper" ? skinId : profile.equipped.paperSkinId,
          scissorsSkinId:
            move === "scissors" ? skinId : profile.equipped.scissorsSkinId,
        },
      });
      return true;
    },
    [isMoveSkinUnlocked, persistProfile, profile],
  );

  const openPreview = useCallback(
    (
      target: CosmeticPreviewTarget,
      returnFocusRef: React.RefObject<HTMLElement | null> | null = null,
    ) => {
      setPreview({ ...target, returnFocusRef });
    },
    [],
  );

  const closePreview = useCallback(() => {
    setPreview((current) => {
      current?.returnFocusRef?.current?.focus();
      return null;
    });
  }, []);

  const equipPreviewTarget = useCallback(() => {
    if (!preview) return false;
    if (preview.kind === "avatar") {
      return equipAvatar(preview.itemId);
    }
    return equipMoveSkin(preview.kind, preview.itemId);
  }, [equipAvatar, equipMoveSkin, preview]);

  const queuePreviewFromNavigation = useCallback(
    (target: CosmeticPreviewTarget) => {
      queuedPreviewRef.current = target;
    },
    [],
  );

  const navigateToUnlockItem = useCallback(
    (category: UnlockCategory, itemId: string) => {
      const next: ProfileNavigationState = {
        tab: "unlocks",
        category,
        itemId,
      };
      setNavigation(next);
      queuePreviewFromNavigation({
        kind:
          category === "avatars"
            ? "avatar"
            : category === "rock"
              ? "rock"
              : category === "paper"
                ? "paper"
                : "scissors",
        itemId,
        category,
      });
      return next;
    },
    [queuePreviewFromNavigation, setNavigation],
  );

  useEffect(() => {
    if (!ready || navigation.tab !== "unlocks" || !navigation.itemId) return;
    const queued = queuedPreviewRef.current;
    if (!queued || queued.itemId !== navigation.itemId) return;
    openPreview(queued);
    queuedPreviewRef.current = null;
  }, [navigation, openPreview, ready]);

  const value = useMemo(
    () => ({
      profile,
      ready,
      preview,
      openPreview,
      closePreview,
      equipPreviewTarget,
      equipAvatar,
      equipMoveSkin,
      isAvatarUnlocked,
      isMoveSkinUnlocked,
      isAvatarEquipped,
      isMoveSkinEquipped,
      navigation,
      setNavigation,
      navigateToUnlockItem,
      queuePreviewFromNavigation,
    }),
    [
      profile,
      ready,
      preview,
      openPreview,
      closePreview,
      equipPreviewTarget,
      equipAvatar,
      equipMoveSkin,
      isAvatarUnlocked,
      isMoveSkinUnlocked,
      isAvatarEquipped,
      isMoveSkinEquipped,
      navigation,
      navigateToUnlockItem,
      queuePreviewFromNavigation,
      setNavigation,
    ],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return context;
}

export function useProfileOptional() {
  return useContext(ProfileContext);
}

export function useEquippedLoadout() {
  const context = useProfileOptional();
  if (!context) {
    return DEFAULT_LOCAL_PROFILE.equipped;
  }
  return context.profile.equipped;
}

export function resolveEquippedMoveSkin(
  move: Move,
  skinId: string | null | undefined,
  unlockedIds: string[],
) {
  if (skinId && unlockedIds.includes(skinId)) {
    try {
      return getMoveSkinById(move, skinId);
    } catch {
      return getDefaultMoveSkin(move);
    }
  }
  return getDefaultMoveSkin(move);
}
