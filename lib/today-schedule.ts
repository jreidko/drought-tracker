const MLB_STATS_API = "https://statsapi.mlb.com/api/v1";
const CACHE_SECONDS = 900;

export type ProbablePitcher = {
  mlbPlayerId: number;
  name: string;
};

export type TodayGame = {
  venueId: number;
  venueName: string;
  homeTeamId: number;
  homeTeamName: string;
  awayTeamId: number;
  awayTeamName: string;
  homeProbablePitcher?: ProbablePitcher;
  awayProbablePitcher?: ProbablePitcher;
};

type MlbScheduleTeam = {
  team: { id: number; name: string };
  probablePitcher?: {
    id: number;
    fullName: string;
  };
};

type MlbScheduleResponse = {
  dates: Array<{
    games: Array<{
      venue: {
        id: number;
        name: string;
      };
      teams: {
        home: MlbScheduleTeam;
        away: MlbScheduleTeam;
      };
    }>;
  }>;
};

function parseProbablePitcher(
  pitcher: MlbScheduleTeam["probablePitcher"],
): ProbablePitcher | undefined {
  if (!pitcher?.fullName) {
    return undefined;
  }

  return {
    mlbPlayerId: pitcher.id,
    name: pitcher.fullName,
  };
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function fetchTodayScheduleByTeam(): Promise<Map<number, TodayGame>> {
  const today = formatDate(new Date());
  const response = await fetch(
    `${MLB_STATS_API}/schedule?sportId=1&date=${today}&hydrate=venue,probablePitcher`,
    { next: { revalidate: CACHE_SECONDS } },
  );

  if (!response.ok) {
    throw new Error(`MLB Stats API error ${response.status} for today's schedule`);
  }

  const data = (await response.json()) as MlbScheduleResponse;
  const gamesByTeam = new Map<number, TodayGame>();

  for (const date of data.dates) {
    for (const game of date.games) {
      const todayGame: TodayGame = {
        venueId: game.venue.id,
        venueName: game.venue.name,
        homeTeamId: game.teams.home.team.id,
        homeTeamName: game.teams.home.team.name,
        awayTeamId: game.teams.away.team.id,
        awayTeamName: game.teams.away.team.name,
        homeProbablePitcher: parseProbablePitcher(game.teams.home.probablePitcher),
        awayProbablePitcher: parseProbablePitcher(game.teams.away.probablePitcher),
      };

      gamesByTeam.set(todayGame.homeTeamId, todayGame);
      gamesByTeam.set(todayGame.awayTeamId, todayGame);
    }
  }

  return gamesByTeam;
}
