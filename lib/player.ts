export type Player = {
  name: string;
  mlbPlayerId: number;
  fanGraphsId?: number;
  baseballReferencePath?: string;
  homeRunsThisSeason: number;
  projectedSeasonHRs: number;
  droughtStreak: number;
  avgHr1Year: number | null;
  avgHr3Year: number | null;
  avgHr5Year: number | null;
  rosterStatus: "active" | "inactive";
  gameToday: boolean;
  batSide: "L" | "R" | "S";
  teamId: number | null;
  teamName: string | null;
  espnId?: number;
};

export type LeaderboardData = {
  players: Player[];
  season: number;
  fetchedAt: string;
};
