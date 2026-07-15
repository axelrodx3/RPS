import { describe, expect, it } from "vitest";
import {
  HIGHEST_RANK_ID,
  RANK_LADDER,
  getRankById,
  getRankByTier,
  getRankStepState,
} from "@/features/profile/rank-registry";

describe("rank registry", () => {
  it("defines exactly seven ranks ending at champion", () => {
    expect(RANK_LADDER).toHaveLength(7);
    expect(RANK_LADDER[0]?.name).toBe("Rookie");
    expect(RANK_LADDER[6]?.name).toBe("Champion");
    expect(HIGHEST_RANK_ID).toBe("champion");
    expect(RANK_LADDER.some((rank) => rank.name === "Master")).toBe(false);
  });

  it("resolves ranks by id and tier", () => {
    expect(getRankById("gold").name).toBe("Gold");
    expect(getRankByTier(5).name).toBe("Platinum");
  });

  it("marks earlier ranks completed and later ranks locked for bronze", () => {
    expect(getRankStepState(RANK_LADDER[0]!, "bronze")).toBe("completed");
    expect(getRankStepState(RANK_LADDER[1]!, "bronze")).toBe("current");
    expect(getRankStepState(RANK_LADDER[2]!, "bronze")).toBe("locked");
    expect(getRankStepState(RANK_LADDER[6]!, "bronze")).toBe("highest");
  });
});
