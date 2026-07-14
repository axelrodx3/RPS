"use client";

import Image from "next/image";
import {
  AVATAR_CONTAINER_SIZE_PX,
  getBotAvatar,
} from "@/features/identity/avatar-registry";
import styles from "@/features/practice/components/practice-game.module.css";

type BotAvatarProps = {
  className?: string;
};

export function BotAvatar({ className = "" }: BotAvatarProps) {
  const avatar = getBotAvatar();

  return (
    <div
      className={`${styles.cpuAvatar} ${className}`.trim()}
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
