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
  size?: number;
};

export function PlayerAvatar({
  avatarId = DEFAULT_PLAYER_AVATAR_ID,
  className = "",
  size = AVATAR_CONTAINER_SIZE_PX,
}: PlayerAvatarProps) {
  const avatar = getPlayerAvatar(avatarId);

  return (
    <div
      className={`${styles.playerAvatar} ${className}`.trim()}
      style={{
        width: size,
        height: size,
      }}
    >
      <Image
        src={avatar.assetPath}
        alt={avatar.accessibleName}
        width={size}
        height={size}
        className={styles.avatarImage}
      />
    </div>
  );
}
