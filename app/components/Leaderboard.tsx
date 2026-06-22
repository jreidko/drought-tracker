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
import LeaderboardReference from "@/app/components/LeaderboardReference";
import HomeRunLeadersTable from "@/app/components/HomeRunLeadersTable";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";

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


function PlayerLinks({ player }: { player: Player }) {
  const linkClass =
    "font-mono text-[10px] uppercase tracking-wide text-chrome transition-colors hover:text-sith hover:underline";

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0 font-mono text-[10px] uppercase tracking-wide">
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
      {player.espnId !== undefined ? (
        <a
          href={espnPlayerUrl(player.espnId, player.name)}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          ESPN
        </a>
      ) : null}
    </div>
  );
}

function PlayerPanelGridCell({
  label,
  value,
  sub,
}: {
  label: string;
  value?: string;
  sub?: string;
}) {
  return (
    <div className="player-panel-grid-cell">
      <span className="player-panel-kicker">{label}</span>
      {value !== undefined ? (
        <>
          <span className="player-panel-grid-value">{value}</span>
          {sub ? <span className="player-panel-grid-sub">{sub}</span> : null}
        </>
      ) : null}
    </div>
  );
}


function StatusDot({ on, onClass }: { on: boolean; onClass: string }) {
  return (
    <span
      className={`inline-block size-1.5 rounded-full ${on ? onClass : "bg-muted/30"}`}
    />
  );
}

function PlayerStatusBadges({ player }: { player: Player }) {
  const injured = player.rosterStatus === "inactive";

  return (
    <div className="mt-1.5 flex items-center gap-2.5">
      <span className="inline-flex items-center gap-1">
        <StatusDot on={!injured} onClass="bg-cold-teal" />
        <span
          className={`font-mono text-[9px] uppercase tracking-wide ${
            !injured ? "text-cold-teal" : "text-muted/50"
          }`}
        >
          Active
        </span>
      </span>
      <span className="inline-flex items-center gap-1">
        <StatusDot on={player.gameToday} onClass="bg-sith" />
        <span
          className={`font-mono text-[9px] uppercase tracking-wide ${
            player.gameToday ? "text-chrome" : "text-muted/50"
          }`}
        >
          Game
        </span>
      </span>
      <span className="inline-flex items-center gap-1">
        <StatusDot on={injured} onClass="bg-cold-yellow" />
        <span
          className={`font-mono text-[9px] uppercase tracking-wide ${
            injured ? "text-cold-yellow" : "text-muted/50"
          }`}
        >
          IL
        </span>
      </span>
    </div>
  );
}

function TodayGamePanel({ todayGame }: { todayGame: TodayGameInfo }) {
  const parkFactorLabel = describeHrParkFactor(todayGame.hrParkFactor);

  return (
    <div className="border-t border-border bg-surface/40 px-2.5 py-2">
      <div className="flex items-start gap-2">
        <Image
          src={mlbTeamLogoUrl(todayGame.homeTeamId)}
          alt=""
          aria-hidden={true}
          width={24}
          height={24}
          className="mt-0.5 shrink-0 opacity-90"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wide text-chrome">
              {todayGame.venueName}
            </span>
            <span className="shrink-0 font-mono text-[9px] uppercase tracking-wide text-muted">
              {todayGame.isHome ? "Home" : "Away"}
            </span>
          </div>
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
                <a
                  href={mlbPlayerStatsUrl(
                    todayGame.opposingPitcher.name,
                    todayGame.opposingPitcher.mlbPlayerId,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate font-mono text-xs font-bold text-chrome underline-offset-2 hover:text-sith hover:underline"
                >
                  {todayGame.opposingPitcher.name}
                </a>
                <span className="mt-0.5 block font-mono text-[10px] tabular-nums text-muted">
                  {todayGame.opposingPitcher.record} · {todayGame.opposingPitcher.era} ERA ·{" "}
                  {todayGame.opposingPitcher.whip} WHIP
                </span>
                <span className="block font-mono text-[10px] tabular-nums text-muted">
                  {todayGame.opposingPitcher.homeRuns} HR · {todayGame.opposingPitcher.strikeOuts}{" "}
                  K · {todayGame.opposingPitcher.inningsPitched} IP
                </span>
              </>
            ) : (
              <span className="block font-mono text-xs font-bold text-muted">TBD</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function useStarredPlayers() {
  const [starredIds, setStarredIds] = useState<Set<number>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem("starredPlayers");
      return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggleStar = useCallback((id: number) => {
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem("starredPlayers", JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }, []);

  return { starredIds, toggleStar };
}

function PlayerCard({
  player,
  isStarred,
  onToggleStar,
}: {
  player: Player;
  isStarred: boolean;
  onToggleStar: () => void;
}) {
  const games1Y = averageGamesBetweenHomeRuns(player.avgHr1Year, GAMES_IN_SEASON);
  const games3Y = averageGamesBetweenHomeRuns(player.avgHr3Year, GAMES_IN_SEASON);
  const games5Y = averageGamesBetweenHomeRuns(player.avgHr5Year, GAMES_IN_SEASON);
  const droughtReversedClass = getDroughtReversedClass(player.droughtStreak);

  return (
    <article
      className={`player-panel overflow-hidden rounded-sm border ${getRowHighlightClass(player.droughtStreak)}`}
    >
      <div className="flex items-center gap-2 border-b border-border px-2.5 py-1.5">
        {player.teamId !== null ? (
          <>
            <Image
              src={mlbTeamLogoUrl(player.teamId)}
              alt=""
              aria-hidden={true}
              width={20}
              height={20}
              className="shrink-0 opacity-90"
            />
            <span className="font-mono text-[10px] uppercase tracking-wide text-muted">
              {player.teamName}
            </span>
          </>
        ) : null}
        <button
          onClick={onToggleStar}
          aria-label={isStarred ? "Unstar player" : "Star player"}
          className="ml-auto shrink-0 transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={isStarred ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            className={isStarred ? "text-yellow-400" : "text-muted hover:text-chrome"}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      </div>
      <div className="flex border-b border-border">
        <div className="flex flex-1 flex-col border-r border-border px-2.5 py-2">
          <span className="player-panel-kicker">Name</span>
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
          <PlayerStatusBadges player={player} />
        </div>
        <div className="flex w-1/3 flex-col px-2.5 py-2">
          <span className="player-panel-kicker">{getDroughtTierLabel(player.droughtStreak)}</span>
          <div className={`player-panel-drought-reversed flex-1 ${droughtReversedClass}`}>
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

      <footer className="border-t border-border bg-surface/60 px-2 py-1.5">
        <PlayerLinks player={player} />
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
  const [filterProjHR30, setFilterProjHR30] = useState(false);
  const [filterProjHR, setFilterProjHR] = useState(false);
  const [filterAvg3Y20, setFilterAvg3Y20] = useState(false);
  const [filterAvg3Y30, setFilterAvg3Y30] = useState(false);
  const [filterGameToday, setFilterGameToday] = useState(false);
  const [filterDrought, setFilterDrought] = useState(false);
  const [filterStarred, setFilterStarred] = useState(false);
  const { starredIds, toggleStar } = useStarredPlayers();

  const displayedPlayers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return players
      .filter((player) => {
        if (normalizedQuery && !player.name.toLowerCase().includes(normalizedQuery)) return false;
        if (filterProjHR30 && player.projectedSeasonHRs <= 30) return false;
        if (filterProjHR && player.projectedSeasonHRs <= 40) return false;
        if (filterAvg3Y20 && (player.avgHr3Year === null || player.avgHr3Year <= 20)) return false;
        if (filterAvg3Y30 && (player.avgHr3Year === null || player.avgHr3Year <= 30)) return false;
        if (filterGameToday && !player.gameToday) return false;
        if (filterDrought && player.droughtStreak < 3) return false;
        if (filterStarred && !starredIds.has(player.mlbPlayerId)) return false;
        return true;
      })
      .sort((a, b) => {
        const aStarred = starredIds.has(a.mlbPlayerId) ? 1 : 0;
        const bStarred = starredIds.has(b.mlbPlayerId) ? 1 : 0;
        if (bStarred !== aStarred) return bStarred - aStarred;
        return b.droughtStreak - a.droughtStreak;
      });
  }, [players, searchQuery, filterProjHR30, filterProjHR, filterAvg3Y20, filterAvg3Y30, filterGameToday, filterDrought, filterStarred, starredIds]);

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

      <section aria-label="Search and filter controls" className="mb-4 space-y-2 sm:mb-6">
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
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilterProjHR30((v) => !v)}
            className={`rounded-sm border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors ${
              filterProjHR30
                ? "border-sith bg-sith/15 text-sith"
                : "border-border bg-surface-elevated text-muted hover:border-sith/40 hover:text-chrome"
            }`}
          >
            30+ Proj HR
          </button>
          <button
            type="button"
            onClick={() => setFilterProjHR((v) => !v)}
            className={`rounded-sm border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors ${
              filterProjHR
                ? "border-sith bg-sith/15 text-sith"
                : "border-border bg-surface-elevated text-muted hover:border-sith/40 hover:text-chrome"
            }`}
          >
            40+ Proj HR
          </button>
          <button
            type="button"
            onClick={() => setFilterAvg3Y20((v) => !v)}
            className={`rounded-sm border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors ${
              filterAvg3Y20
                ? "border-sith bg-sith/15 text-sith"
                : "border-border bg-surface-elevated text-muted hover:border-sith/40 hover:text-chrome"
            }`}
          >
            3Y Avg {'>'} 20
          </button>
          <button
            type="button"
            onClick={() => setFilterAvg3Y30((v) => !v)}
            className={`rounded-sm border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors ${
              filterAvg3Y30
                ? "border-sith bg-sith/15 text-sith"
                : "border-border bg-surface-elevated text-muted hover:border-sith/40 hover:text-chrome"
            }`}
          >
            3Y Avg {'>'} 30
          </button>
          <button
            type="button"
            onClick={() => setFilterGameToday((v) => !v)}
            className={`rounded-sm border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors ${
              filterGameToday
                ? "border-sith bg-sith/15 text-sith"
                : "border-border bg-surface-elevated text-muted hover:border-sith/40 hover:text-chrome"
            }`}
          >
            Game Today
          </button>
          <button
            type="button"
            onClick={() => setFilterDrought((v) => !v)}
            className={`rounded-sm border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors ${
              filterDrought
                ? "border-sith bg-sith/15 text-sith"
                : "border-border bg-surface-elevated text-muted hover:border-sith/40 hover:text-chrome"
            }`}
          >
            3+ Game Drought
          </button>
          <button
            type="button"
            onClick={() => setFilterStarred((v) => !v)}
            className={`flex items-center gap-1.5 rounded-sm border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors ${
              filterStarred
                ? "border-yellow-400/60 bg-yellow-400/10 text-yellow-400"
                : "border-border bg-surface-elevated text-muted hover:border-yellow-400/40 hover:text-chrome"
            }`}
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
          </button>
        </div>
      </section>

      {displayedPlayers.length === 0 ? (
        <p className="rounded-sm border border-dashed border-border px-4 py-10 text-center text-sm text-muted">
          No players match your search.
        </p>
      ) : (
        <ul
          className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          aria-label="Player leaderboard"
        >
          {displayedPlayers.map((player) => (
            <li key={player.mlbPlayerId}>
              <PlayerCard
                  player={player}
                  isStarred={starredIds.has(player.mlbPlayerId)}
                  onToggleStar={() => toggleStar(player.mlbPlayerId)}
                />
            </li>
          ))}
        </ul>
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
      </aside>

      <LeaderboardReference />

      <HomeRunLeadersTable players={players} />
    </main>
  );
}
