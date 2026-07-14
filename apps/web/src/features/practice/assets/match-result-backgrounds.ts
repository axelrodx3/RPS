export type MatchResultVariant = "victory" | "defeat";

export type MatchResultBackgroundConfig = {
  webp: string;
  png: string;
  objectPosition: string;
  objectPositionMobile: string;
};

export const MATCH_RESULT_BACKGROUNDS: Record<
  MatchResultVariant,
  MatchResultBackgroundConfig
> = {
  victory: {
    webp: "/assets/result-backgrounds/victory-result-bg.webp",
    png: "/assets/result-backgrounds/victory-result-bg.png",
    objectPosition: "center 42%",
    objectPositionMobile: "center 36%",
  },
  defeat: {
    webp: "/assets/result-backgrounds/defeat-result-bg.webp",
    png: "/assets/result-backgrounds/defeat-result-bg.png",
    objectPosition: "center 58%",
    objectPositionMobile: "center 50%",
  },
};
