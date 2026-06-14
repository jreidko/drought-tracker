export type Player = {
  name: string;
  mlbPlayerId: number;
  fanGraphsId?: number;
  baseballReferencePath?: string;
  projectedSeasonHRs: number;
  droughtStreak: number;
  avgHr1Year: number | null;
  avgHr5Year: number | null;
  avgHr10Year: number | null;
};

export type LeaderboardData = {
  players: Player[];
  season: number;
  fetchedAt: string;
};
