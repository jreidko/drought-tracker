import InstallPrompt from "./components/InstallPrompt";
import LeaderboardLoader from "./components/LeaderboardLoader";
import LeaderboardSkeleton from "./components/LeaderboardSkeleton";
import { Suspense } from "react";

export const revalidate = 900;

export default function Home() {
  return (
    <div className="vader-bg flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold uppercase tracking-[0.2em] text-chrome sm:text-base">
              Drought Tracker
            </p>
            <p className="truncate text-xs text-muted sm:text-sm">
              2026 HR Leaderboard
            </p>
          </div>
          <span className="shrink-0 rounded-sm border border-sith-dim/60 bg-surface px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-sith sm:text-xs">
            MLB
          </span>
        </div>
        <div className="imperial-rule" aria-hidden />
      </header>

      <InstallPrompt />

      <Suspense fallback={<LeaderboardSkeleton />}>
        <LeaderboardLoader />
      </Suspense>

      <footer className="mt-auto border-t border-border/60 px-4 py-4 sm:px-6">
        <p className="mx-auto max-w-6xl text-center text-xs leading-relaxed text-muted">
          Stats refresh every 15 minutes from the{" "}
          <a
            href="https://statsapi.mlb.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-chrome underline-offset-2 transition-colors hover:text-sith hover:underline"
          >
            MLB Stats API
          </a>
          . Projected HRs use in-season pace; for official numbers see{" "}
          <a
            href="https://www.mlb.com/stats"
            target="_blank"
            rel="noopener noreferrer"
            className="text-chrome underline-offset-2 transition-colors hover:text-sith hover:underline"
          >
            MLB.com
          </a>
          ,{" "}
          <a
            href="https://baseballsavant.mlb.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-chrome underline-offset-2 transition-colors hover:text-sith hover:underline"
          >
            Baseball Savant
          </a>
          ,{" "}
          <a
            href="https://www.fangraphs.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-chrome underline-offset-2 transition-colors hover:text-sith hover:underline"
          >
            FanGraphs
          </a>
          , and{" "}
          <a
            href="https://www.baseball-reference.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-chrome underline-offset-2 transition-colors hover:text-sith hover:underline"
          >
            Baseball-Reference
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
