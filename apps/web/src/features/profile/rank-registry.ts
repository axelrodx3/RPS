export type RankDefinition = {
  id: string;
  tier: number;
  name: string;
};

export const RANK_LADDER: RankDefinition[] = [
  { id: "rookie", tier: 1, name: "Rookie" },
  { id: "bronze", tier: 2, name: "Bronze" },
  { id: "silver", tier: 3, name: "Silver" },
  { id: "gold", tier: 4, name: "Gold" },
  { id: "platinum", tier: 5, name: "Platinum" },
  { id: "diamond", tier: 6, name: "Diamond" },
  { id: "champion", tier: 7, name: "Champion" },
];

export const HIGHEST_RANK_ID = "champion";

export function getRankById(rankId: string): RankDefinition {
  const rank = RANK_LADDER.find((entry) => entry.id === rankId);
  if (rank) return rank;
  return RANK_LADDER[0]!;
}

export function getRankByTier(tier: number): RankDefinition {
  const rank = RANK_LADDER.find((entry) => entry.tier === tier);
  if (rank) return rank;
  return RANK_LADDER[0]!;
}

export type RankStepState = "completed" | "current" | "locked" | "highest";

export function getRankStepState(
  rank: RankDefinition,
  profileRankId: string,
): RankStepState {
  const currentRank = getRankById(profileRankId);

  if (rank.id === profileRankId) {
    return "current";
  }

  if (rank.tier < currentRank.tier) {
    return "completed";
  }

  if (rank.id === HIGHEST_RANK_ID) {
    return "highest";
  }

  return "locked";
}
