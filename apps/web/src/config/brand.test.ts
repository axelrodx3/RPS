import { describe, expect, it } from "vitest";
import { brand, environment, getWordmarkSrc } from "@/config/brand";

describe("foundation safety configuration", () => {
  it("identifies the product and keeps real SOL disabled", () => {
    expect(brand.name).toBe("RPS");
    expect(environment.label).toBe("NON-PRODUCTION");
    expect(environment.realSolEnabled).toBe(false);
  });

  it("exposes centralized branding asset paths", () => {
    expect(brand.assets.wordmarkWhite).toBe("/brand/rps-wordmark-white.png");
    expect(brand.assets.wordmarkLime).toBe("/brand/rps-wordmark-lime.png");
    expect(brand.assets.icon).toBe("/brand/rps-icon-header.png");
    expect(brand.assets.icon32).toBe("/brand/rps-icon-32.png");
    expect(getWordmarkSrc("lime")).toBe(brand.assets.wordmarkLime);
  });

  it("uses the exact RPS browser title and favicon assets", () => {
    expect(brand.name).toBe("RPS");
    expect(brand.assets.icon16).toContain("rps-icon-16");
    expect(brand.assets.icon32).toContain("rps-icon-32");
    expect(brand.assets.icon180).toContain("rps-icon-180");
  });
});
