"use client";

import { collectActiveGames } from "@/lib/reports/games-today";
import { PASSING_TDS } from "@/lib/reports/catalog";
import {
  GAMES_IN_NFL_SEASON,
  type PassingTdPlayer,
} from "@/lib/nfl-player";
import {
  espnNflPlayerStatsUrl,
  espnNflPlayerUrl,
  espnNflTeamLogoUrl,
} from "@/lib/player-links";
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

function tdsPerGame(player: PassingTdPlayer): number {
  if (player.gamesPlayed === 0) {
    return 0;
  }
  return player.passingTouchdowns / player.gamesPlayed;
}

function getTdHighlightClass(touchdowns: number) {
  if (touchdowns >= 40) {
    return "border-sith-dim/50 bg-sith-dim/10 sith-box-glow";
  }
  if (touchdowns >= 30) {
    return "border-cold-orange/50 bg-cold-orange/10 cold-orange-box-glow";
  }
  if (touchdowns >= 20) {
    return "border-cold-yellow/30 bg-cold-yellow/5 cold-yellow-box-glow";
  }
  if (touchdowns >= 10) {
    return "border-cold-green/30 bg-cold-green/5 cold-green-box-glow";
  }
  return "border-border bg-surface";
}

function getTdReversedClass(touchdowns: number) {
  if (touchdowns >= 40) {
    return "player-panel-drought-reversed-warm";
  }
  if (touchdowns >= 30) {
    return "player-panel-drought-reversed-cold-orange";
  }
  if (touchdowns >= 20) {
    return "player-panel-drought-reversed-cold-yellow";
  }
  if (touchdowns >= 10) {
    return "player-panel-drought-reversed-cold-green";
  }
  return "";
}

function playerSourceLinks(player: PassingTdPlayer): SourceLink[] {
  return [
    {
      label: "ESPN",
      href: espnNflPlayerUrl(player.id, player.slug || player.name),
    },
    {
      label: "Stats",
      href: espnNflPlayerStatsUrl(player.id, player.slug || player.name),
    },
  ];
}

function TodayGamePanel({ player }: { player: PassingTdPlayer }) {
  const todayGame = player.todayGame;
  if (!todayGame) {
    return null;
  }

  return (
    <TodayGameFrame
      logoUrl={espnNflTeamLogoUrl(todayGame.homeTeamAbbreviation)}
      venueName={todayGame.venueName}
      isHome={todayGame.isHome}
    >
      <div className="mt-1.5">
        <span className="player-panel-kicker">Opponent</span>
        <div className="flex items-center gap-1.5">
          <Image
            src={espnNflTeamLogoUrl(todayGame.opponentAbbreviation)}
            alt=""
            aria-hidden={true}
            width={16}
            height={16}
            className="shrink-0 opacity-90"
          />
          <span className="truncate font-mono text-xs font-bold text-chrome">
            {todayGame.opponentName}
          </span>
        </div>
        {todayGame.statusText ? (
          <span className="mt-0.5 block font-mono text-[10px] text-muted">
            {todayGame.statusText}
          </span>
        ) : null}
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
  player: PassingTdPlayer;
  isStarred: boolean;
  onToggleStar: () => void;
  isCompared: boolean;
  onToggleCompare: () => void;
}) {
  const pace = tdsPerGame(player);

  return (
    <PlayerTile highlightClass={getTdHighlightClass(player.passingTouchdowns)}>
      <PlayerTileHeader
        teamLogoUrl={
          player.teamAbbreviation
            ? espnNflTeamLogoUrl(player.teamAbbreviation)
            : null
        }
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
            {player.passerRating !== null ? (
              <span className="font-mono text-[8px] font-semibold uppercase tracking-[0.12em] text-muted tabular-nums">
                RTG {player.passerRating.toFixed(1)}
              </span>
            ) : null}
          </div>
          <a
            href={espnNflPlayerUrl(player.id, player.slug || player.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="player-panel-name underline-offset-2 hover:underline"
          >
            {player.name}
          </a>
          <span className="mt-1 block font-mono text-xs font-bold tabular-nums text-sith">
            {player.passingTouchdowns} / {player.projectedSeasonTds} TD
          </span>
          {player.gamesPlayed > 0 ? (
            <span className="block font-mono text-[10px] tabular-nums text-muted">
              {pace.toFixed(2)} TD/G · {player.gamesPlayed} G
            </span>
          ) : null}
          <PlayerStatusBadges
            rosterStatus={player.rosterStatus}
            gameToday={player.gameToday}
            inactiveLabel="IR"
          />
        </div>
        <div className="flex w-1/3 flex-col px-2.5 py-2">
          <span className="player-panel-kicker">Pass TD</span>
          <div
            className={`player-panel-drought-reversed flex-1 ${getTdReversedClass(player.passingTouchdowns)}`}
          >
            {player.passingTouchdowns}
          </div>
        </div>
      </div>

      <div className="player-panel-grid">
        <PlayerPanelGridCell
          label="Yards"
          value={player.passingYards.toLocaleString()}
          sub={
            player.passingYardsPerGame !== null
              ? `${player.passingYardsPerGame.toFixed(1)} /G`
              : undefined
          }
        />
        <PlayerPanelGridCell
          label="CMP%"
          value={
            player.completionPct !== null
              ? `${player.completionPct.toFixed(1)}%`
              : "—"
          }
          sub={`${player.completions}/${player.passingAttempts}`}
        />
        <PlayerPanelGridCell
          label="INT"
          value={String(player.interceptions)}
        />
      </div>

      <TodayGamePanel player={player} />
      <PlayerTileFooter links={playerSourceLinks(player)} />
    </PlayerTile>
  );
}

function PassingTdLeadersTable({ players }: { players: PassingTdPlayer[] }) {
  const sortedPlayers = useMemo(
    () =>
      [...players].sort(
        (a, b) =>
          b.passingTouchdowns - a.passingTouchdowns ||
          a.name.localeCompare(b.name),
      ),
    [players],
  );

  return (
    <section aria-label="Passing touchdown leaders table" className="mt-4 sm:mt-6">
      <details className="group rounded-sm border border-border bg-surface/80">
        <summary className="cursor-pointer list-none px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-chrome transition-colors hover:text-sith marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-2">
            Players Shown ({sortedPlayers.length})
            <span
              aria-hidden
              className="text-[10px] text-muted transition-transform group-open:rotate-180"
            >
              ▼
            </span>
          </span>
        </summary>
        <div className="overflow-x-auto border-t border-border">
          <table className="w-full min-w-md text-left text-xs">
            <thead>
              <tr className="border-b border-border font-mono text-[10px] uppercase tracking-wide text-muted">
                <th scope="col" className="px-3 py-2 font-bold">
                  #
                </th>
                <th scope="col" className="px-3 py-2 font-bold">
                  Player
                </th>
                <th scope="col" className="px-3 py-2 font-bold">
                  Team
                </th>
                <th scope="col" className="px-3 py-2 text-right font-bold">
                  TD
                </th>
                <th scope="col" className="px-3 py-2 text-right font-bold">
                  YDS
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, index) => (
                <tr
                  key={player.id}
                  className="border-b border-border/60 last:border-b-0"
                >
                  <td className="px-3 py-1.5 font-mono tabular-nums text-muted">
                    {index + 1}
                  </td>
                  <td className="px-3 py-1.5">
                    <a
                      href={espnNflPlayerUrl(player.id, player.slug || player.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-chrome underline-offset-2 hover:text-sith hover:underline"
                    >
                      {player.name}
                    </a>
                  </td>
                  <td className="px-3 py-1.5 text-muted">
                    {player.teamName ?? "—"}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono font-bold tabular-nums text-sith">
                    {player.passingTouchdowns}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono tabular-nums text-muted">
                    {player.passingYards.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}

export default function PassingTdBoard({
  players,
  season,
  seasonName,
  liveSeasonType,
  fetchedAt,
}: {
  players: PassingTdPlayer[];
  season: number;
  seasonName: string;
  liveSeasonType: number;
  fetchedAt: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTd40, setFilterTd40] = useState(false);
  const [filterTd30, setFilterTd30] = useState(false);
  const [filterTd20, setFilterTd20] = useState(false);
  const [filterTdPerGame, setFilterTdPerGame] = useState(false);
  const [filterGameToday, setFilterGameToday] = useState(false);
  const [filterStarred, setFilterStarred] = useState(false);
  const [selectedGameHomeTeamId, setSelectedGameHomeTeamId] = useState<
    number | null
  >(null);
  const [sortBy, setSortBy] = useState<"tds" | "yards" | "rating" | "tdg">(
    "tds",
  );
  const { starredIds, toggleStar } = useStarredPlayers(
    PASSING_TDS.starredStorageKey,
  );
  const { comparedIds, toggleCompare, clearComparison } = useComparedPlayers();

  const activeGames = useMemo(() => collectActiveGames(players), [players]);

  const displayedPlayers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return players
      .filter((player) => {
        if (
          normalizedQuery &&
          !player.name.toLowerCase().includes(normalizedQuery)
        ) {
          return false;
        }
        if (filterTd40 && player.passingTouchdowns < 40) return false;
        if (filterTd30 && player.passingTouchdowns < 30) return false;
        if (filterTd20 && player.passingTouchdowns < 20) return false;
        if (filterTdPerGame && tdsPerGame(player) < 2) return false;
        if (filterGameToday && !player.gameToday) return false;
        if (filterStarred && !starredIds.has(player.id)) return false;
        if (
          selectedGameHomeTeamId !== null &&
          player.todayGame?.homeTeamId !== selectedGameHomeTeamId
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const aStarred = starredIds.has(a.id) ? 1 : 0;
        const bStarred = starredIds.has(b.id) ? 1 : 0;
        if (bStarred !== aStarred) return bStarred - aStarred;
        if (sortBy === "yards") {
          return b.passingYards - a.passingYards;
        }
        if (sortBy === "rating") {
          return (b.passerRating ?? -1) - (a.passerRating ?? -1);
        }
        if (sortBy === "tdg") {
          return tdsPerGame(b) - tdsPerGame(a);
        }
        return b.passingTouchdowns - a.passingTouchdowns;
      });
  }, [
    players,
    searchQuery,
    filterTd40,
    filterTd30,
    filterTd20,
    filterTdPerGame,
    filterGameToday,
    filterStarred,
    selectedGameHomeTeamId,
    starredIds,
    sortBy,
  ]);

  const comparedPlayers = players.filter((player) => comparedIds.has(player.id));

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 sm:px-6 sm:py-6">
      <section className="mb-4 sm:mb-6">
        <h1 className="text-xl font-bold uppercase tracking-[0.08em] text-chrome sm:text-2xl lg:text-3xl">
          Passing Touchdowns
        </h1>
        <p className="mt-1 text-sm text-muted sm:text-base">
          QB passing TD leaders, 17-game pace, and today&apos;s opponent — live
          from ESPN.
        </p>
        <p className="mt-1 text-xs text-muted">
          {season} {seasonName.toLowerCase()} · updated{" "}
          {new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(fetchedAt))}
        </p>
        {liveSeasonType === 1 ? (
          <p className="mt-1 text-xs text-muted">
            Regular-season leaders from last year, with this week&apos;s NFL
            games overlaid.
          </p>
        ) : null}
      </section>

      <ReportToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={
          <>
            <FilterChip
              active={filterTd40}
              onClick={() => setFilterTd40((value) => !value)}
            >
              40+ TD
            </FilterChip>
            <FilterChip
              active={filterTd30}
              onClick={() => setFilterTd30((value) => !value)}
            >
              30+ TD
            </FilterChip>
            <FilterChip
              active={filterTd20}
              onClick={() => setFilterTd20((value) => !value)}
            >
              20+ TD
            </FilterChip>
            <FilterChip
              active={filterTdPerGame}
              onClick={() => setFilterTdPerGame((value) => !value)}
            >
              2+ TD/G
            </FilterChip>
            <FilterChip
              active={filterGameToday}
              onClick={() => setFilterGameToday((value) => !value)}
            >
              Game Today
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
                { value: "tds", label: "TDs" },
                { value: "yards", label: "Yards" },
                { value: "rating", label: "RTG" },
                { value: "tdg", label: "TD/G" },
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
          <li key={player.id}>
            <PlayerCard
              player={player}
              isStarred={starredIds.has(player.id)}
              onToggleStar={() => toggleStar(player.id)}
              isCompared={true}
              onToggleCompare={() => toggleCompare(player.id)}
            />
          </li>
        ))}
      </CompareSection>

      {displayedPlayers.length === 0 ? (
        <NoPlayersMatch />
      ) : (
        <PlayerGrid label="Passing touchdown leaderboard">
          {displayedPlayers.map((player) => (
            <li key={player.id}>
              <PlayerCard
                player={player}
                isStarred={starredIds.has(player.id)}
                onToggleStar={() => toggleStar(player.id)}
                isCompared={comparedIds.has(player.id)}
                onToggleCompare={() => toggleCompare(player.id)}
              />
            </li>
          ))}
        </PlayerGrid>
      )}

      <aside className="mt-4 rounded-sm border border-border bg-surface/80 px-4 py-3 sm:mt-6">
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {[
            { label: "40+", range: "elite", dotClass: "bg-sith-dim" },
            { label: "30–39", range: "high", dotClass: "bg-cold-orange" },
            { label: "20–29", range: "solid", dotClass: "bg-cold-yellow" },
            { label: "10–19", range: "depth", dotClass: "bg-cold-green" },
          ].map(({ label, range, dotClass }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`size-2.5 shrink-0 rounded-full ${dotClass}`} />
              <span className="font-mono text-[11px] uppercase tracking-wide text-chrome">
                {label} TD
              </span>
              <span className="font-mono text-[11px] text-muted">{range}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 border-t border-border/50 pt-2 space-y-1 font-mono text-[11px] text-muted">
          <div>
            <span className="uppercase tracking-wide text-chrome">TD/G</span>
            {` — passing touchdowns per game (projected full-season total at ${GAMES_IN_NFL_SEASON} G pace)`}
          </div>
          <div>
            <span className="uppercase tracking-wide text-chrome">RTG</span>
            {" — passer rating from current season passing stats"}
          </div>
        </div>
      </aside>

      <PassingTdReference />
      <PassingTdLeadersTable players={players} />
    </main>
  );
}

function PassingTdReference() {
  return (
    <section aria-label="Field reference" className="mt-4 sm:mt-6">
      <details className="group rounded-sm border border-border bg-surface/80">
        <summary className="cursor-pointer list-none px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-chrome transition-colors hover:text-sith marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-2">
            What the numbers mean
            <span
              aria-hidden
              className="text-[10px] text-muted transition-transform group-open:rotate-180"
            >
              ▼
            </span>
          </span>
        </summary>
        <div className="border-t border-border px-4 py-4 space-y-3 text-xs leading-relaxed text-muted">
          <p>
            Qualified NFL quarterbacks ranked by passing touchdowns. Data
            refreshes every 15 minutes.
          </p>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="font-mono text-[10px] font-bold uppercase tracking-wide text-sith">
                TD / Proj TD
              </dt>
              <dd className="mt-0.5">
                Season passing touchdowns, then a 17-game projection from
                current pace.
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] font-bold uppercase tracking-wide text-sith">
                Game today
              </dt>
              <dd className="mt-0.5">
                Player&apos;s team has an NFL game scheduled today (Eastern).
                Does not confirm the starter.
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] font-bold uppercase tracking-wide text-sith">
                Opponent
              </dt>
              <dd className="mt-0.5">
                Today&apos;s matchup, stadium, and kickoff/status from the ESPN
                scoreboard.
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] font-bold uppercase tracking-wide text-sith">
                Yards / CMP% / INT
              </dt>
              <dd className="mt-0.5">
                Passing yards, completion percentage, and interceptions for the
                same season window.
              </dd>
            </div>
          </dl>
        </div>
      </details>
    </section>
  );
}
