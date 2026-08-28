"use client";

import type { ReactNode } from "react";
import type { ActiveGameOption } from "@/lib/reports/games-today";

export function FilterChip({
  active,
  onClick,
  tone = "accent",
  children,
}: {
  active: boolean;
  onClick: () => void;
  tone?: "accent" | "star";
  children: ReactNode;
}) {
  const activeClass =
    tone === "star"
      ? "border-yellow-400/60 bg-yellow-400/10 text-yellow-400"
      : "border-sith bg-sith/15 text-sith";
  const inactiveClass =
    tone === "star"
      ? "border-border bg-surface-elevated text-muted hover:border-yellow-400/40 hover:text-chrome"
      : "border-border bg-surface-elevated text-muted hover:border-sith/40 hover:text-chrome";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-sm border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors ${
        active ? activeClass : inactiveClass
      } ${tone === "star" ? "flex items-center gap-1.5" : ""}`}
    >
      {children}
    </button>
  );
}

export function PlayerSearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="sr-only">Search players by name</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search players…"
        className="w-full rounded-sm border border-border bg-surface-elevated px-4 py-3 text-base text-foreground placeholder:text-muted transition-colors focus:border-sith/60"
      />
    </label>
  );
}

export function GamesTodaySelect({
  games,
  selectedHomeTeamId,
  onChange,
}: {
  games: ActiveGameOption[];
  selectedHomeTeamId: number | null;
  onChange: (id: number | null) => void;
}) {
  if (games.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="game-filter"
        className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-muted"
      >
        Game:
      </label>
      <select
        id="game-filter"
        value={selectedHomeTeamId ?? ""}
        onChange={(event) =>
          onChange(event.target.value === "" ? null : Number(event.target.value))
        }
        className="rounded-sm border border-border bg-surface-elevated px-2 py-1.5 font-mono text-[11px] uppercase tracking-wide text-chrome transition-colors focus:border-sith/60 focus:outline-none"
      >
        <option value="">All Games</option>
        {games.map((game) => (
          <option key={game.homeTeamId} value={game.homeTeamId}>
            {game.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SortRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-wide text-muted">
        Sort:
      </span>
      {children}
    </div>
  );
}

export function ReportToolbar({
  searchQuery,
  onSearchChange,
  filters,
  games,
  selectedGameHomeTeamId,
  onSelectGame,
  sort,
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: ReactNode;
  games: ActiveGameOption[];
  selectedGameHomeTeamId: number | null;
  onSelectGame: (id: number | null) => void;
  sort: ReactNode;
}) {
  return (
    <section
      aria-label="Search and filter controls"
      className="mb-4 space-y-2 sm:mb-6"
    >
      <PlayerSearchInput value={searchQuery} onChange={onSearchChange} />
      <div className="flex flex-wrap gap-2">{filters}</div>
      <GamesTodaySelect
        games={games}
        selectedHomeTeamId={selectedGameHomeTeamId}
        onChange={onSelectGame}
      />
      {sort}
    </section>
  );
}
