const SAVANT_PARK_FACTORS_URL =
  "https://baseballsavant.mlb.com/leaderboard/statcast-park-factors";
const CACHE_SECONDS = 86_400;

export type VenueHrStats = {
  hrParkFactor: number;
  yearRange: string;
};

type SavantParkFactorRow = {
  venue_id: string;
  venue_name: string;
  index_hr: string;
  year_range: string;
};

const venueStatsCache = new Map<number, Map<number, VenueHrStats>>();

function parseSavantParkFactors(html: string): SavantParkFactorRow[] {
  const match = html.match(/var data = (\[.*?\]);/);

  if (!match) {
    throw new Error("Could not parse park factors from Baseball Savant");
  }

  return JSON.parse(match[1]) as SavantParkFactorRow[];
}

export async function fetchVenueHrStatsByVenueId(
  season: number,
): Promise<Map<number, VenueHrStats>> {
  if (venueStatsCache.has(season)) {
    return venueStatsCache.get(season)!;
  }

  const url = `${SAVANT_PARK_FACTORS_URL}?type=year&year=${season}&stat=index_hr&condition=All&sort=1&sortDir=desc`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "drought-tracker/1.0",
    },
    next: { revalidate: CACHE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`Baseball Savant park factors error ${response.status}`);
  }

  const html = await response.text();
  const rows = parseSavantParkFactors(html);
  const statsByVenueId = new Map<number, VenueHrStats>();

  for (const row of rows) {
    statsByVenueId.set(Number(row.venue_id), {
      hrParkFactor: Number(row.index_hr),
      yearRange: row.year_range,
    });
  }

  venueStatsCache.set(season, statsByVenueId);
  return statsByVenueId;
}

export function describeHrParkFactor(factor: number): string {
  if (factor >= 110) {
    return "Hitter-friendly";
  }
  if (factor <= 90) {
    return "Pitcher-friendly";
  }
  return "Neutral";
}
