const MLB_STATS_API = "https://statsapi.mlb.com/api/v1";
const CACHE_SECONDS = 900;

export type PitcherSeasonStats = {
  record: string;
  era: string;
  whip: string;
  inningsPitched: string;
  strikeOuts: number;
  homeRuns: number;
};

type MlbPitchingStatSplit = {
  stat: {
    wins?: number;
    losses?: number;
    era?: string;
    whip?: string;
    inningsPitched?: string;
    strikeOuts?: number;
    homeRuns?: number;
  };
};

type MlbPitchingStatsResponse = {
  stats: Array<{
    splits: MlbPitchingStatSplit[];
  }>;
};

const pitcherStatsCache = new Map<string, PitcherSeasonStats>();

function cacheKey(pitcherId: number, season: number): string {
  return `${pitcherId}|${season}`;
}

function parsePitcherSeasonStats(response: MlbPitchingStatsResponse): PitcherSeasonStats | undefined {
  const stat = response.stats[0]?.splits[0]?.stat;

  if (!stat) {
    return undefined;
  }

  const wins = stat.wins ?? 0;
  const losses = stat.losses ?? 0;

  return {
    record: `${wins}-${losses}`,
    era: stat.era ?? "—",
    whip: stat.whip ?? "—",
    inningsPitched: stat.inningsPitched ?? "0.0",
    strikeOuts: stat.strikeOuts ?? 0,
    homeRuns: stat.homeRuns ?? 0,
  };
}

async function fetchPitcherSeasonStats(
  pitcherId: number,
  season: number,
): Promise<PitcherSeasonStats | undefined> {
  const key = cacheKey(pitcherId, season);
  if (pitcherStatsCache.has(key)) {
    return pitcherStatsCache.get(key);
  }

  const response = await fetch(
    `${MLB_STATS_API}/people/${pitcherId}/stats?stats=season&group=pitching&season=${season}`,
    { next: { revalidate: CACHE_SECONDS } },
  );

  if (!response.ok) {
    return undefined;
  }

  const data = (await response.json()) as MlbPitchingStatsResponse;
  const stats = parsePitcherSeasonStats(data);

  if (stats) {
    pitcherStatsCache.set(key, stats);
  }

  return stats;
}

export async function fetchPitcherSeasonStatsMap(
  pitcherIds: number[],
  season: number,
): Promise<Map<number, PitcherSeasonStats>> {
  const uniqueIds = [...new Set(pitcherIds)];
  const entries = await Promise.all(
    uniqueIds.map(async (pitcherId) => {
      const stats = await fetchPitcherSeasonStats(pitcherId, season);
      return [pitcherId, stats] as const;
    }),
  );

  const statsByPitcherId = new Map<number, PitcherSeasonStats>();

  for (const [pitcherId, stats] of entries) {
    if (stats) {
      statsByPitcherId.set(pitcherId, stats);
    }
  }

  return statsByPitcherId;
}
