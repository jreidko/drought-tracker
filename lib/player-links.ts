export function slugifyPlayerName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function mlbPlayerStatsUrl(name: string, mlbPlayerId: number): string {
  return `https://www.mlb.com/player/${slugifyPlayerName(name)}-${mlbPlayerId}`;
}

export function baseballSavantUrl(name: string, mlbPlayerId: number): string {
  return `https://baseballsavant.mlb.com/savant-player/${slugifyPlayerName(name)}-${mlbPlayerId}?stats=statcast-r-hitting-mlb`;
}

export function fanGraphsPlayerUrl(fanGraphsId: number, name: string): string {
  return `https://www.fangraphs.com/players/${slugifyPlayerName(name)}/${fanGraphsId}/stats`;
}

export function baseballReferenceUrl(baseballReferencePath: string): string {
  return `https://www.baseball-reference.com/players/${baseballReferencePath}.shtml`;
}

export function espnPlayerUrl(espnId: number, name: string): string {
  return `https://www.espn.com/mlb/player/_/id/${espnId}/${slugifyPlayerName(name)}`;
}
