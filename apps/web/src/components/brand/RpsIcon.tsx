import Image from "next/image";
import { brand } from "@/config/brand";
import styles from "./brand.module.css";

type RpsIconProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export function RpsIcon({
  size = 34,
  className = "",
  priority = false,
}: RpsIconProps) {
  const height = Math.round(size * 0.66);

  return (
    <Image
      src={brand.assets.icon}
      alt=""
      aria-hidden="true"
      width={size}
      height={height}
      className={`${styles.icon} ${className}`.trim()}
      priority={priority}
      sizes={`${size}px`}
    />
  );
}
