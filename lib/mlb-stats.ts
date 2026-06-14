import {
  averageHomeRunsPerSeason,
  droughtStreakFromGameHomeRuns,
  projectedSeasonHomeRuns,
} from "@/lib/hr-averages";
import { getPlayerMetadata } from "@/lib/player-metadata";
import type { LeaderboardData, Player } from "@/lib/player";

const MLB_STATS_API = "https://statsapi.mlb.com/api/v1";
const CACHE_SECONDS = 900;

type MlbStatSplit = {
  season?: string;
  date?: string;
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

export function getCurrentMlbSeason(referenceDate = new Date()): number {
  return referenceDate.getFullYear();
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

function parseGameLogHomeRuns(response: MlbStatsResponse): number[] {
  const splits = response.stats[0]?.splits ?? [];

  return splits
    .slice()
    .sort((left, right) => (left.date ?? "").localeCompare(right.date ?? ""))
    .map((split) => split.stat.homeRuns ?? 0);
}

async function buildPlayerStats(
  mlbPlayerId: number,
  name: string,
  season: number,
): Promise<Player> {
  const [yearByYearResponse, gameLogResponse] = await Promise.all([
    fetchMlb<MlbStatsResponse>(
      `/people/${mlbPlayerId}/stats?stats=yearByYear&group=hitting`,
    ),
    fetchMlb<MlbStatsResponse>(
      `/people/${mlbPlayerId}/stats?stats=gameLog&group=hitting&season=${season}`,
    ),
  ]);

  const seasons = parseYearByYearStats(yearByYearResponse);
  const currentSeason = seasons.find(({ season: year }) => year === season);
  const gameHomeRuns = parseGameLogHomeRuns(gameLogResponse);

  return {
    name,
    mlbPlayerId,
    ...getPlayerMetadata(mlbPlayerId),
    projectedSeasonHRs: currentSeason
      ? projectedSeasonHomeRuns(
          currentSeason.homeRuns,
          currentSeason.gamesPlayed,
        )
      : 0,
    droughtStreak: droughtStreakFromGameHomeRuns(gameHomeRuns),
    avgHr1Year: averageHomeRunsPerSeason(seasons, 1, season),
    avgHr5Year: averageHomeRunsPerSeason(seasons, 5, season),
    avgHr10Year: averageHomeRunsPerSeason(seasons, 10, season),
  };
}

export async function getLeaderboardPlayers(options?: {
  season?: number;
  limit?: number;
}): Promise<LeaderboardData> {
  const season = options?.season ?? getCurrentMlbSeason();
  const limit = options?.limit ?? 50;

  const leadersResponse = await fetchMlb<MlbLeadersResponse>(
    `/stats/leaders?leaderCategories=homeRuns&season=${season}&statGroup=hitting&limit=${limit}`,
  );

  const leaders = leadersResponse.leagueLeaders?.[0]?.leaders ?? [];

  if (leaders.length === 0) {
    throw new Error(`No home run leaders returned for ${season}`);
  }

  const players = await Promise.all(
    leaders.map((leader) =>
      buildPlayerStats(leader.person.id, leader.person.fullName, season),
    ),
  );

  return {
    players,
    season,
    fetchedAt: new Date().toISOString(),
  };
}
