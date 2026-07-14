export const brand = {
  name: "RPS",
  tagline: "Competitive play. Verifiable rules.",
  description:
    "A production-quality Solana Rock Paper Scissors platform currently in foundation planning.",
  assets: {
    icon: "/brand/rps-icon.png",
    icon16: "/brand/rps-icon-16.png",
    icon32: "/brand/rps-icon-32.png",
    icon48: "/brand/rps-icon-48.png",
    icon180: "/brand/rps-icon-180.png",
    wordmarkWhite: "/brand/rps-wordmark-white.png",
    wordmarkLime: "/brand/rps-wordmark-lime.png",
    socialPreview: "/brand/rps-wordmark-white.png",
  },
} as const;

export type BrandWordmarkVariant = "white" | "lime";

export function getWordmarkSrc(variant: BrandWordmarkVariant): string {
  return variant === "lime"
    ? brand.assets.wordmarkLime
    : brand.assets.wordmarkWhite;
}

export const environment = {
  label: "NON-PRODUCTION",
  network: "Development only",
  realSolEnabled: false,
} as const;
