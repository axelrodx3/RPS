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
  return (
    <Image
      src={brand.assets.icon}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={`${styles.icon} ${className}`.trim()}
      priority={priority}
      sizes={`${size}px`}
    />
  );
}
