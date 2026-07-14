"use client";

import Image from "next/image";
import {
  AVATAR_CONTAINER_SIZE_PX,
  DEFAULT_PLAYER_AVATAR_ID,
  getPlayerAvatar,
} from "@/features/identity/avatar-registry";
import styles from "@/features/practice/components/practice-game.module.css";

type PlayerAvatarProps = {
  avatarId?: string;
  className?: string;
};

export function PlayerAvatar({
  avatarId = DEFAULT_PLAYER_AVATAR_ID,
  className = "",
}: PlayerAvatarProps) {
  const avatar = getPlayerAvatar(avatarId);

  return (
    <div
      className={`${styles.playerAvatar} ${className}`.trim()}
      style={{
        width: AVATAR_CONTAINER_SIZE_PX,
        height: AVATAR_CONTAINER_SIZE_PX,
      }}
    >
      <Image
        src={avatar.assetPath}
        alt={avatar.accessibleName}
        width={AVATAR_CONTAINER_SIZE_PX}
        height={AVATAR_CONTAINER_SIZE_PX}
        className={styles.avatarImage}
      />
    </div>
  );
}
