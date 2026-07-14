export type MatchResultVariant = "victory" | "defeat";

export type MatchResultBackgroundConfig = {
  webp: string;
  png: string;
  /** Soft blurred full-bleed layer */
  bleedPosition: string;
  bleedPositionMobile: string;
  /** Sharp foreground layer */
  sharpPosition: string;
  sharpPositionMobile: string;
};

export const MATCH_RESULT_BACKGROUNDS: Record<
  MatchResultVariant,
  MatchResultBackgroundConfig
> = {
  victory: {
    webp: "/assets/result-backgrounds/victory-result-bg.webp",
    png: "/assets/result-backgrounds/victory-result-bg.png",
    bleedPosition: "center 62%",
    bleedPositionMobile: "center 58%",
    sharpPosition: "center 88%",
    sharpPositionMobile: "center 84%",
  },
  defeat: {
    webp: "/assets/result-backgrounds/defeat-result-bg.webp",
    png: "/assets/result-backgrounds/defeat-result-bg.png",
    bleedPosition: "center 60%",
    bleedPositionMobile: "center 56%",
    sharpPosition: "center 90%",
    sharpPositionMobile: "center 86%",
  },
};

export const MATCH_RESULT_ASPECT_RATIO = "16 / 10";

export function getMatchResultAsset(variant: MatchResultVariant) {
  return MATCH_RESULT_BACKGROUNDS[variant];
}

export function preloadMatchResultAsset(variant: MatchResultVariant) {
  if (typeof window === "undefined") return;

  const asset = MATCH_RESULT_BACKGROUNDS[variant];
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = asset.webp;
  link.type = "image/webp";
  document.head.append(link);
}
