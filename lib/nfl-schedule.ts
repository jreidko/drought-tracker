const ESPN_SCOREBOARD =
  "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";
const CACHE_SECONDS = 900;

export type NflTodayGame = {
  venueName: string;
  homeTeamId: number;
  homeTeamName: string;
  homeTeamAbbreviation: string;
  awayTeamId: number;
  awayTeamName: string;
  awayTeamAbbreviation: string;
  statusText: string;
};

type EspnCompetitor = {
  homeAway: "home" | "away";
  team: {
    id: string;
    abbreviation: string;
    displayName: string;
    name: string;
  };
};

type EspnScoreboardResponse = {
  season?: {
    year: number;
    type: number;
  };
  events?: Array<{
    date: string;
    competitions: Array<{
      venue?: { fullName?: string };
      competitors: EspnCompetitor[];
      status?: {
        type?: {
          shortDetail?: string;
          detail?: string;
        };
      };
    }>;
  }>;
};

export type NflSeasonContext = {
  year: number;
  type: number;
};

function newYorkDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

async function fetchEspnJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; chalkdog/0.1)",
    },
    next: { revalidate: CACHE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`ESPN API error ${response.status} for ${url}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchNflSeasonContext(): Promise<NflSeasonContext> {
  const data = await fetchEspnJson<EspnScoreboardResponse>(ESPN_SCOREBOARD);
  const year = data.season?.year ?? new Date().getFullYear();
  const type = data.season?.type ?? 2;
  return { year, type };
}

export async function fetchTodayNflScheduleByTeam(): Promise<
  Map<number, NflTodayGame>
> {
  const data = await fetchEspnJson<EspnScoreboardResponse>(ESPN_SCOREBOARD);
  const todayKey = newYorkDateKey(new Date());
  const gamesByTeam = new Map<number, NflTodayGame>();

  for (const event of data.events ?? []) {
    if (newYorkDateKey(new Date(event.date)) !== todayKey) {
      continue;
    }

    const competition = event.competitions[0];
    if (!competition) {
      continue;
    }

    const home = competition.competitors.find((c) => c.homeAway === "home");
    const away = competition.competitors.find((c) => c.homeAway === "away");
    if (!home || !away) {
      continue;
    }

    const todayGame: NflTodayGame = {
      venueName: competition.venue?.fullName ?? "TBD",
      homeTeamId: Number(home.team.id),
      homeTeamName: home.team.displayName,
      homeTeamAbbreviation: home.team.abbreviation,
      awayTeamId: Number(away.team.id),
      awayTeamName: away.team.displayName,
      awayTeamAbbreviation: away.team.abbreviation,
      statusText:
        competition.status?.type?.shortDetail ??
        competition.status?.type?.detail ??
        "",
    };

    gamesByTeam.set(todayGame.homeTeamId, todayGame);
    gamesByTeam.set(todayGame.awayTeamId, todayGame);
  }

  return gamesByTeam;
}
