import { lookupEspnId } from "@/lib/espn-ids";
import {
  averageHomeRunsPerSeason,
  droughtStreakFromGameHomeRuns,
  projectedSeasonHomeRuns,
} from "@/lib/hr-averages";
import { getPlayerMetadata } from "@/lib/player-metadata";
import type { LeaderboardData, OpposingPitcher, Player, TodayGameInfo } from "@/lib/player";
import {
  fetchPitcherSeasonStatsMap,
  type PitcherSeasonStats,
} from "@/lib/pitcher-stats";
import { fetchTodayScheduleByTeam, type ProbablePitcher, type TodayGame } from "@/lib/today-schedule";
import {
  fetchVenueHrStatsByVenueId,
  type VenueHrStats,
} from "@/lib/venue-hr-stats";

const MLB_STATS_API = "https://statsapi.mlb.com/api/v1";
const CACHE_SECONDS = 900;

type MlbStatSplit = {
  season?: string;
  date?: string;
  isHome?: boolean;
  opponent?: { id: number };
  stat: {
    homeRuns?: number;
    gamesPlayed?: number;
  };
};

type MlbStatsBlock = {
  splits: MlbStatSplit[];
};

type MlbStatsResponse = {
  stats: MlbStatsBlock[];
};

type MlbLeader = {
  person: {
    id: number;
    fullName: string;
  };
};

type MlbLeadersResponse = {
  leagueLeaders?: Array<{
    leaders: MlbLeader[];
  }>;
};

type MlbPersonResponse = {
  people: Array<{
    active: boolean;
    birthDate?: string;
    currentTeam?: { id: number; name: string };
    batSide?: { code: string };
  }>;
};

type GameLogEntry = {
  homeRuns: number;
  isHome: boolean;
  opponentTeamId: number;
};

export function getCurrentMlbSeason(referenceDate = new Date()): number {
  return referenceDate.getFullYear();
}

function parseBatSide(code: string | undefined): "L" | "R" | "S" {
  if (code === "L" || code === "R" || code === "S") return code;
  return "R";
}

async function fetchMlb<T>(path: string): Promise<T> {
  const response = await fetch(`${MLB_STATS_API}${path}`, {
    next: { revalidate: CACHE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`MLB Stats API error ${response.status} for ${path}`);
  }

  return response.json() as Promise<T>;
}

function parseYearByYearStats(response: MlbStatsResponse) {
  const splits = response.stats[0]?.splits ?? [];

  return splits
    .map((split) => ({
      season: Number(split.season),
      homeRuns: split.stat.homeRuns ?? 0,
      gamesPlayed: split.stat.gamesPlayed ?? 0,
    }))
    .filter(({ season }) => Number.isFinite(season));
}

function parseGameLog(response: MlbStatsResponse): GameLogEntry[] {
  const splits = response.stats[0]?.splits ?? [];

  return splits
    .slice()
    .sort((left, right) => (left.date ?? "").localeCompare(right.date ?? ""))
    .map((split) => ({
      homeRuns: split.stat.homeRuns ?? 0,
      isHome: split.isHome ?? false,
      opponentTeamId: split.opponent?.id ?? 0,
    }));
}

function playerStatsAtVenue(
  gameLog: GameLogEntry[],
  todayGame: TodayGame,
  playerTeamId: number,
): { homeRuns: number; games: number } {
  const relevant = gameLog.filter((entry) => {
    if (playerTeamId === todayGame.homeTeamId) {
      return entry.isHome;
    }

    return !entry.isHome && entry.opponentTeamId === todayGame.homeTeamId;
  });

  return {
    homeRuns: relevant.reduce((sum, entry) => sum + entry.homeRuns, 0),
    games: relevant.length,
  };
}

function buildOpposingPitcher(
  probablePitcher: ProbablePitcher | undefined,
  pitcherStatsById: Map<number, PitcherSeasonStats>,
): OpposingPitcher | undefined {
  if (!probablePitcher) {
    return undefined;
  }

  const stats = pitcherStatsById.get(probablePitcher.mlbPlayerId);

  return {
    mlbPlayerId: probablePitcher.mlbPlayerId,
    name: probablePitcher.name,
    record: stats?.record ?? "—",
    era: stats?.era ?? "—",
    whip: stats?.whip ?? "—",
    inningsPitched: stats?.inningsPitched ?? "—",
    strikeOuts: stats?.strikeOuts ?? 0,
    homeRuns: stats?.homeRuns ?? 0,
  };
}

function buildTodayGameInfo(
  todayGame: TodayGame,
  playerTeamId: number,
  venueHrStats: VenueHrStats | undefined,
  gameLog: GameLogEntry[],
  pitcherStatsById: Map<number, PitcherSeasonStats>,
): TodayGameInfo {
  const venueStats = playerStatsAtVenue(gameLog, todayGame, playerTeamId);

  const isHome = playerTeamId === todayGame.homeTeamId;
  const probablePitcher = isHome
    ? todayGame.awayProbablePitcher
    : todayGame.homeProbablePitcher;

  return {
    venueId: todayGame.venueId,
    venueName: todayGame.venueName,
    homeTeamId: todayGame.homeTeamId,
    isHome,
    opposingPitcher: buildOpposingPitcher(probablePitcher, pitcherStatsById),
    hrParkFactor: venueHrStats?.hrParkFactor ?? 100,
    hrParkFactorYearRange: venueHrStats?.yearRange ?? "",
    playerHomeRunsAtVenue: venueStats.homeRuns,
    playerGamesAtVenue: venueStats.games,
  };
}

async function buildPlayerStats(
  mlbPlayerId: number,
  name: string,
  season: number,
  todayGamesByTeam: Map<number, TodayGame>,
  venueHrStatsByVenueId: Map<number, VenueHrStats>,
  pitcherStatsById: Map<number, PitcherSeasonStats>,
): Promise<Player> {
  const [yearByYearResponse, gameLogResponse, personResponse] = await Promise.all([
    fetchMlb<MlbStatsResponse>(
      `/people/${mlbPlayerId}/stats?stats=yearByYear&group=hitting`,
    ),
    fetchMlb<MlbStatsResponse>(
      `/people/${mlbPlayerId}/stats?stats=gameLog&group=hitting&season=${season}`,
    ),
    fetchMlb<MlbPersonResponse>(`/people/${mlbPlayerId}?hydrate=currentTeam`),
  ]);

  const seasons = parseYearByYearStats(yearByYearResponse);
  const currentSeason = seasons.find(({ season: year }) => year === season);
  const gameLog = parseGameLog(gameLogResponse);
  const gameHomeRuns = gameLog.map((entry) => entry.homeRuns);
  const person = personResponse.people[0];
  const teamId = person?.currentTeam?.id;
  const metadata = getPlayerMetadata(mlbPlayerId);
  const espnId =
    metadata.espnId ??
    (await lookupEspnId(name, person?.birthDate));
  const todayGame =
    teamId !== undefined ? todayGamesByTeam.get(teamId) : undefined;
  const gameToday = todayGame !== undefined;

  return {
    name,
    mlbPlayerId,
    ...metadata,
    espnId,
    homeRunsThisSeason: currentSeason?.homeRuns ?? 0,
    projectedSeasonHRs: currentSeason
      ? projectedSeasonHomeRuns(
          currentSeason.homeRuns,
          currentSeason.gamesPlayed,
        )
      : 0,
    droughtStreak: droughtStreakFromGameHomeRuns(gameHomeRuns),
    avgHr1Year: averageHomeRunsPerSeason(seasons, 1, season),
    avgHr3Year: averageHomeRunsPerSeason(seasons, 3, season),
    avgHr5Year: averageHomeRunsPerSeason(seasons, 5, season),
    rosterStatus: person?.active ? "active" : "inactive",
    gameToday,
    todayGame:
      todayGame && teamId !== undefined
        ? buildTodayGameInfo(
            todayGame,
            teamId,
            venueHrStatsByVenueId.get(todayGame.venueId),
            gameLog,
            pitcherStatsById,
          )
        : undefined,
    batSide: parseBatSide(person?.batSide?.code),
    teamId: teamId ?? null,
    teamName: person?.currentTeam?.name ?? null,
  };
}

export async function getLeaderboardPlayers(options?: {
  season?: number;
  limit?: number;
}): Promise<LeaderboardData> {
  const season = options?.season ?? getCurrentMlbSeason();
  const limit = options?.limit ?? 100;

  const [leadersResponse, todayGamesByTeam, venueHrStatsByVenueId] =
    await Promise.all([
      fetchMlb<MlbLeadersResponse>(
        `/stats/leaders?leaderCategories=homeRuns&season=${season}&statGroup=hitting&limit=${limit}`,
      ),
      fetchTodayScheduleByTeam(),
      fetchVenueHrStatsByVenueId(season).catch(() => new Map<number, VenueHrStats>()),
    ]);

  const leaders = leadersResponse.leagueLeaders?.[0]?.leaders ?? [];

  if (leaders.length === 0) {
    throw new Error(`No home run leaders returned for ${season}`);
  }

  const probablePitcherIds = [
    ...new Set(
      [...todayGamesByTeam.values()].flatMap((game) => [
        game.homeProbablePitcher?.mlbPlayerId,
        game.awayProbablePitcher?.mlbPlayerId,
      ]).filter((id): id is number => id !== undefined),
    ),
  ];
  const pitcherStatsById = await fetchPitcherSeasonStatsMap(
    probablePitcherIds,
    season,
  );

  const players = await Promise.all(
    leaders.map((leader) =>
      buildPlayerStats(
        leader.person.id,
        leader.person.fullName,
        season,
        todayGamesByTeam,
        venueHrStatsByVenueId,
        pitcherStatsById,
      ),
    ),
  );

  return {
    players,
    season,
    fetchedAt: new Date().toISOString(),
  };
}
