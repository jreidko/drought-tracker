export type Sport = "mlb" | "nfl";

export type ReportStatus = "live" | "coming-soon";

export type ReportDef = {
  slug: string;
  href: string;
  sport: Sport;
  title: string;
  subtitle: string;
  description: string;
  status: ReportStatus;
  starredStorageKey: string;
};

export const SPORT_ORDER: Sport[] = ["mlb", "nfl"];

export const SPORT_LABEL: Record<Sport, string> = {
  mlb: "MLB",
  nfl: "NFL",
};

const LEGACY_STARRED_KEY = "starredPlayers";

function starredKey(sport: Sport, slug: string) {
  return `starred:${sport}:${slug}`;
}

function nflReport(
  slug: string,
  title: string,
  subtitle: string,
  description: string,
): ReportDef {
  return {
    slug,
    href: `/${slug}`,
    sport: "nfl",
    title,
    subtitle,
    description,
    status: "live",
    starredStorageKey: starredKey("nfl", slug),
  };
}

export const DROUGHT_TRACKER: ReportDef = {
  slug: "droughttracker",
  href: "/droughttracker",
  sport: "mlb",
  title: "Drought Tracker",
  subtitle: "HR Leaderboard",
  description:
    "Top 200 sluggers — projected power, drought streaks, and today's parks.",
  status: "live",
  starredStorageKey: starredKey("mlb", "droughttracker"),
};

export const DROUGHT_TRACKER_LEGACY_STARRED_KEY = LEGACY_STARRED_KEY;

export const PASSING_TDS = nflReport(
  "passing-tds",
  "Passing Touchdowns",
  "QB passing TDs",
  "Quarterback passing touchdown leaders — pace, games today, and opponent.",
);

export const REPORTS: ReportDef[] = [
  DROUGHT_TRACKER,
  PASSING_TDS,
  nflReport(
    "passing-yards",
    "Passing Yards",
    "QB passing yards",
    "Quarterback passing yardage leaders and per-game pace.",
  ),
  nflReport(
    "rushing-tds",
    "Rushing Touchdowns",
    "QB & RB rushing TDs",
    "Rushing touchdowns for quarterbacks and running backs.",
  ),
  nflReport(
    "rushing-yards",
    "Rushing Yards",
    "QB & RB rushing yards",
    "Rushing yardage leaders among quarterbacks and running backs.",
  ),
  nflReport(
    "td-scorers",
    "Touchdown Scorers",
    "Any player TDs",
    "Anyone who finds the end zone — rush, receiving, or return.",
  ),
  nflReport(
    "receptions",
    "Receptions",
    "WR, TE & RB",
    "Catch leaders among receivers and running backs.",
  ),
  nflReport(
    "interceptions",
    "Interceptions",
    "Defensive INTs",
    "Defensive interception leaders.",
  ),
];

export function reportsForSport(sport: Sport): ReportDef[] {
  return REPORTS.filter((report) => report.sport === sport);
}
