import {
  GAMES_IN_NFL_SEASON,
  type NflLeaderboardData,
  type NflPlayer,
} from "@/lib/nfl-player";
import type { NflReportSpec } from "@/lib/nfl-reports";
import { slugifyPlayerName } from "@/lib/player-links";
import {
  fetchNflSeasonContext,
  fetchTodayNflScheduleByTeam,
  type NflTodayGame as ScheduleGame,
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

function readAthleteStats(
  meta: EspnCategoryMeta[],
  athleteCategories: EspnAthleteCategory[],
): Record<string, number | null> {
  const stats: Record<string, number | null> = {};

  for (const category of meta) {
    const block = athleteCategories.find((item) => item.name === category.name);
    category.names.forEach((name, offset) => {
      const value = block?.values[offset];
      const numeric =
        typeof value === "number" && Number.isFinite(value) ? value : null;
      stats[`${category.name}.${name}`] = numeric;
    });
  }

  return stats;
}

async function fetchByAthletePage(
  spec: NflReportSpec,
  season: number,
  seasonType: number,
  page: number,
): Promise<EspnByAthleteResponse> {
  const params = new URLSearchParams({
    limit: "100",
    page: String(page),
    category: spec.espnCategory,
    sort: spec.espnSort,
    season: String(season),
    seasontype: String(seasonType),
  });

  const response = await fetch(`${ESPN_BY_ATHLETE}?${params.toString()}`, {
    headers: espnHeaders(),
    next: { revalidate: CACHE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`ESPN ${spec.slug} stats error ${response.status}`);
  }

  return response.json() as Promise<EspnByAthleteResponse>;
}

async function fetchAthletes(
  spec: NflReportSpec,
  season: number,
  seasonType: number,
): Promise<EspnByAthleteResponse> {
  const first = await fetchByAthletePage(spec, season, seasonType, 1);
  const maxPages = Math.max(1, Math.ceil(spec.maxPlayers / 100));
  const pages = Math.min(first.pagination?.pages ?? 1, maxPages);
  if (pages <= 1) {
    return first;
  }

  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, index) =>
      fetchByAthletePage(spec, season, seasonType, index + 2),
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

function toTodayGame(scheduleGame: ScheduleGame, teamId: number): NflPlayer["todayGame"] {
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

function primaryValue(player: NflPlayer, spec: NflReportSpec): number {
  return player.stats[spec.primaryStat] ?? 0;
}

export function nflPerGame(player: NflPlayer, spec: NflReportSpec): number {
  if (player.gamesPlayed === 0) {
    return 0;
  }
  return primaryValue(player, spec) / player.gamesPlayed;
}

export function nflProjected(player: NflPlayer, spec: NflReportSpec): number {
  return Math.round(nflPerGame(player, spec) * GAMES_IN_NFL_SEASON);
}

export function nflStatNumber(player: NflPlayer, stat: string, spec: NflReportSpec): number {
  if (stat === "__perGame") {
    return nflPerGame(player, spec);
  }
  if (stat === "__primary") {
    return primaryValue(player, spec);
  }
  return player.stats[stat] ?? 0;
}

export async function getNflReportPlayers(
  spec: NflReportSpec,
): Promise<NflLeaderboardData> {
  const [liveSeason, scheduleByTeam] = await Promise.all([
    fetchNflSeasonContext(),
    fetchTodayNflScheduleByTeam(),
  ]);

  const statsSeason = statsSeasonForLive(liveSeason.year, liveSeason.type);
  const payload = await fetchAthletes(spec, statsSeason.year, statsSeason.seasonType);
  const meta = payload.categories ?? [];
  const allowed = spec.positions ? new Set(spec.positions) : null;
  const players: NflPlayer[] = [];

  for (const row of payload.athletes ?? []) {
    const position = row.athlete.position?.abbreviation ?? "";
    if (allowed && position && !allowed.has(position)) {
      continue;
    }

    const teamId = row.athlete.teamId ? Number(row.athlete.teamId) : null;
    const scheduleGame = teamId !== null ? scheduleByTeam.get(teamId) : undefined;
    const stats = readAthleteStats(meta, row.categories);

    players.push({
      id: Number(row.athlete.id),
      name: row.athlete.displayName,
      slug: row.athlete.slug ?? slugifyPlayerName(row.athlete.displayName),
      teamId,
      teamName: row.athlete.teamName ?? null,
      teamAbbreviation: row.athlete.teamShortName ?? null,
      position: position || "—",
      rosterStatus: row.athlete.status?.type === "active" ? "active" : "inactive",
      gameToday: Boolean(scheduleGame),
      todayGame:
        teamId !== null && scheduleGame
          ? toTodayGame(scheduleGame, teamId)
          : undefined,
      gamesPlayed: stats["general.gamesPlayed"] ?? 0,
      stats,
    });
  }

  players.sort(
    (a, b) =>
      primaryValue(b, spec) - primaryValue(a, spec) || a.name.localeCompare(b.name),
  );

  return {
    players: players.slice(0, spec.maxPlayers),
    season: payload.requestedSeason?.year ?? statsSeason.year,
    seasonName: payload.requestedSeason?.type?.name ?? "Regular Season",
    liveSeasonType: liveSeason.type,
    fetchedAt: new Date().toISOString(),
  };
}
