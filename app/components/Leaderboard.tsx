"use client";

import {
  averageGamesBetweenHomeRuns,
  formatAverageHomeRuns,
  formatGamesBetweenHomeRuns,
  GAMES_IN_MLB_SEASON,
} from "@/lib/hr-averages";
import type { Player } from "@/lib/player";
import {
  baseballReferenceUrl,
  baseballSavantUrl,
  fanGraphsPlayerUrl,
  mlbPlayerStatsUrl,
} from "@/lib/player-links";
import { useMemo, useState, type ReactNode } from "react";

type PlayerWithMetrics = Player & {
  hrPerGame: number;
  hrPerGameFormatted: string;
};

type SortColumn =
  | "name"
  | "projectedSeasonHRs"
  | "hrPerGame"
  | "droughtStreak"
  | "avgHr1Year"
  | "avgHr5Year"
  | "avgHr10Year";
type SortDirection = "asc" | "desc";

const GAMES_IN_SEASON = GAMES_IN_MLB_SEASON;

const SORT_OPTIONS: { key: SortColumn; label: string; shortLabel: string }[] = [
  { key: "droughtStreak", label: "Drought Streak", shortLabel: "Drought" },
  { key: "projectedSeasonHRs", label: "Projected HRs", shortLabel: "Proj HR" },
  { key: "avgHr1Year", label: "1-Yr Avg HR", shortLabel: "1Y Avg" },
  { key: "avgHr5Year", label: "5-Yr Avg HR", shortLabel: "5Y Avg" },
  { key: "avgHr10Year", label: "10-Yr Avg HR", shortLabel: "10Y Avg" },
  { key: "hrPerGame", label: "HR per Game", shortLabel: "HR/G" },
  { key: "name", label: "Name", shortLabel: "Name" },
];

const TABLE_COLUMNS: {
  key: SortColumn;
  label: string;
  align?: "right";
}[] = [
  { key: "name", label: "Name" },
  { key: "avgHr10Year", label: "10Y Avg", align: "right" },
  { key: "avgHr5Year", label: "5Y Avg", align: "right" },
  { key: "avgHr1Year", label: "1Y Avg", align: "right" },
  { key: "projectedSeasonHRs", label: "Projected HRs", align: "right" },
  { key: "droughtStreak", label: "Drought", align: "right" },
];

function compareNullableNumbers(a: number | null, b: number | null) {
  if (a === null && b === null) {
    return 0;
  }
  if (a === null) {
    return 1;
  }
  if (b === null) {
    return -1;
  }
  return a - b;
}

function SortIndicator({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDirection;
}) {
  if (!active) {
    return (
      <span className="ml-0.5 inline-block w-3 text-muted" aria-hidden>
        ↕
      </span>
    );
  }

  return (
    <span className="ml-0.5 inline-block w-3 text-sith" aria-hidden>
      {direction === "asc" ? "↑" : "↓"}
    </span>
  );
}

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
      return "border-sith/50 bg-sith/10 sith-box-glow-strong";
    case "charged":
      return "border-sith/30 bg-sith/5 sith-box-glow";
    case "cold-orange":
      return "border-cold-orange/30 bg-cold-orange/5 cold-orange-box-glow";
    case "cold-yellow":
      return "border-cold-yellow/30 bg-cold-yellow/5 cold-yellow-box-glow";
    case "cold-teal":
      return "border-cold-teal/50 bg-cold-teal/10 cold-teal-box-glow-strong";
    default:
      return "border-border bg-surface";
  }
}

function getDroughtReversedClass(droughtStreak: number) {
  switch (getDroughtTier(droughtStreak)) {
    case "ignited":
      return "player-panel-drought-reversed-hot";
    case "charged":
      return "player-panel-drought-reversed-warm";
    case "cold-orange":
      return "player-panel-drought-reversed-cold-orange";
    case "cold-yellow":
      return "player-panel-drought-reversed-cold-yellow";
    case "cold-teal":
      return "player-panel-drought-reversed-cold-teal";
    default:
      return "";
  }
}

function getDroughtBadgeLabel(streak: number) {
  switch (getDroughtTier(streak)) {
    case "ignited":
      return "Ignited · ";
    case "charged":
      return "Charged · ";
    case "cold-orange":
      return "Cooling · ";
    case "cold-yellow":
      return "Cold · ";
    case "cold-teal":
      return "Frozen · ";
    default:
      return "";
  }
}

function DroughtBadge({ streak }: { streak: number }) {
  const tier = getDroughtTier(streak);

  const toneClass =
    tier === "ignited"
      ? "border-sith/60 bg-sith/20 text-sith sith-text-glow"
      : tier === "charged"
      ? "border-sith/40 bg-sith/10 text-red-300"
      : tier === "cold-orange"
      ? "border-cold-orange/40 bg-cold-orange/10 text-orange-300 cold-orange-text-glow"
      : tier === "cold-yellow"
      ? "border-cold-yellow/40 bg-cold-yellow/10 text-yellow-200 cold-yellow-text-glow"
      : tier === "cold-teal"
      ? "border-cold-teal/60 bg-cold-teal/20 text-cold-teal cold-teal-text-glow"
      : "border-border bg-surface-elevated text-chrome";

  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium uppercase tracking-wide tabular-nums ${toneClass}`}
    >
      {getDroughtBadgeLabel(streak)}
      {streak} game{streak === 1 ? "" : "s"}
    </span>
  );
}

function PlayerLinks({
  player,
  compact = false,
}: {
  player: Player;
  compact?: boolean;
}) {
  const linkClass = compact
    ? "font-mono text-[10px] uppercase tracking-wide text-chrome transition-colors hover:text-sith hover:underline"
    : "inline-flex min-h-11 items-center rounded-sm px-2 text-chrome transition-colors hover:text-sith hover:underline";

  return (
    <div
      className={`flex flex-wrap items-center ${
        compact
          ? "gap-x-2 gap-y-0 font-mono text-[10px] uppercase tracking-wide"
          : "gap-2 text-xs text-muted"
      }`}
    >
      <a
        href={baseballSavantUrl(player.name, player.mlbPlayerId)}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        Savant
      </a>
      {player.fanGraphsId !== undefined ? (
        <a
          href={fanGraphsPlayerUrl(player.fanGraphsId, player.name)}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          FanGraphs
        </a>
      ) : null}
      {player.baseballReferencePath !== undefined ? (
        <a
          href={baseballReferenceUrl(player.baseballReferencePath)}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          B-Ref
        </a>
      ) : null}
    </div>
  );
}

function PlayerPanelGridCell({
  label,
  value,
  sub,
  prominent = false,
  accent = false,
  drought = false,
  droughtClass = "",
  children,
}: {
  label: string;
  value?: string;
  sub?: string;
  prominent?: boolean;
  accent?: boolean;
  drought?: boolean;
  droughtClass?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`player-panel-grid-cell ${prominent ? "player-panel-grid-cell-prominent" : ""} ${drought ? "player-panel-grid-cell-drought" : ""}`}
    >
      <span className="player-panel-kicker">{label}</span>
      {children}
      {!children && !drought && value !== undefined ? (
        <>
          <span
            className={`player-panel-grid-value ${accent ? "player-panel-grid-value-accent" : ""}`}
          >
            {value}
          </span>
          {sub ? <span className="player-panel-grid-sub">{sub}</span> : null}
        </>
      ) : null}
      {!children && drought && value !== undefined ? (
        <div className={`player-panel-drought-reversed ${droughtClass}`}>
          {value}
        </div>
      ) : null}
    </div>
  );
}

function AvgHrTableCell({ avgHr }: { avgHr: number | null }) {
  const gamesBetween = averageGamesBetweenHomeRuns(avgHr, GAMES_IN_SEASON);

  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="tabular-nums">{formatAverageHomeRuns(avgHr)}</span>
      <span className="text-[11px] tabular-nums text-muted">
        {formatGamesBetweenHomeRuns(gamesBetween)}
      </span>
    </div>
  );
}

function PlayerCard({ player }: { player: PlayerWithMetrics }) {
  const games1Y = averageGamesBetweenHomeRuns(
    player.avgHr1Year,
    GAMES_IN_SEASON
  );
  const games5Y = averageGamesBetweenHomeRuns(
    player.avgHr5Year,
    GAMES_IN_SEASON
  );
  const games10Y = averageGamesBetweenHomeRuns(
    player.avgHr10Year,
    GAMES_IN_SEASON
  );

  const droughtReversedClass = getDroughtReversedClass(player.droughtStreak);

  return (
    <article
      className={`player-panel overflow-hidden rounded-none border ${getRowHighlightClass(
        player.droughtStreak
      )}`}
    >
      <div className="player-panel-grid">
        <PlayerPanelGridCell label="Name" prominent>
          <a
            href={mlbPlayerStatsUrl(player.name, player.mlbPlayerId)}
            target="_blank"
            rel="noopener noreferrer"
            className="player-panel-name underline-offset-2 hover:underline"
          >
            {player.name}
          </a>
        </PlayerPanelGridCell>

        <PlayerPanelGridCell
          label="1Y Avg"
          value={formatAverageHomeRuns(player.avgHr1Year)}
          sub={formatGamesBetweenHomeRuns(games1Y, true)}
          prominent
        />

        <PlayerPanelGridCell
          label="Drought"
          value={String(player.droughtStreak)}
          drought
          droughtClass={droughtReversedClass}
        />

        <PlayerPanelGridCell
          label="5Y Avg"
          value={formatAverageHomeRuns(player.avgHr5Year)}
          sub={formatGamesBetweenHomeRuns(games5Y, true)}
        />

        <PlayerPanelGridCell
          label="10Y Avg"
          value={formatAverageHomeRuns(player.avgHr10Year)}
          sub={formatGamesBetweenHomeRuns(games10Y, true)}
        />

        <PlayerPanelGridCell
          label="Proj HR"
          value={String(player.projectedSeasonHRs)}
          accent
        />
      </div>

      <footer className="border-t border-border bg-surface/60 px-2 py-1.5">
        <PlayerLinks player={player} compact />
      </footer>
    </article>
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
  const [sortColumn, setSortColumn] = useState<SortColumn>("droughtStreak");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const displayedPlayers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const withMetrics: PlayerWithMetrics[] = players.map((player) => {
      const hrPerGame = player.projectedSeasonHRs / GAMES_IN_SEASON;
      return {
        ...player,
        hrPerGame,
        hrPerGameFormatted: hrPerGame.toFixed(3),
      };
    });

    const filtered = normalizedQuery
      ? withMetrics.filter((player) =>
          player.name.toLowerCase().includes(normalizedQuery)
        )
      : withMetrics;

    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "projectedSeasonHRs":
          comparison = a.projectedSeasonHRs - b.projectedSeasonHRs;
          break;
        case "hrPerGame":
          comparison = a.hrPerGame - b.hrPerGame;
          break;
        case "droughtStreak":
          comparison = a.droughtStreak - b.droughtStreak;
          break;
        case "avgHr1Year":
          comparison = compareNullableNumbers(a.avgHr1Year, b.avgHr1Year);
          break;
        case "avgHr5Year":
          comparison = compareNullableNumbers(a.avgHr5Year, b.avgHr5Year);
          break;
        case "avgHr10Year":
          comparison = compareNullableNumbers(a.avgHr10Year, b.avgHr10Year);
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [players, searchQuery, sortColumn, sortDirection]);

  function handleSort(column: SortColumn) {
    if (sortColumn === column) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortColumn(column);
    setSortDirection(column === "name" ? "asc" : "desc");
  }

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

      <section
        aria-label="Search and sort controls"
        className="mb-4 space-y-3 sm:mb-6"
      >
        <label className="block">
          <span className="sr-only">Search players by name</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search players…"
            className="w-full rounded-sm border border-border bg-surface-elevated px-4 py-3 text-base text-foreground placeholder:text-muted transition-colors focus:border-sith/60"
          />
        </label>

        <div className="flex gap-2 lg:hidden">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Sort by</span>
            <select
              value={sortColumn}
              onChange={(event) => handleSort(event.target.value as SortColumn)}
              className="w-full rounded-sm border border-border bg-surface-elevated px-3 py-3 text-sm text-foreground transition-colors focus:border-sith/60"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  Sort: {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() =>
              setSortDirection((current) =>
                current === "asc" ? "desc" : "asc"
              )
            }
            className="shrink-0 rounded-sm border border-sith-dim/50 bg-surface-elevated px-4 py-3 text-sm font-bold uppercase tracking-wide text-sith transition-colors active:bg-sith/10"
            aria-label={`Sort ${
              sortDirection === "asc" ? "ascending" : "descending"
            }. Tap to reverse.`}
          >
            {sortDirection === "asc" ? "↑ Asc" : "↓ Desc"}
          </button>
        </div>
      </section>

      {displayedPlayers.length === 0 ? (
        <p className="rounded-sm border border-dashed border-border px-4 py-10 text-center text-sm text-muted">
          No players match your search.
        </p>
      ) : (
        <>
          <ul className="space-y-1 lg:hidden" aria-label="Player leaderboard">
            {displayedPlayers.map((player) => (
              <li key={player.mlbPlayerId}>
                <PlayerCard player={player} />
              </li>
            ))}
          </ul>

          <div
            className="hidden overflow-x-auto rounded-sm border border-border lg:block"
            aria-label="Player leaderboard table"
          >
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-elevated">
                  {TABLE_COLUMNS.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      aria-sort={
                        sortColumn === column.key
                          ? sortDirection === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                      className={`px-3 py-3 text-xs font-bold uppercase tracking-[0.1em] text-chrome xl:px-4 ${
                        column.align === "right" ? "text-right" : "text-left"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSort(column.key)}
                        className={`inline-flex items-center gap-0.5 transition-colors hover:text-sith ${
                          column.align === "right" ? "ml-auto" : ""
                        } ${sortColumn === column.key ? "text-sith" : ""}`}
                      >
                        {column.label}
                        <SortIndicator
                          active={sortColumn === column.key}
                          direction={sortDirection}
                        />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedPlayers.map((player) => (
                  <tr
                    key={player.mlbPlayerId}
                    className={`border-b border-border/60 last:border-b-0 ${getRowHighlightClass(
                      player.droughtStreak
                    )}`}
                  >
                    <td className="px-3 py-3 xl:px-4">
                      <div className="flex flex-col gap-1">
                        <a
                          href={mlbPlayerStatsUrl(
                            player.name,
                            player.mlbPlayerId
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-foreground underline-offset-2 transition-colors hover:text-sith hover:underline"
                        >
                          {player.name}
                        </a>
                        <PlayerLinks player={player} />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right xl:px-4">
                      <AvgHrTableCell avgHr={player.avgHr10Year} />
                    </td>
                    <td className="px-3 py-3 text-right xl:px-4">
                      <AvgHrTableCell avgHr={player.avgHr5Year} />
                    </td>
                    <td className="px-3 py-3 text-right xl:px-4">
                      <AvgHrTableCell avgHr={player.avgHr1Year} />
                    </td>
                    <td className="px-3 py-3 text-right font-bold tabular-nums text-sith xl:px-4">
                      {player.projectedSeasonHRs}
                    </td>
                    <td className="px-3 py-3 text-right xl:px-4">
                      <DroughtBadge streak={player.droughtStreak} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <aside className="mt-4 rounded-sm border border-border bg-surface/80 px-4 py-3 text-xs leading-relaxed text-muted sm:mt-6 sm:text-sm">
        <p>
          <span className="font-bold uppercase tracking-wide text-sith">
            Ignited / Charged:
          </span>{" "}
          crimson glow marks sluggers with 0–1 games since their last HR.{" "}
          <span className="font-bold uppercase tracking-wide text-cold-teal">
            Cooling / Cold / Frozen:
          </span>{" "}
          orange, yellow, and teal glows mark droughts of 2–3, 4–7, and 8+
          games. Historical averages use completed MLB seasons before {season};
          projected HRs use current-season pace over a {GAMES_IN_SEASON}-game
          season.
        </p>
      </aside>
    </main>
  );
}
