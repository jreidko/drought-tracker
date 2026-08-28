import {
  GAMES_IN_NFL_SEASON,
  type PassingTdLeaderboardData,
  type PassingTdPlayer,
} from "@/lib/nfl-player";
import {
  fetchNflSeasonContext,
  fetchTodayNflScheduleByTeam,
  type NflTodayGame,
} from "@/lib/nfl-schedule";

const ESPN_BY_ATHLETE =
  "https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/statistics/byathlete";
const CACHE_SECONDS = 900;

type EspnCategoryMeta = {
  name: string;
  names: string[];
};

type EspnAthleteCategory = {
  name: string;
  values: Array<number | null>;
};

type EspnAthleteRow = {
  athlete: {
    id: string;
    displayName: string;
    slug?: string;
    teamId?: string;
    teamName?: string;
    teamShortName?: string;
    position?: { abbreviation?: string };
    status?: { type?: string };
  };
  categories: EspnAthleteCategory[];
};

type EspnByAthleteResponse = {
  pagination?: {
    count: number;
    page: number;
    pages: number;
  };
  requestedSeason?: {
    year: number;
    type?: { name?: string; type?: number };
  };
  categories?: EspnCategoryMeta[];
  athletes?: EspnAthleteRow[];
};

function espnHeaders(): HeadersInit {
  return {
    Accept: "application/json",
    "User-Agent": "Mozilla/5.0 (compatible; chalkdog/0.1)",
  };
}

function statsSeasonForLive(liveYear: number, liveType: number): {
  year: number;
  seasonType: number;
} {
  if (liveType === 1) {
    return { year: liveYear - 1, seasonType: 2 };
  }
  return { year: liveYear, seasonType: 2 };
}

function buildStatReader(meta: EspnCategoryMeta[]) {
  const index = new Map<string, { category: string; offset: number }>();
  for (const category of meta) {
    category.names.forEach((name, offset) => {
      index.set(name, { category: category.name, offset });
    });
  }

  return (
    athleteCategories: EspnAthleteCategory[],
    statName: string,
  ): number | null => {
    const location = index.get(statName);
    if (!location) {
      return null;
    }
    const block = athleteCategories.find((item) => item.name === location.category);
    const value = block?.values[location.offset];
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  };
}

async function fetchByAthletePage(
  season: number,
  seasonType: number,
  page: number,
): Promise<EspnByAthleteResponse> {
  const params = new URLSearchParams({
    limit: "100",
    page: String(page),
    category: "offense:passing",
    sort: "passing.passingTouchdowns:desc",
    season: String(season),
    seasontype: String(seasonType),
  });

  const response = await fetch(`${ESPN_BY_ATHLETE}?${params.toString()}`, {
    headers: espnHeaders(),
    next: { revalidate: CACHE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`ESPN passing stats error ${response.status}`);
  }

  return response.json() as Promise<EspnByAthleteResponse>;
}

async function fetchPassingAthletes(
  season: number,
  seasonType: number,
): Promise<EspnByAthleteResponse> {
  const first = await fetchByAthletePage(season, seasonType, 1);
  const pages = first.pagination?.pages ?? 1;
  if (pages <= 1) {
    return first;
  }

  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, index) =>
      fetchByAthletePage(season, seasonType, index + 2),
    ),
  );

  return {
    ...first,
    athletes: [
      ...(first.athletes ?? []),
      ...rest.flatMap((page) => page.athletes ?? []),
    ],
  };
}

function toTodayGame(
  scheduleGame: NflTodayGame,
  teamId: number,
): PassingTdPlayer["todayGame"] {
  const isHome = scheduleGame.homeTeamId === teamId;
  return {
    venueName: scheduleGame.venueName,
    homeTeamId: scheduleGame.homeTeamId,
    homeTeamAbbreviation: scheduleGame.homeTeamAbbreviation,
    isHome,
    opponentTeamId: isHome ? scheduleGame.awayTeamId : scheduleGame.homeTeamId,
    opponentName: isHome ? scheduleGame.awayTeamName : scheduleGame.homeTeamName,
    opponentAbbreviation: isHome
      ? scheduleGame.awayTeamAbbreviation
      : scheduleGame.homeTeamAbbreviation,
    statusText: scheduleGame.statusText,
  };
}

export async function getPassingTdPlayers(): Promise<PassingTdLeaderboardData> {
  const [liveSeason, scheduleByTeam] = await Promise.all([
    fetchNflSeasonContext(),
    fetchTodayNflScheduleByTeam(),
  ]);

  const statsSeason = statsSeasonForLive(liveSeason.year, liveSeason.type);
  const payload = await fetchPassingAthletes(
    statsSeason.year,
    statsSeason.seasonType,
  );

  const readStat = buildStatReader(payload.categories ?? []);
  const players: PassingTdPlayer[] = [];

  for (const row of payload.athletes ?? []) {
    const position = row.athlete.position?.abbreviation ?? "";
    if (position && position !== "QB") {
      continue;
    }

    const teamId = row.athlete.teamId ? Number(row.athlete.teamId) : null;
    const scheduleGame =
      teamId !== null ? scheduleByTeam.get(teamId) : undefined;
    const gamesPlayed = readStat(row.categories, "gamesPlayed") ?? 0;
    const passingTouchdowns = readStat(row.categories, "passingTouchdowns") ?? 0;

    players.push({
      id: Number(row.athlete.id),
      name: row.athlete.displayName,
      slug: row.athlete.slug ?? "",
      teamId,
      teamName: row.athlete.teamName ?? null,
      teamAbbreviation: row.athlete.teamShortName ?? null,
      position: position || "QB",
      rosterStatus:
        row.athlete.status?.type === "active" ? "active" : "inactive",
      gameToday: Boolean(scheduleGame),
      todayGame:
        teamId !== null && scheduleGame
          ? toTodayGame(scheduleGame, teamId)
          : undefined,
      gamesPlayed,
      passingTouchdowns,
      passingYards: readStat(row.categories, "passingYards") ?? 0,
      passingAttempts: readStat(row.categories, "passingAttempts") ?? 0,
      completions: readStat(row.categories, "completions") ?? 0,
      completionPct: readStat(row.categories, "completionPct"),
      interceptions: readStat(row.categories, "interceptions") ?? 0,
      passerRating: readStat(row.categories, "QBRating"),
      passingYardsPerGame: readStat(row.categories, "passingYardsPerGame"),
      projectedSeasonTds:
        gamesPlayed > 0
          ? Math.round((passingTouchdowns / gamesPlayed) * GAMES_IN_NFL_SEASON)
          : 0,
    });
  }

  players.sort(
    (a, b) =>
      b.passingTouchdowns - a.passingTouchdowns ||
      b.passingYards - a.passingYards ||
      a.name.localeCompare(b.name),
  );

  return {
    players,
    season: payload.requestedSeason?.year ?? statsSeason.year,
    seasonName: payload.requestedSeason?.type?.name ?? "Regular Season",
    liveSeasonType: liveSeason.type,
    fetchedAt: new Date().toISOString(),
  };
}
