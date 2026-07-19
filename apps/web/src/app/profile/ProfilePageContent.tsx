"use client";

import { Suspense, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProfilePanel } from "@/features/profile/components/ProfilePanel";
import { CosmeticPreviewDialog } from "@/features/profile/components/CosmeticPreviewDialog";
import {
  buildProfileHref,
  parseProfileNavigation,
  type ProfileNavigationState,
} from "@/features/profile/profile-navigation";
import { useProfile } from "@/providers/ProfileProvider";
import { useSettings } from "@/providers/SettingsProvider";
import styles from "./profile-page.module.css";

function ProfilePageInner() {
  const { settings } = useSettings();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { navigation, setNavigation, queuePreviewFromNavigation } =
    useProfile();

  useEffect(() => {
    const parsed = parseProfileNavigation(searchParams);
    setNavigation(parsed);
    if (parsed.tab === "unlocks" && parsed.itemId) {
      queuePreviewFromNavigation({
        kind:
          parsed.category === "avatars"
            ? "avatar"
            : parsed.category === "rock"
              ? "rock"
              : parsed.category === "paper"
                ? "paper"
                : "scissors",
        itemId: parsed.itemId,
        category: parsed.category,
      });
    }
    // Sync URL params into profile navigation once when search params change.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- searchParams identity is stable per navigation event
  }, [searchParams.toString(), queuePreviewFromNavigation, setNavigation]);

  const handleNavigationChange = useCallback(
    (next: ProfileNavigationState) => {
      setNavigation(next);
      router.replace(buildProfileHref(next), { scroll: false });
    },
    [router, setNavigation],
  );

  return (
    <>
      <ProfilePanel
        reducedMotion={settings.reducedMotion}
        navigation={navigation}
        onNavigationChange={handleNavigationChange}
      />
      <CosmeticPreviewDialog />
    </>
  );
}

export function ProfilePageContent() {
  return (
    <div className={styles.page}>
      <Suspense
        fallback={<div className={styles.pageLoading}>Loading profile…</div>}
      >
        <ProfilePageInner />
      </Suspense>
    </div>
  );
}
