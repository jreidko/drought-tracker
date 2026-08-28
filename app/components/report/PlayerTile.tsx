"use client";

import type { ReactNode } from "react";
import Image from "next/image";

export function PlayerTile({
  highlightClass,
  children,
}: {
  highlightClass: string;
  children: ReactNode;
}) {
  return (
    <article
      className={`player-panel overflow-hidden rounded-sm border ${highlightClass}`}
    >
      {children}
    </article>
  );
}

export function PlayerTileHeader({
  teamLogoUrl,
  teamName,
  isStarred,
  onToggleStar,
  isCompared,
  onToggleCompare,
}: {
  teamLogoUrl: string | null;
  teamName: string | null;
  isStarred: boolean;
  onToggleStar: () => void;
  isCompared: boolean;
  onToggleCompare: () => void;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border px-2.5 py-1.5">
      {teamLogoUrl !== null ? (
        <>
          <Image
            src={teamLogoUrl}
            alt=""
            aria-hidden={true}
            width={20}
            height={20}
            className="shrink-0 opacity-90"
          />
          <span className="font-mono text-[10px] uppercase tracking-wide text-muted">
            {teamName}
          </span>
        </>
      ) : null}
      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <button
          onClick={onToggleCompare}
          aria-label={isCompared ? "Remove from comparison" : "Add to comparison"}
          className="shrink-0 transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={isCompared ? "text-cold-teal" : "text-muted hover:text-chrome"}
          >
            <rect x="3" y="3" width="7" height="18" rx="1" />
            <rect x="14" y="3" width="7" height="18" rx="1" />
          </svg>
        </button>
        <button
          onClick={onToggleStar}
          aria-label={isStarred ? "Unstar player" : "Star player"}
          className="shrink-0 transition-colors"
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

export function PlayerStatusBadges({
  rosterStatus,
  gameToday,
  inactiveLabel = "IL",
}: {
  rosterStatus: "active" | "inactive";
  gameToday: boolean;
  inactiveLabel?: string;
}) {
  const injured = rosterStatus === "inactive";

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
        <StatusDot on={gameToday} onClass="bg-sith" />
        <span
          className={`font-mono text-[9px] uppercase tracking-wide ${
            gameToday ? "text-chrome" : "text-muted/50"
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
          {inactiveLabel}
        </span>
      </span>
    </div>
  );
}

export function PlayerPanelGridCell({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value?: string;
  sub?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="player-panel-grid-cell">
      <span className="player-panel-kicker">{label}</span>
      {value !== undefined ? (
        <>
          <span className="player-panel-grid-value">
            {icon ? (
              <span className="flex items-center gap-1">
                {icon}
                {value}
              </span>
            ) : (
              value
            )}
          </span>
          {sub ? <span className="player-panel-grid-sub">{sub}</span> : null}
        </>
      ) : null}
    </div>
  );
}

export function TodayGameFrame({
  logoUrl,
  venueName,
  isHome,
  children,
}: {
  logoUrl: string;
  venueName: string;
  isHome: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="border-t border-border bg-surface/40 px-2.5 py-2">
      <div className="flex items-start gap-2">
        <Image
          src={logoUrl}
          alt=""
          aria-hidden={true}
          width={24}
          height={24}
          className="mt-0.5 shrink-0 opacity-90"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wide text-chrome">
              {venueName}
            </span>
            <span className="shrink-0 font-mono text-[9px] uppercase tracking-wide text-muted">
              {isHome ? "Home" : "Away"}
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export type SourceLink = {
  label: string;
  href: string;
};

const sourceLinkClass =
  "font-mono text-[10px] uppercase tracking-wide text-chrome transition-colors hover:text-sith hover:underline";

export function SourceLinks({ links }: { links: SourceLink[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0 font-mono text-[10px] uppercase tracking-wide">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={sourceLinkClass}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

export function PlayerTileFooter({ links }: { links: SourceLink[] }) {
  return (
    <footer className="border-t border-border bg-surface/60 px-2 py-1.5">
      <SourceLinks links={links} />
    </footer>
  );
}
