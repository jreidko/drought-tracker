export type ActiveGameOption = {
  homeTeamId: number;
  label: string;
};

type PlayerWithTodayGame = {
  teamId: number | null;
  teamName: string | null;
  todayGame?: {
    homeTeamId: number;
    venueName: string;
  };
};

export function collectActiveGames(
  players: ReadonlyArray<PlayerWithTodayGame>,
): ActiveGameOption[] {
  const gameMap = new Map<
    number,
    { homeTeamName: string | null; awayTeamName: string | null; venueName: string }
  >();

  for (const player of players) {
    if (!player.todayGame) continue;
    const { homeTeamId, venueName } = player.todayGame;
    if (!gameMap.has(homeTeamId)) {
      gameMap.set(homeTeamId, {
        homeTeamName: null,
        awayTeamName: null,
        venueName,
      });
    }
    const entry = gameMap.get(homeTeamId)!;
    if (player.teamId === homeTeamId) {
      entry.homeTeamName = player.teamName;
    } else {
      entry.awayTeamName = player.teamName;
    }
  }

  return Array.from(gameMap.entries())
    .map(([homeTeamId, info]) => ({
      homeTeamId,
      label:
        info.awayTeamName && info.homeTeamName
          ? `${info.awayTeamName} @ ${info.homeTeamName}`
          : info.venueName,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
