"use client";

import Image from "next/image";
import { AVATAR_TIERS } from "@/features/identity/avatar-registry";
import { MoveArt } from "@/features/practice/components/battle-arena/MoveArt";
import { MOVE_ASSET_SETS } from "@/features/practice/moves/move-asset-registry";
import {
  DEFAULT_LOCAL_PROFILE,
  type LocalProfile,
} from "@/features/profile/profile-model";
import styles from "../profile-panel.module.css";

type ProfileUnlocksTabProps = {
  profile?: LocalProfile;
};

function isUnlocked(unlockedIds: string[], id: string): boolean {
  return unlockedIds.includes(id);
}

export function ProfileUnlocksTab({
  profile = DEFAULT_LOCAL_PROFILE,
}: ProfileUnlocksTabProps) {
  return (
    <div className={styles.overviewGrid}>
      <section className={styles.unlockCategory}>
        <h3>Avatars</h3>
        <div className={styles.cosmeticGrid}>
          {AVATAR_TIERS.map((avatar) => {
            const unlocked = isUnlocked(profile.unlockedAvatarIds, avatar.id);
            return (
              <article
                key={avatar.id}
                className={`${styles.cosmeticCard} ${unlocked ? "" : styles.cosmeticLocked}`.trim()}
                aria-label={`${avatar.displayName}, tier ${avatar.tier}${unlocked ? ", unlocked" : ", locked"}`}
              >
                <div className={styles.cosmeticPreview}>
                  {avatar.previewPath ? (
                    <Image
                      src={avatar.previewPath}
                      alt=""
                      aria-hidden="true"
                      width={48}
                      height={48}
                    />
                  ) : (
                    <span className={styles.cosmeticPlaceholder}>
                      T{avatar.tier}
                    </span>
                  )}
                </div>
                <p className={styles.cosmeticName}>{avatar.displayName}</p>
                <p className={styles.cosmeticTier}>Tier {avatar.tier}</p>
                {!unlocked ? (
                  <span className={styles.lockOverlay}>Locked</span>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      {(["rock", "paper", "scissors"] as const).map((move) => {
        const unlockedKey =
          move === "rock"
            ? profile.unlockedRockSkinIds
            : move === "paper"
              ? profile.unlockedPaperSkinIds
              : profile.unlockedScissorsSkinIds;

        return (
          <section key={move} className={styles.unlockCategory}>
            <h3>{move.charAt(0).toUpperCase() + move.slice(1)}</h3>
            <div className={styles.cosmeticGrid}>
              {MOVE_ASSET_SETS[move].skins.map((skin) => {
                const unlocked = isUnlocked(unlockedKey, skin.skinId);
                return (
                  <article
                    key={skin.skinId}
                    className={`${styles.cosmeticCard} ${unlocked ? "" : styles.cosmeticLocked}`.trim()}
                    aria-label={`${skin.displayName}${unlocked ? ", unlocked" : ", locked"}`}
                  >
                    <div className={styles.cosmeticPreview}>
                      {skin.active ? (
                        <MoveArt move={move} variant="timeline" />
                      ) : (
                        <span className={styles.cosmeticPlaceholder}>
                          T{skin.tier}
                        </span>
                      )}
                    </div>
                    <p className={styles.cosmeticName}>{skin.displayName}</p>
                    <p className={styles.cosmeticTier}>Tier {skin.tier}</p>
                    {!unlocked ? (
                      <span className={styles.lockOverlay}>Locked</span>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
