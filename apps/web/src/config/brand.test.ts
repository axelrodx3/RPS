import { describe, expect, it } from "vitest";
import { brand, environment } from "./brand";

describe("foundation safety configuration", () => {
  it("identifies the product and keeps real SOL disabled", () => {
    expect(brand.name).toBe("RPS");
    expect(environment.label).toBe("NON-PRODUCTION");
    expect(environment.realSolEnabled).toBe(false);
  });
});
