export type NflTodayGame = {
  venueName: string;
  homeTeamId: number;
  homeTeamAbbreviation: string;
  isHome: boolean;
  opponentTeamId: number;
  opponentName: string;
  opponentAbbreviation: string;
  statusText: string;
};

export type PassingTdPlayer = {
  id: number;
  name: string;
  slug: string;
  teamId: number | null;
  teamName: string | null;
  teamAbbreviation: string | null;
  position: string;
  rosterStatus: "active" | "inactive";
  gameToday: boolean;
  todayGame?: NflTodayGame;
  gamesPlayed: number;
  passingTouchdowns: number;
  passingYards: number;
  passingAttempts: number;
  completions: number;
  completionPct: number | null;
  interceptions: number;
  passerRating: number | null;
  passingYardsPerGame: number | null;
  projectedSeasonTds: number;
};

export type PassingTdLeaderboardData = {
  players: PassingTdPlayer[];
  season: number;
  seasonName: string;
  liveSeasonType: number;
  fetchedAt: string;
};

export const GAMES_IN_NFL_SEASON = 17;
