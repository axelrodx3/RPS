export const brand = {
  name: "RPS",
  tagline: "Competitive play. Verifiable rules.",
  description:
    "A production-quality Solana Rock Paper Scissors platform currently in foundation planning.",
  assets: {
    logo: "/brand/logo-placeholder.svg",
    wordmark: "/brand/wordmark-placeholder.svg",
    favicon: "/brand/favicon-placeholder.svg",
    socialPreview: "/brand/social-preview-placeholder.svg",
  },
} as const;

export const environment = {
  label: "NON-PRODUCTION",
  network: "Development only",
  realSolEnabled: false,
} as const;
