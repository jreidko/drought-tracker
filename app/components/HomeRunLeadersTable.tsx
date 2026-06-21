"use client";

import { mlbPlayerStatsUrl } from "@/lib/player-links";
import type { Player } from "@/lib/player";
import { useMemo } from "react";

export default function HomeRunLeadersTable({ players }: { players: Player[] }) {
  const sortedPlayers = useMemo(
    () =>
      [...players].sort(
        (a, b) =>
          b.homeRunsThisSeason - a.homeRunsThisSeason ||
          a.name.localeCompare(b.name),
      ),
    [players],
  );

  return (
    <section aria-label="Home run leaders table" className="mt-4 sm:mt-6">
      <details className="group rounded-sm border border-border bg-surface/80">
        <summary className="cursor-pointer list-none px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-chrome transition-colors hover:text-sith marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-2">
            Home Run Leaders ({sortedPlayers.length})
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
                  HR
                </th>
                <th scope="col" className="px-3 py-2 text-right font-bold">
                  Proj
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, index) => (
                <tr
                  key={player.mlbPlayerId}
                  className="border-b border-border/60 last:border-b-0"
                >
                  <td className="px-3 py-1.5 font-mono tabular-nums text-muted">
                    {index + 1}
                  </td>
                  <td className="px-3 py-1.5">
                    <a
                      href={mlbPlayerStatsUrl(player.name, player.mlbPlayerId)}
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
                    {player.homeRunsThisSeason}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono tabular-nums text-muted">
                    {player.projectedSeasonHRs}
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
