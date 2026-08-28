"use client";

import type { ReactNode } from "react";

export function CompareSection({
  count,
  onClear,
  children,
}: {
  count: number;
  onClear: () => void;
  children: ReactNode;
}) {
  if (count === 0) {
    return null;
  }

  return (
    <section aria-label="Player comparison" className="mb-6">
      <div className="mb-2 flex items-center gap-3">
        <h2 className="font-mono text-[11px] uppercase tracking-wide text-chrome">
          Comparing {count} player{count !== 1 ? "s" : ""}
        </h2>
        <button
          type="button"
          onClick={onClear}
          className="rounded-sm border border-border bg-surface-elevated px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-muted transition-colors hover:border-sith/40 hover:text-chrome"
        >
          Clear
        </button>
      </div>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {children}
      </ul>
      <div className="mt-4 border-t border-border/50" />
    </section>
  );
}

export function PlayerGrid({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <ul
      className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-label={label}
    >
      {children}
    </ul>
  );
}

export function NoPlayersMatch() {
  return (
    <p className="rounded-sm border border-dashed border-border px-4 py-10 text-center text-sm text-muted">
      No players match your search.
    </p>
  );
}
