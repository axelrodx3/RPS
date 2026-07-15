export type StatsSource = "practice-local" | "account";

export type PlayerStatsViewModel = {
  source: StatsSource;
  wins: number;
  losses: number;
  ties: number;
  winRate: number;
  bestWinStreak: number;
  rockUsed: number;
  paperUsed: number;
  scissorsUsed: number;
  favoriteMove: string;
  automaticPicks: number;
  totalMatches: number;
  averageMatchLengthSeconds: number | null;
};

export type StatsMetric = {
  id: string;
  iconKey: string;
  label: string;
  value: string;
  numericValue?: number;
};
