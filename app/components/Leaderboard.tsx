"use client";

import {
  averageGamesBetweenHomeRuns,
  formatAverageHomeRuns,
  formatGamesBetweenHomeRuns,
  GAMES_IN_MLB_SEASON,
} from "@/lib/hr-averages";
import {
  baseballReferenceUrl,
  baseballSavantUrl,
  espnPlayerUrl,
  fanGraphsPlayerUrl,
  mlbPlayerStatsUrl,
  mlbTeamLogoUrl,
} from "@/lib/player-links";
import type { Player, TodayGameInfo } from "@/lib/player";
import { describeHrParkFactor } from "@/lib/venue-hr-stats";
import {
  DROUGHT_TRACKER,
  DROUGHT_TRACKER_LEGACY_STARRED_KEY,
} from "@/lib/reports/catalog";
import { collectActiveGames } from "@/lib/reports/games-today";
import LeaderboardReference from "@/app/components/LeaderboardReference";
import HomeRunLeadersTable from "@/app/components/HomeRunLeadersTable";
import {
  CompareSection,
  NoPlayersMatch,
  PlayerGrid,
} from "@/app/components/report/ReportBoard";
import {
  FilterChip,
  ReportToolbar,
  SortRow,
} from "@/app/components/report/ReportToolbar";
import {
  PlayerPanelGridCell,
  PlayerStatusBadges,
  PlayerTile,
  PlayerTileFooter,
  PlayerTileHeader,
  TodayGameFrame,
  type SourceLink,
} from "@/app/components/report/PlayerTile";
import {
  useComparedPlayers,
  useStarredPlayers,
} from "@/app/components/report/selection";
import Image from "next/image";
import { useMemo, useState } from "react";

const GAMES_IN_SEASON = GAMES_IN_MLB_SEASON;

type DroughtTier =
  | "ignited"
  | "charged"
  | "cold-orange"
  | "cold-yellow"
  | "cold-teal"
  | "neutral";

function getDroughtTier(streak: number): DroughtTier {
  if (streak === 0) {
    return "ignited";
  }
  if (streak === 1) {
    return "charged";
  }
  if (streak <= 3) {
    return "cold-orange";
  }
  if (streak <= 7) {
    return "cold-yellow";
  }
  return "cold-teal";
}

function getRowHighlightClass(droughtStreak: number) {
  switch (getDroughtTier(droughtStreak)) {
    case "ignited":
      return "border-sith-dim/50 bg-sith-dim/10 sith-box-glow";
    case "charged":
      return "border-cold-orange/50 bg-cold-orange/10 cold-orange-box-glow";
    case "cold-orange":
      return "border-cold-yellow/30 bg-cold-yellow/5 cold-yellow-box-glow";
    case "cold-yellow":
      return "border-cold-green/30 bg-cold-green/5 cold-green-box-glow";
    case "cold-teal":
      return "border-cold-teal/50 bg-cold-teal/10 cold-teal-box-glow-strong";
    default:
      return "border-border bg-surface";
  }
}

function getDroughtReversedClass(droughtStreak: number) {
  switch (getDroughtTier(droughtStreak)) {
    case "ignited":
      return "player-panel-drought-reversed-warm";
    case "charged":
      return "player-panel-drought-reversed-cold-orange";
    case "cold-orange":
      return "player-panel-drought-reversed-cold-yellow";
    case "cold-yellow":
      return "player-panel-drought-reversed-cold-green";
    case "cold-teal":
      return "player-panel-drought-reversed-cold-teal";
    default:
      return "";
  }
}

function getDroughtTierLabel(streak: number): string {
  switch (getDroughtTier(streak)) {
    case "ignited":
      return "Ignited";
    case "charged":
      return "Charged";
    case "cold-orange":
      return "Cooling";
    case "cold-yellow":
      return "Cold";
    case "cold-teal":
      return "Frozen";
    default:
      return "Drought";
  }
}

function playerSourceLinks(player: Player): SourceLink[] {
  const links: SourceLink[] = [
    {
      label: "Savant",
      href: baseballSavantUrl(player.name, player.mlbPlayerId),
    },
  ];

  if (player.fanGraphsId !== undefined) {
    links.push({
      label: "FanGraphs",
      href: fanGraphsPlayerUrl(player.fanGraphsId, player.name),
    });
  }

  if (player.baseballReferencePath !== undefined) {
    links.push({
      label: "B-Ref",
      href: baseballReferenceUrl(player.baseballReferencePath),
    });
  }

  if (player.espnId !== undefined) {
    links.push({
      label: "ESPN",
      href: espnPlayerUrl(player.espnId, player.name),
    });
  }

  return links;
}

function TodayGamePanel({ todayGame }: { todayGame: TodayGameInfo }) {
  const parkFactorLabel = describeHrParkFactor(todayGame.hrParkFactor);

  return (
    <TodayGameFrame
      logoUrl={mlbTeamLogoUrl(todayGame.homeTeamId)}
      venueName={todayGame.venueName}
      isHome={todayGame.isHome}
    >
      <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1">
        <div>
          <span className="player-panel-kicker">HR Factor</span>
          <span className="block font-mono text-xs font-bold tabular-nums text-chrome">
            {todayGame.hrParkFactor}
          </span>
          <span className="block font-mono text-[9px] text-muted">
            {parkFactorLabel}
            {todayGame.hrParkFactorYearRange
              ? ` · ${todayGame.hrParkFactorYearRange}`
              : null}
          </span>
        </div>
        <div>
          <span className="player-panel-kicker">At Park</span>
          <span className="block font-mono text-xs font-bold tabular-nums text-sith">
            {todayGame.playerHomeRunsAtVenue} HR
          </span>
          <span className="block font-mono text-[9px] text-muted">
            {todayGame.playerGamesAtVenue} G this season
          </span>
        </div>
      </div>
      <div className="mt-1.5">
        <span className="player-panel-kicker">Vs Pitcher</span>
        {todayGame.opposingPitcher ? (
          <>
            <div className="flex items-center gap-1.5">
              <Image
                src={mlbTeamLogoUrl(todayGame.opposingPitcher.teamId)}
                alt=""
                aria-hidden={true}
                width={16}
                height={16}
                className="shrink-0 opacity-90"
              />
              <a
                href={mlbPlayerStatsUrl(
                  todayGame.opposingPitcher.name,
                  todayGame.opposingPitcher.mlbPlayerId,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate font-mono text-xs font-bold text-chrome underline-offset-2 hover:text-sith hover:underline"
              >
                {todayGame.opposingPitcher.name}
              </a>
            </div>
            <span className="mt-0.5 block font-mono text-[10px] tabular-nums text-muted">
              {todayGame.opposingPitcher.record} · {todayGame.opposingPitcher.era}{" "}
              ERA · {todayGame.opposingPitcher.whip} WHIP
            </span>
            <span className="block font-mono text-[10px] tabular-nums text-muted">
              {todayGame.opposingPitcher.homeRuns} HR ·{" "}
              {todayGame.opposingPitcher.strikeOuts} K ·{" "}
              {todayGame.opposingPitcher.inningsPitched} IP
            </span>
          </>
        ) : (
          <span className="block font-mono text-xs font-bold text-muted">TBD</span>
        )}
      </div>
    </TodayGameFrame>
  );
}

function PlayerCard({
  player,
  isStarred,
  onToggleStar,
  isCompared,
  onToggleCompare,
}: {
  player: Player;
  isStarred: boolean;
  onToggleStar: () => void;
  isCompared: boolean;
  onToggleCompare: () => void;
}) {
  const games1Y = averageGamesBetweenHomeRuns(player.avgHr1Year, GAMES_IN_SEASON);
  const games3Y = averageGamesBetweenHomeRuns(player.avgHr3Year, GAMES_IN_SEASON);
  const games5Y = averageGamesBetweenHomeRuns(player.avgHr5Year, GAMES_IN_SEASON);
  const droughtReversedClass = getDroughtReversedClass(player.droughtStreak);

  return (
    <PlayerTile highlightClass={getRowHighlightClass(player.droughtStreak)}>
      <PlayerTileHeader
        teamLogoUrl={player.teamId !== null ? mlbTeamLogoUrl(player.teamId) : null}
        teamName={player.teamName}
        isStarred={isStarred}
        onToggleStar={onToggleStar}
        isCompared={isCompared}
        onToggleCompare={onToggleCompare}
      />
      <div className="flex border-b border-border">
        <div className="flex flex-1 flex-col border-r border-border px-2.5 py-2">
          <div className="flex items-center justify-between">
            <span className="player-panel-kicker">Name</span>
            {player.sluggingPct !== null && (
              <span className="flex items-center gap-1 font-mono text-[8px] font-semibold uppercase tracking-[0.12em] text-muted tabular-nums">
                SLG {player.sluggingPct.toFixed(3).replace(/^0/, "")}
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  aria-hidden="true"
                  fill="none"
                >
                  <line
                    x1="1"
                    y1="9"
                    x2="3.5"
                    y2="6.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="3.5"
                    y1="6.5"
                    x2="9"
                    y2="1"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            )}
          </div>
          <a
            href={mlbPlayerStatsUrl(player.name, player.mlbPlayerId)}
            target="_blank"
            rel="noopener noreferrer"
            className="player-panel-name underline-offset-2 hover:underline"
          >
            {player.name}
          </a>
          <span className="mt-1 block font-mono text-xs font-bold tabular-nums text-sith">
            {player.homeRunsThisSeason} / {player.projectedSeasonHRs} HR
          </span>
          {player.gamesPlayed > 0 && (
            <span className="block font-mono text-[10px] tabular-nums text-muted">
              {(player.homeRunsThisSeason / player.gamesPlayed).toFixed(3)} HR/G
              · {player.gamesPlayed} G
            </span>
          )}
          <PlayerStatusBadges
            rosterStatus={player.rosterStatus}
            gameToday={player.gameToday}
          />
        </div>
        <div className="flex w-1/3 flex-col px-2.5 py-2">
          <span className="player-panel-kicker">
            {getDroughtTierLabel(player.droughtStreak)}
          </span>
          <div
            className={`player-panel-drought-reversed flex-1 ${droughtReversedClass}`}
          >
            {player.droughtStreak}
          </div>
        </div>
      </div>

      <div className="player-panel-grid">
        <PlayerPanelGridCell
          label="1Y Avg"
          value={formatAverageHomeRuns(player.avgHr1Year)}
          sub={formatGamesBetweenHomeRuns(games1Y, true)}
        />
        <PlayerPanelGridCell
          label="3Y Avg"
          value={formatAverageHomeRuns(player.avgHr3Year)}
          sub={formatGamesBetweenHomeRuns(games3Y, true)}
        />
        <PlayerPanelGridCell
          label="5Y Avg"
          value={formatAverageHomeRuns(player.avgHr5Year)}
          sub={formatGamesBetweenHomeRuns(games5Y, true)}
        />
      </div>

      {player.todayGame ? <TodayGamePanel todayGame={player.todayGame} /> : null}

      <PlayerTileFooter links={playerSourceLinks(player)} />
    </PlayerTile>
  );
}

export default function Leaderboard({
  players,
  season,
  fetchedAt,
}: {
  players: Player[];
  season: number;
  fetchedAt: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProjHR30, setFilterProjHR30] = useState(false);
  const [filterProjHR, setFilterProjHR] = useState(false);
  const [filterAvg3Y20, setFilterAvg3Y20] = useState(false);
  const [filterAvg3Y30, setFilterAvg3Y30] = useState(false);
  const [filterGameToday, setFilterGameToday] = useState(false);
  const [filterDrought, setFilterDrought] = useState(false);
  const [filterStarred, setFilterStarred] = useState(false);
  const [selectedGameHomeTeamId, setSelectedGameHomeTeamId] = useState<
    number | null
  >(null);
  const [sortBy, setSortBy] = useState<"drought" | "slugging" | "projHR">(
    "drought",
  );
  const { starredIds, toggleStar } = useStarredPlayers(
    DROUGHT_TRACKER.starredStorageKey,
    DROUGHT_TRACKER_LEGACY_STARRED_KEY,
  );
  const { comparedIds, toggleCompare, clearComparison } = useComparedPlayers();

  const activeGames = useMemo(() => collectActiveGames(players), [players]);

  const displayedPlayers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return players
      .filter((player) => {
        if (normalizedQuery && !player.name.toLowerCase().includes(normalizedQuery))
          return false;
        if (
          filterProjHR30 &&
          (player.gamesPlayed === 0 ||
            player.homeRunsThisSeason / player.gamesPlayed < 0.185)
        )
          return false;
        if (
          filterProjHR &&
          (player.gamesPlayed === 0 ||
            player.homeRunsThisSeason / player.gamesPlayed < 0.247)
        )
          return false;
        if (filterAvg3Y20 && (player.avgHr3Year === null || player.avgHr3Year <= 20))
          return false;
        if (filterAvg3Y30 && (player.avgHr3Year === null || player.avgHr3Year <= 30))
          return false;
        if (filterGameToday && !player.gameToday) return false;
        if (filterDrought && player.droughtStreak < 3) return false;
        if (filterStarred && !starredIds.has(player.mlbPlayerId)) return false;
        if (
          selectedGameHomeTeamId !== null &&
          player.todayGame?.homeTeamId !== selectedGameHomeTeamId
        )
          return false;
        return true;
      })
      .sort((a, b) => {
        const aStarred = starredIds.has(a.mlbPlayerId) ? 1 : 0;
        const bStarred = starredIds.has(b.mlbPlayerId) ? 1 : 0;
        if (bStarred !== aStarred) return bStarred - aStarred;
        if (sortBy === "slugging") {
          const aSlg = a.sluggingPct ?? -1;
          const bSlg = b.sluggingPct ?? -1;
          return bSlg - aSlg;
        }
        if (sortBy === "projHR") {
          return b.projectedSeasonHRs - a.projectedSeasonHRs;
        }
        return b.droughtStreak - a.droughtStreak;
      });
  }, [
    players,
    searchQuery,
    filterProjHR30,
    filterProjHR,
    filterAvg3Y20,
    filterAvg3Y30,
    filterGameToday,
    filterDrought,
    filterStarred,
    selectedGameHomeTeamId,
    starredIds,
    sortBy,
  ]);

  const comparedPlayers = players.filter((player) =>
    comparedIds.has(player.mlbPlayerId),
  );

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 sm:px-6 sm:py-6">
      <section className="mb-4 sm:mb-6">
        <h1 className="text-xl font-bold uppercase tracking-[0.08em] text-chrome sm:text-2xl lg:text-3xl">
          Home Run Leaderboard
        </h1>
        <p className="mt-1 text-sm text-muted sm:text-base">
          Projected power, drought streaks, and historical HR averages — live from
          MLB Stats API.
        </p>
        <p className="mt-1 text-xs text-muted">
          {season} season · updated{" "}
          {new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(fetchedAt))}
        </p>
      </section>

      <ReportToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={
          <>
            <FilterChip
              active={filterProjHR30}
              onClick={() => setFilterProjHR30((value) => !value)}
            >
              30+ Proj HR
            </FilterChip>
            <FilterChip
              active={filterProjHR}
              onClick={() => setFilterProjHR((value) => !value)}
            >
              40+ Proj HR
            </FilterChip>
            <FilterChip
              active={filterAvg3Y20}
              onClick={() => setFilterAvg3Y20((value) => !value)}
            >
              3Y Avg {">"} 20
            </FilterChip>
            <FilterChip
              active={filterAvg3Y30}
              onClick={() => setFilterAvg3Y30((value) => !value)}
            >
              3Y Avg {">"} 30
            </FilterChip>
            <FilterChip
              active={filterGameToday}
              onClick={() => setFilterGameToday((value) => !value)}
            >
              Game Today
            </FilterChip>
            <FilterChip
              active={filterDrought}
              onClick={() => setFilterDrought((value) => !value)}
            >
              3+ Game Drought
            </FilterChip>
            <FilterChip
              active={filterStarred}
              onClick={() => setFilterStarred((value) => !value)}
              tone="star"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill={filterStarred ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Starred
            </FilterChip>
          </>
        }
        games={activeGames}
        selectedGameHomeTeamId={selectedGameHomeTeamId}
        onSelectGame={setSelectedGameHomeTeamId}
        sort={
          <SortRow>
            {(
              [
                { value: "drought", label: "Drought" },
                { value: "slugging", label: "SLG %" },
                { value: "projHR", label: "Proj HR" },
              ] as const
            ).map(({ value, label }) => (
              <FilterChip
                key={value}
                active={sortBy === value}
                onClick={() => setSortBy(value)}
              >
                {label}
              </FilterChip>
            ))}
          </SortRow>
        }
      />

      <CompareSection count={comparedIds.size} onClear={clearComparison}>
        {comparedPlayers.map((player) => (
          <li key={player.mlbPlayerId}>
            <PlayerCard
              player={player}
              isStarred={starredIds.has(player.mlbPlayerId)}
              onToggleStar={() => toggleStar(player.mlbPlayerId)}
              isCompared={true}
              onToggleCompare={() => toggleCompare(player.mlbPlayerId)}
            />
          </li>
        ))}
      </CompareSection>

      {displayedPlayers.length === 0 ? (
        <NoPlayersMatch />
      ) : (
        <PlayerGrid label="Player leaderboard">
          {displayedPlayers.map((player) => (
            <li key={player.mlbPlayerId}>
              <PlayerCard
                player={player}
                isStarred={starredIds.has(player.mlbPlayerId)}
                onToggleStar={() => toggleStar(player.mlbPlayerId)}
                isCompared={comparedIds.has(player.mlbPlayerId)}
                onToggleCompare={() => toggleCompare(player.mlbPlayerId)}
              />
            </li>
          ))}
        </PlayerGrid>
      )}

      <aside className="mt-4 rounded-sm border border-border bg-surface/80 px-4 py-3 sm:mt-6">
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {[
            { label: "Ignited", range: "0 games", dotClass: "bg-sith-dim" },
            { label: "Charged", range: "1 game", dotClass: "bg-cold-orange" },
            { label: "Cooling", range: "2–3 games", dotClass: "bg-cold-yellow" },
            { label: "Cold", range: "4–7 games", dotClass: "bg-cold-green" },
            { label: "Frozen", range: "8+ games", dotClass: "bg-cold-teal" },
          ].map(({ label, range, dotClass }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`size-2.5 shrink-0 rounded-full ${dotClass}`} />
              <span className="font-mono text-[11px] uppercase tracking-wide text-chrome">
                {label}
              </span>
              <span className="font-mono text-[11px] text-muted">{range}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 border-t border-border/50 pt-2 space-y-1 font-mono text-[11px] text-muted">
          <div>
            <span className="uppercase tracking-wide text-chrome">HR/G</span>
            {
              " — home runs per game this season (used to project full-season total at 162 G pace)"
            }
          </div>
          <div>
            <span className="uppercase tracking-wide text-chrome">SLG</span>
            {" — slugging percentage from current season stats"}
          </div>
        </div>
      </aside>

      <LeaderboardReference />

      <HomeRunLeadersTable players={players} />
    </main>
  );
}
