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

export const PASSING_TDS: ReportDef = {
  slug: "passing-tds",
  href: "/passing-tds",
  sport: "nfl",
  title: "Passing Touchdowns",
  subtitle: "QB passing TDs",
  description:
    "Quarterback passing touchdown leaders — pace, games today, and opponent.",
  status: "live",
  starredStorageKey: starredKey("nfl", "passing-tds"),
};

export const REPORTS: ReportDef[] = [
  DROUGHT_TRACKER,
  PASSING_TDS,
  {
    slug: "passing-yards",
    href: "/passing-yards",
    sport: "nfl",
    title: "Passing Yards",
    subtitle: "QB passing yards",
    description: "Quarterback passing yardage leaders and per-game pace.",
    status: "coming-soon",
    starredStorageKey: starredKey("nfl", "passing-yards"),
  },
  {
    slug: "rushing-tds",
    href: "/rushing-tds",
    sport: "nfl",
    title: "Rushing Touchdowns",
    subtitle: "QB & RB rushing TDs",
    description: "Rushing touchdowns for quarterbacks and running backs.",
    status: "coming-soon",
    starredStorageKey: starredKey("nfl", "rushing-tds"),
  },
  {
    slug: "rushing-yards",
    href: "/rushing-yards",
    sport: "nfl",
    title: "Rushing Yards",
    subtitle: "QB & RB rushing yards",
    description: "Rushing yardage leaders among quarterbacks and running backs.",
    status: "coming-soon",
    starredStorageKey: starredKey("nfl", "rushing-yards"),
  },
  {
    slug: "td-scorers",
    href: "/td-scorers",
    sport: "nfl",
    title: "Touchdown Scorers",
    subtitle: "Any player TDs",
    description:
      "Anyone who finds the end zone — rush, receiving, return, or defensive.",
    status: "coming-soon",
    starredStorageKey: starredKey("nfl", "td-scorers"),
  },
  {
    slug: "receptions",
    href: "/receptions",
    sport: "nfl",
    title: "Receptions",
    subtitle: "WR, TE & RB",
    description: "Catch leaders among receivers and running backs.",
    status: "coming-soon",
    starredStorageKey: starredKey("nfl", "receptions"),
  },
  {
    slug: "interceptions",
    href: "/interceptions",
    sport: "nfl",
    title: "Interceptions",
    subtitle: "Defensive INTs",
    description: "Defensive interception leaders.",
    status: "coming-soon",
    starredStorageKey: starredKey("nfl", "interceptions"),
  },
];

export function reportsForSport(sport: Sport): ReportDef[] {
  return REPORTS.filter((report) => report.sport === sport);
}
