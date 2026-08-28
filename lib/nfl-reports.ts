export type NflStatFormat = "int" | "float" | "pct";

export type NflGridCell = {
  label: string;
  stat: string;
  format: NflStatFormat;
  subStat?: string;
  subFormat?: NflStatFormat;
  subStats?: [string, string];
};

export type NflFilterDef = {
  id: string;
  label: string;
  /** Stat key, or `__perGame` for primary / games. */
  stat: string;
  min: number;
};

export type NflSortDef = {
  id: string;
  label: string;
  stat: string;
};

export type NflReportSpec = {
  slug: string;
  espnCategory: string;
  espnSort: string;
  espnStatsUrl: string;
  positions?: string[];
  maxPlayers: number;
  primaryStat: string;
  primaryLabel: string;
  primaryUnit: string;
  kicker?: { label: string; stat: string; format: NflStatFormat };
  grid: [NflGridCell, NflGridCell, NflGridCell];
  filters: NflFilterDef[];
  sorts: NflSortDef[];
  highlight: [number, number, number, number];
  tableStat: { label: string; stat: string; format: NflStatFormat };
  intro: string;
  reference: Array<{ label: string; text: string }>;
};

const PASSING_GRID = {
  yards: {
    label: "Yards",
    stat: "passing.passingYards",
    format: "int" as const,
    subStat: "passing.passingYardsPerGame",
    subFormat: "float" as const,
  },
  cmp: {
    label: "CMP%",
    stat: "passing.completionPct",
    format: "pct" as const,
    subStats: ["passing.completions", "passing.passingAttempts"] as [string, string],
  },
  int: {
    label: "INT",
    stat: "passing.interceptions",
    format: "int" as const,
  },
};

export const NFL_REPORT_SPECS: Record<string, NflReportSpec> = {
  "passing-tds": {
    slug: "passing-tds",
    espnCategory: "offense:passing",
    espnSort: "passing.passingTouchdowns:desc",
    espnStatsUrl: "https://www.espn.com/nfl/stats/player/_/stat/passing",
    positions: ["QB"],
    maxPlayers: 200,
    primaryStat: "passing.passingTouchdowns",
    primaryLabel: "Pass TD",
    primaryUnit: "TD",
    kicker: { label: "RTG", stat: "passing.QBRating", format: "float" },
    grid: [PASSING_GRID.yards, PASSING_GRID.cmp, PASSING_GRID.int],
    filters: [
      { id: "td40", label: "40+ TD", stat: "passing.passingTouchdowns", min: 40 },
      { id: "td30", label: "30+ TD", stat: "passing.passingTouchdowns", min: 30 },
      { id: "td20", label: "20+ TD", stat: "passing.passingTouchdowns", min: 20 },
      { id: "tdg", label: "2+ TD/G", stat: "__perGame", min: 2 },
    ],
    sorts: [
      { id: "tds", label: "TDs", stat: "passing.passingTouchdowns" },
      { id: "yards", label: "Yards", stat: "passing.passingYards" },
      { id: "rating", label: "RTG", stat: "passing.QBRating" },
      { id: "tdg", label: "TD/G", stat: "__perGame" },
    ],
    highlight: [40, 30, 20, 10],
    tableStat: { label: "YDS", stat: "passing.passingYards", format: "int" },
    intro:
      "QB passing TD leaders, 17-game pace, and today's opponent — live from ESPN.",
    reference: [
      {
        label: "TD / Proj TD",
        text: "Season passing touchdowns, then a 17-game projection from current pace.",
      },
      {
        label: "Yards / CMP% / INT",
        text: "Passing yards, completion percentage, and interceptions thrown.",
      },
    ],
  },
  "passing-yards": {
    slug: "passing-yards",
    espnCategory: "offense:passing",
    espnSort: "passing.passingYards:desc",
    espnStatsUrl: "https://www.espn.com/nfl/stats/player/_/stat/passing",
    positions: ["QB"],
    maxPlayers: 200,
    primaryStat: "passing.passingYards",
    primaryLabel: "Pass YDS",
    primaryUnit: "YDS",
    kicker: { label: "RTG", stat: "passing.QBRating", format: "float" },
    grid: [
      {
        label: "Pass TD",
        stat: "passing.passingTouchdowns",
        format: "int",
      },
      PASSING_GRID.cmp,
      PASSING_GRID.int,
    ],
    filters: [
      { id: "yds4000", label: "4000+ YDS", stat: "passing.passingYards", min: 4000 },
      { id: "yds3500", label: "3500+ YDS", stat: "passing.passingYards", min: 3500 },
      { id: "yds3000", label: "3000+ YDS", stat: "passing.passingYards", min: 3000 },
      { id: "ypg", label: "250+ YDS/G", stat: "__perGame", min: 250 },
    ],
    sorts: [
      { id: "yards", label: "Yards", stat: "passing.passingYards" },
      { id: "tds", label: "TDs", stat: "passing.passingTouchdowns" },
      { id: "rating", label: "RTG", stat: "passing.QBRating" },
      { id: "ypg", label: "YDS/G", stat: "__perGame" },
    ],
    highlight: [4000, 3500, 3000, 2000],
    tableStat: { label: "TD", stat: "passing.passingTouchdowns", format: "int" },
    intro:
      "QB passing yardage leaders, 17-game pace, and today's opponent — live from ESPN.",
    reference: [
      {
        label: "YDS / Proj YDS",
        text: "Season passing yards, then a 17-game projection from current pace.",
      },
      {
        label: "Pass TD / CMP% / INT",
        text: "Touchdowns, completion percentage, and interceptions thrown.",
      },
    ],
  },
  "rushing-tds": {
    slug: "rushing-tds",
    espnCategory: "offense:rushing",
    espnSort: "rushing.rushingTouchdowns:desc",
    espnStatsUrl: "https://www.espn.com/nfl/stats/player/_/stat/rushing",
    positions: ["QB", "RB", "FB"],
    maxPlayers: 200,
    primaryStat: "rushing.rushingTouchdowns",
    primaryLabel: "Rush TD",
    primaryUnit: "TD",
    grid: [
      {
        label: "Yards",
        stat: "rushing.rushingYards",
        format: "int",
        subStat: "rushing.rushingYardsPerGame",
        subFormat: "float",
      },
      { label: "ATT", stat: "rushing.rushingAttempts", format: "int" },
      { label: "YPC", stat: "rushing.yardsPerRushAttempt", format: "float" },
    ],
    filters: [
      { id: "td15", label: "15+ TD", stat: "rushing.rushingTouchdowns", min: 15 },
      { id: "td10", label: "10+ TD", stat: "rushing.rushingTouchdowns", min: 10 },
      { id: "td6", label: "6+ TD", stat: "rushing.rushingTouchdowns", min: 6 },
      { id: "tdg", label: "0.8+ TD/G", stat: "__perGame", min: 0.8 },
    ],
    sorts: [
      { id: "tds", label: "TDs", stat: "rushing.rushingTouchdowns" },
      { id: "yards", label: "Yards", stat: "rushing.rushingYards" },
      { id: "ypc", label: "YPC", stat: "rushing.yardsPerRushAttempt" },
      { id: "tdg", label: "TD/G", stat: "__perGame" },
    ],
    highlight: [15, 10, 6, 3],
    tableStat: { label: "YDS", stat: "rushing.rushingYards", format: "int" },
    intro:
      "Rushing TDs for quarterbacks and running backs, with today's opponent.",
    reference: [
      {
        label: "Rush TD / Proj",
        text: "Season rushing touchdowns, then a 17-game projection from current pace.",
      },
      {
        label: "Yards / ATT / YPC",
        text: "Rushing yards, carries, and yards per carry.",
      },
    ],
  },
  "rushing-yards": {
    slug: "rushing-yards",
    espnCategory: "offense:rushing",
    espnSort: "rushing.rushingYards:desc",
    espnStatsUrl: "https://www.espn.com/nfl/stats/player/_/stat/rushing",
    positions: ["QB", "RB", "FB"],
    maxPlayers: 200,
    primaryStat: "rushing.rushingYards",
    primaryLabel: "Rush YDS",
    primaryUnit: "YDS",
    grid: [
      { label: "Rush TD", stat: "rushing.rushingTouchdowns", format: "int" },
      { label: "ATT", stat: "rushing.rushingAttempts", format: "int" },
      { label: "YPC", stat: "rushing.yardsPerRushAttempt", format: "float" },
    ],
    filters: [
      { id: "yds1200", label: "1200+ YDS", stat: "rushing.rushingYards", min: 1200 },
      { id: "yds1000", label: "1000+ YDS", stat: "rushing.rushingYards", min: 1000 },
      { id: "yds800", label: "800+ YDS", stat: "rushing.rushingYards", min: 800 },
      { id: "ypg", label: "70+ YDS/G", stat: "__perGame", min: 70 },
    ],
    sorts: [
      { id: "yards", label: "Yards", stat: "rushing.rushingYards" },
      { id: "tds", label: "TDs", stat: "rushing.rushingTouchdowns" },
      { id: "ypc", label: "YPC", stat: "rushing.yardsPerRushAttempt" },
      { id: "ypg", label: "YDS/G", stat: "__perGame" },
    ],
    highlight: [1200, 1000, 800, 500],
    tableStat: { label: "TD", stat: "rushing.rushingTouchdowns", format: "int" },
    intro:
      "Rushing yards for quarterbacks and running backs, with today's opponent.",
    reference: [
      {
        label: "YDS / Proj YDS",
        text: "Season rushing yards, then a 17-game projection from current pace.",
      },
      {
        label: "Rush TD / ATT / YPC",
        text: "Rushing touchdowns, carries, and yards per carry.",
      },
    ],
  },
  "td-scorers": {
    slug: "td-scorers",
    espnCategory: "scoring",
    espnSort: "scoring.totalTouchdowns:desc",
    espnStatsUrl: "https://www.espn.com/nfl/stats/player/_/view/scoring",
    maxPlayers: 200,
    primaryStat: "scoring.totalTouchdowns",
    primaryLabel: "TDs",
    primaryUnit: "TD",
    grid: [
      { label: "Rush", stat: "scoring.rushingTouchdowns", format: "int" },
      { label: "Rec", stat: "scoring.receivingTouchdowns", format: "int" },
      { label: "Ret", stat: "scoring.returnTouchdowns", format: "int" },
    ],
    filters: [
      { id: "td15", label: "15+ TD", stat: "scoring.totalTouchdowns", min: 15 },
      { id: "td10", label: "10+ TD", stat: "scoring.totalTouchdowns", min: 10 },
      { id: "td6", label: "6+ TD", stat: "scoring.totalTouchdowns", min: 6 },
      { id: "tdg", label: "0.8+ TD/G", stat: "__perGame", min: 0.8 },
    ],
    sorts: [
      { id: "tds", label: "TDs", stat: "scoring.totalTouchdowns" },
      { id: "rush", label: "Rush", stat: "scoring.rushingTouchdowns" },
      { id: "rec", label: "Rec", stat: "scoring.receivingTouchdowns" },
      { id: "tdg", label: "TD/G", stat: "__perGame" },
    ],
    highlight: [15, 10, 6, 3],
    tableStat: { label: "PTS", stat: "scoring.totalPoints", format: "int" },
    intro:
      "Anyone who finds the end zone — rush, receiving, or return — with today's opponent.",
    reference: [
      {
        label: "TDs / Proj",
        text: "Total touchdowns scored (rush, receiving, return), then a 17-game projection.",
      },
      {
        label: "Rush / Rec / Ret",
        text: "How those touchdowns were scored. Passing TDs thrown are not included.",
      },
    ],
  },
  receptions: {
    slug: "receptions",
    espnCategory: "offense:receiving",
    espnSort: "receiving.receptions:desc",
    espnStatsUrl: "https://www.espn.com/nfl/stats/player/_/stat/receiving",
    positions: ["WR", "TE", "RB", "FB"],
    maxPlayers: 200,
    primaryStat: "receiving.receptions",
    primaryLabel: "REC",
    primaryUnit: "REC",
    grid: [
      {
        label: "Yards",
        stat: "receiving.receivingYards",
        format: "int",
        subStat: "receiving.receivingYardsPerGame",
        subFormat: "float",
      },
      { label: "TD", stat: "receiving.receivingTouchdowns", format: "int" },
      { label: "YPR", stat: "receiving.yardsPerReception", format: "float" },
    ],
    filters: [
      { id: "rec100", label: "100+ REC", stat: "receiving.receptions", min: 100 },
      { id: "rec80", label: "80+ REC", stat: "receiving.receptions", min: 80 },
      { id: "rec60", label: "60+ REC", stat: "receiving.receptions", min: 60 },
      { id: "rpg", label: "6+ REC/G", stat: "__perGame", min: 6 },
    ],
    sorts: [
      { id: "rec", label: "REC", stat: "receiving.receptions" },
      { id: "yards", label: "Yards", stat: "receiving.receivingYards" },
      { id: "tds", label: "TDs", stat: "receiving.receivingTouchdowns" },
      { id: "rpg", label: "REC/G", stat: "__perGame" },
    ],
    highlight: [100, 80, 60, 40],
    tableStat: { label: "YDS", stat: "receiving.receivingYards", format: "int" },
    intro:
      "Catch leaders among receivers and running backs, with today's opponent.",
    reference: [
      {
        label: "REC / Proj",
        text: "Season receptions, then a 17-game projection from current pace.",
      },
      {
        label: "Yards / TD / YPR",
        text: "Receiving yards, receiving touchdowns, and yards per reception.",
      },
    ],
  },
  interceptions: {
    slug: "interceptions",
    espnCategory: "defense:defensiveInterceptions",
    espnSort: "defensiveInterceptions.interceptions:desc",
    espnStatsUrl: "https://www.espn.com/nfl/stats/player/_/view/defense/stat/interceptions",
    maxPlayers: 200,
    primaryStat: "defensiveinterceptions.interceptions",
    primaryLabel: "INT",
    primaryUnit: "INT",
    grid: [
      { label: "YDS", stat: "defensiveinterceptions.interceptionYards", format: "int" },
      {
        label: "INT TD",
        stat: "defensiveinterceptions.interceptionTouchdowns",
        format: "int",
      },
      { label: "PD", stat: "defensive.passesDefended", format: "int" },
    ],
    filters: [
      { id: "int5", label: "5+ INT", stat: "defensiveinterceptions.interceptions", min: 5 },
      { id: "int3", label: "3+ INT", stat: "defensiveinterceptions.interceptions", min: 3 },
      { id: "inttd", label: "Pick-six", stat: "defensiveinterceptions.interceptionTouchdowns", min: 1 },
    ],
    sorts: [
      { id: "int", label: "INT", stat: "defensiveinterceptions.interceptions" },
      { id: "yds", label: "YDS", stat: "defensiveinterceptions.interceptionYards" },
      { id: "td", label: "INT TD", stat: "defensiveinterceptions.interceptionTouchdowns" },
      { id: "pd", label: "PD", stat: "defensive.passesDefended" },
    ],
    highlight: [7, 5, 3, 2],
    tableStat: {
      label: "YDS",
      stat: "defensiveinterceptions.interceptionYards",
      format: "int",
    },
    intro: "Defensive interception leaders, with today's opponent.",
    reference: [
      {
        label: "INT / Proj",
        text: "Season interceptions, then a 17-game projection from current pace.",
      },
      {
        label: "YDS / INT TD / PD",
        text: "Return yards, pick-sixes, and passes defended.",
      },
    ],
  },
};

export function getNflReportSpec(slug: string): NflReportSpec | undefined {
  return NFL_REPORT_SPECS[slug];
}
