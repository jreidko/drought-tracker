"use client";

import { collectActiveGames } from "@/lib/reports/games-today";
import type { ReportDef } from "@/lib/reports/catalog";
import { GAMES_IN_NFL_SEASON, type NflPlayer } from "@/lib/nfl-player";
import type { NflReportSpec, NflStatFormat } from "@/lib/nfl-reports";
import {
  nflPerGame,
  nflProjected,
  nflStatNumber,
} from "@/lib/nfl-stats";
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

function formatStat(value: number | null | undefined, format: NflStatFormat): string {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }
  if (format === "pct") {
    return `${value.toFixed(1)}%`;
  }
  if (format === "float") {
    return value.toFixed(1);
  }
  return Math.round(value).toLocaleString();
}

function highlightClass(value: number, thresholds: NflReportSpec["highlight"]) {
  if (value >= thresholds[0]) {
    return "border-sith-dim/50 bg-sith-dim/10 sith-box-glow";
  }
  if (value >= thresholds[1]) {
    return "border-cold-orange/50 bg-cold-orange/10 cold-orange-box-glow";
  }
  if (value >= thresholds[2]) {
    return "border-cold-yellow/30 bg-cold-yellow/5 cold-yellow-box-glow";
  }
  if (value >= thresholds[3]) {
    return "border-cold-green/30 bg-cold-green/5 cold-green-box-glow";
  }
  return "border-border bg-surface";
}

function reversedClass(value: number, thresholds: NflReportSpec["highlight"]) {
  if (value >= thresholds[0]) {
    return "player-panel-drought-reversed-warm";
  }
  if (value >= thresholds[1]) {
    return "player-panel-drought-reversed-cold-orange";
  }
  if (value >= thresholds[2]) {
    return "player-panel-drought-reversed-cold-yellow";
  }
  if (value >= thresholds[3]) {
    return "player-panel-drought-reversed-cold-green";
  }
  return "";
}

function playerSourceLinks(player: NflPlayer): SourceLink[] {
  return [
    { label: "ESPN", href: espnNflPlayerUrl(player.id, player.slug) },
    { label: "Stats", href: espnNflPlayerStatsUrl(player.id, player.slug) },
  ];
}

function TodayGamePanel({ player }: { player: NflPlayer }) {
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
  spec,
  isStarred,
  onToggleStar,
  isCompared,
  onToggleCompare,
}: {
  player: NflPlayer;
  spec: NflReportSpec;
  isStarred: boolean;
  onToggleStar: () => void;
  isCompared: boolean;
  onToggleCompare: () => void;
}) {
  const primary = nflStatNumber(player, spec.primaryStat, spec);
  const projected = nflProjected(player, spec);
  const pace = nflPerGame(player, spec);
  const kickerValue = spec.kicker
    ? player.stats[spec.kicker.stat]
    : null;

  return (
    <PlayerTile highlightClass={highlightClass(primary, spec.highlight)}>
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
            {spec.kicker && kickerValue != null ? (
              <span className="font-mono text-[8px] font-semibold uppercase tracking-[0.12em] text-muted tabular-nums">
                {spec.kicker.label} {formatStat(kickerValue, spec.kicker.format)}
              </span>
            ) : (
              <span className="font-mono text-[8px] font-semibold uppercase tracking-[0.12em] text-muted">
                {player.position}
              </span>
            )}
          </div>
          <a
            href={espnNflPlayerUrl(player.id, player.slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="player-panel-name underline-offset-2 hover:underline"
          >
            {player.name}
          </a>
          <span className="mt-1 block font-mono text-xs font-bold tabular-nums text-sith">
            {formatStat(primary, "int")} / {formatStat(projected, "int")}{" "}
            {spec.primaryUnit}
          </span>
          {player.gamesPlayed > 0 ? (
            <span className="block font-mono text-[10px] tabular-nums text-muted">
              {pace.toFixed(2)} {spec.primaryUnit}/G · {player.gamesPlayed} G
            </span>
          ) : null}
          <PlayerStatusBadges
            rosterStatus={player.rosterStatus}
            gameToday={player.gameToday}
            inactiveLabel="IR"
          />
        </div>
        <div className="flex w-1/3 flex-col px-2.5 py-2">
          <span className="player-panel-kicker">{spec.primaryLabel}</span>
          <div
            className={`player-panel-drought-reversed flex-1 ${reversedClass(primary, spec.highlight)}`}
          >
            {formatStat(primary, Number.isInteger(primary) || primary >= 100 ? "int" : "float")}
          </div>
        </div>
      </div>

      <div className="player-panel-grid">
        {spec.grid.map((cell) => {
          let sub: string | undefined;
          if (cell.subStats) {
            sub = cell.subStats
              .map((key) => formatStat(player.stats[key], "int"))
              .join("/");
          } else if (cell.subStat) {
            const subValue = player.stats[cell.subStat];
            sub =
              cell.subFormat === "float" && subValue != null
                ? `${formatStat(subValue, "float")} /G`
                : formatStat(subValue, cell.subFormat ?? "int");
          }
          return (
            <PlayerPanelGridCell
              key={cell.label}
              label={cell.label}
              value={formatStat(player.stats[cell.stat], cell.format)}
              sub={sub}
            />
          );
        })}
      </div>

      <TodayGamePanel player={player} />
      <PlayerTileFooter links={playerSourceLinks(player)} />
    </PlayerTile>
  );
}

function LeadersTable({
  players,
  spec,
}: {
  players: NflPlayer[];
  spec: NflReportSpec;
}) {
  const sortedPlayers = useMemo(
    () =>
      [...players].sort(
        (a, b) =>
          nflStatNumber(b, spec.primaryStat, spec) -
            nflStatNumber(a, spec.primaryStat, spec) ||
          a.name.localeCompare(b.name),
      ),
    [players, spec],
  );

  return (
    <section aria-label="Leaders table" className="mt-4 sm:mt-6">
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
                  {spec.primaryUnit}
                </th>
                <th scope="col" className="px-3 py-2 text-right font-bold">
                  {spec.tableStat.label}
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
                      href={espnNflPlayerUrl(player.id, player.slug)}
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
                    {formatStat(player.stats[spec.primaryStat], "int")}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono tabular-nums text-muted">
                    {formatStat(player.stats[spec.tableStat.stat], spec.tableStat.format)}
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

export default function NflReportBoard({
  spec,
  report,
  players,
  season,
  seasonName,
  liveSeasonType,
  fetchedAt,
}: {
  spec: NflReportSpec;
  report: ReportDef;
  players: NflPlayer[];
  season: number;
  seasonName: string;
  liveSeasonType: number;
  fetchedAt: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOn, setFilterOn] = useState<Record<string, boolean>>({});
  const [filterGameToday, setFilterGameToday] = useState(false);
  const [filterStarred, setFilterStarred] = useState(false);
  const [selectedGameHomeTeamId, setSelectedGameHomeTeamId] = useState<
    number | null
  >(null);
  const [sortBy, setSortBy] = useState(spec.sorts[0]?.id ?? "primary");
  const { starredIds, toggleStar } = useStarredPlayers(report.starredStorageKey);
  const { comparedIds, toggleCompare, clearComparison } = useComparedPlayers();

  const activeGames = useMemo(() => collectActiveGames(players), [players]);
  const sortDef =
    spec.sorts.find((item) => item.id === sortBy) ?? spec.sorts[0];

  const displayedPlayers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return players
      .filter((player) => {
        if (normalizedQuery && !player.name.toLowerCase().includes(normalizedQuery)) {
          return false;
        }
        for (const filter of spec.filters) {
          if (filterOn[filter.id] && nflStatNumber(player, filter.stat, spec) < filter.min) {
            return false;
          }
        }
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
        return (
          nflStatNumber(b, sortDef.stat, spec) - nflStatNumber(a, sortDef.stat, spec)
        );
      });
  }, [
    players,
    spec,
    searchQuery,
    filterOn,
    filterGameToday,
    filterStarred,
    selectedGameHomeTeamId,
    starredIds,
    sortDef,
  ]);

  const comparedPlayers = players.filter((player) => comparedIds.has(player.id));

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 sm:px-6 sm:py-6">
      <section className="mb-4 sm:mb-6">
        <h1 className="text-xl font-bold uppercase tracking-[0.08em] text-chrome sm:text-2xl lg:text-3xl">
          {report.title}
        </h1>
        <p className="mt-1 text-sm text-muted sm:text-base">{spec.intro}</p>
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
            {spec.filters.map((filter) => (
              <FilterChip
                key={filter.id}
                active={Boolean(filterOn[filter.id])}
                onClick={() =>
                  setFilterOn((prev) => ({
                    ...prev,
                    [filter.id]: !prev[filter.id],
                  }))
                }
              >
                {filter.label}
              </FilterChip>
            ))}
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
            {spec.sorts.map(({ id, label }) => (
              <FilterChip
                key={id}
                active={sortBy === id}
                onClick={() => setSortBy(id)}
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
              spec={spec}
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
        <PlayerGrid label={`${report.title} leaderboard`}>
          {displayedPlayers.map((player) => (
            <li key={player.id}>
              <PlayerCard
                spec={spec}
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
          {spec.highlight.map((threshold, index) => {
            const previous = spec.highlight[index - 1];
            const label =
              index === 0
                ? `${threshold}+`
                : `${threshold}–${previous - 1}`;
            const dots = [
              "bg-sith-dim",
              "bg-cold-orange",
              "bg-cold-yellow",
              "bg-cold-green",
            ];
            return (
              <div key={threshold} className="flex items-center gap-2">
                <span className={`size-2.5 shrink-0 rounded-full ${dots[index]}`} />
                <span className="font-mono text-[11px] uppercase tracking-wide text-chrome">
                  {label} {spec.primaryUnit}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-2 border-t border-border/50 pt-2 font-mono text-[11px] text-muted">
          <span className="uppercase tracking-wide text-chrome">
            {spec.primaryUnit}/G
          </span>
          {` — per game this season (projected full-season total at ${GAMES_IN_NFL_SEASON} G pace)`}
        </div>
      </aside>

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
            <p>Data refreshes every 15 minutes from ESPN.</p>
            <dl className="grid gap-3 sm:grid-cols-2">
              {spec.reference.map((item) => (
                <div key={item.label}>
                  <dt className="font-mono text-[10px] font-bold uppercase tracking-wide text-sith">
                    {item.label}
                  </dt>
                  <dd className="mt-0.5">{item.text}</dd>
                </div>
              ))}
              <div>
                <dt className="font-mono text-[10px] font-bold uppercase tracking-wide text-sith">
                  Game today
                </dt>
                <dd className="mt-0.5">
                  Player&apos;s team has an NFL game scheduled today (Eastern).
                  Does not confirm the starter.
                </dd>
              </div>
            </dl>
          </div>
        </details>
      </section>

      <LeadersTable players={players} spec={spec} />
    </main>
  );
}
