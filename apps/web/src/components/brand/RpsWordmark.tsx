import Image from "next/image";
import {
  brand,
  getWordmarkSrc,
  type BrandWordmarkVariant,
} from "@/config/brand";
import styles from "./brand.module.css";

type RpsWordmarkProps = {
  variant?: BrandWordmarkVariant;
  animated?: boolean;
  priority?: boolean;
  className?: string;
  width?: number;
  label?: string;
};

export function RpsWordmark({
  variant = "white",
  animated = false,
  priority = false,
  className = "",
  width = 640,
  label = brand.name,
}: RpsWordmarkProps) {
  const src = getWordmarkSrc(variant);
  const height = Math.round(width * 0.22);

  const image = (
    <Image
      src={src}
      alt={animated ? "" : label}
      width={width}
      height={height}
      className={`${styles.wordmarkImage} ${className}`.trim()}
      priority={priority}
      sizes="(max-width: 430px) 88vw, (max-width: 880px) 72vw, 640px"
    />
  );

  if (!animated) {
    return image;
  }

  return (
    <div
      className={styles.wordmarkInteractive}
      tabIndex={0}
      aria-label={`${label} wordmark`}
    >
      {image}
    </div>
  );
}
