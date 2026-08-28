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

export type NflPlayer = {
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
  stats: Record<string, number | null>;
};

export type NflLeaderboardData = {
  players: NflPlayer[];
  season: number;
  seasonName: string;
  liveSeasonType: number;
  fetchedAt: string;
};

export const GAMES_IN_NFL_SEASON = 17;
