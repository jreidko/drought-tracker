export type OpposingPitcher = {
  mlbPlayerId: number;
  name: string;
  record: string;
  era: string;
  whip: string;
  inningsPitched: string;
  strikeOuts: number;
  homeRuns: number;
};

export type TodayGameInfo = {
  venueId: number;
  venueName: string;
  homeTeamId: number;
  isHome: boolean;
  opposingPitcher?: OpposingPitcher;
  hrParkFactor: number;
  hrParkFactorYearRange: string;
  playerHomeRunsAtVenue: number;
  playerGamesAtVenue: number;
};

export type Player = {
  name: string;
  mlbPlayerId: number;
  fanGraphsId?: number;
  baseballReferencePath?: string;
  homeRunsThisSeason: number;
  gamesPlayed: number;
  projectedSeasonHRs: number;
  sluggingPct: number | null;
  droughtStreak: number;
  avgHr1Year: number | null;
  avgHr3Year: number | null;
  avgHr5Year: number | null;
  rosterStatus: "active" | "inactive";
  gameToday: boolean;
  todayGame?: TodayGameInfo;
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
