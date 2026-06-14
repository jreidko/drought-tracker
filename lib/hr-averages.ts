type SeasonHomeRuns = {
  season: number;
  homeRuns: number;
};

export function averageHomeRunsPerSeason(
  seasons: SeasonHomeRuns[],
  lookbackYears: number,
  beforeSeason: number,
): number | null {
  const completed = seasons
    .filter(({ season }) => season < beforeSeason)
    .sort((a, b) => a.season - b.season);

  if (completed.length === 0) {
    return null;
  }

  const window = completed.slice(-lookbackYears);
  const total = window.reduce((sum, { homeRuns }) => sum + homeRuns, 0);
  return total / window.length;
}

export const GAMES_IN_MLB_SEASON = 162;

export function averageGamesBetweenHomeRuns(
  averageHomeRunsPerSeason: number | null,
  gamesInSeason: number = GAMES_IN_MLB_SEASON,
): number | null {
  if (averageHomeRunsPerSeason === null || averageHomeRunsPerSeason <= 0) {
    return null;
  }

  return gamesInSeason / averageHomeRunsPerSeason;
}

export function formatAverageHomeRuns(value: number | null): string {
  if (value === null) {
    return "—";
  }

  return value.toFixed(1);
}

export function formatGamesBetweenHomeRuns(
  value: number | null,
  compact = false,
): string {
  if (value === null) {
    return "—";
  }

  if (compact) {
    return `${value.toFixed(1)}g`;
  }

  return `${value.toFixed(1)} g between`;
}
