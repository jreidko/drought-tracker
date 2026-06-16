type PlayerMetadata = {
  fanGraphsId?: number;
  baseballReferencePath?: string;
  espnId?: number;
};

/** Optional third-party IDs for outbound links — keyed by MLB player ID. */
const PLAYER_METADATA: Record<number, PlayerMetadata> = {
  572233: { fanGraphsId: 13419, baseballReferencePath: "w/walkech02" },
  592450: { fanGraphsId: 15640, baseballReferencePath: "j/judgeaa01" },
  621439: { fanGraphsId: 14161, baseballReferencePath: "b/buxtoby01" },
  621566: { fanGraphsId: 14309, baseballReferencePath: "o/olsonma02" },
  656941: { fanGraphsId: 16478, baseballReferencePath: "s/schwaky01" },
  660271: { fanGraphsId: 19755, baseballReferencePath: "o/ohtansh01" },
  670541: { fanGraphsId: 19599, baseballReferencePath: "a/alvaryo01" },
  695578: { fanGraphsId: 29518, baseballReferencePath: "w/woodja03" },
  700250: { fanGraphsId: 29576, baseballReferencePath: "r/ricebe01" },
  808959: { baseballReferencePath: "m/murakmu01" },
};

export function getPlayerMetadata(mlbPlayerId: number): PlayerMetadata {
  return PLAYER_METADATA[mlbPlayerId] ?? {};
}
