import InstallPrompt from "./components/InstallPrompt";
import Leaderboard from "./components/Leaderboard";

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

      <Leaderboard />

      <footer className="mt-auto border-t border-border/60 px-4 py-4 sm:px-6">
        <p className="mx-auto max-w-6xl text-center text-xs text-muted">
          Stats are illustrative. Player links go to MLB.com, Savant, FanGraphs, and
          Baseball-Reference.
        </p>
      </footer>
    </div>
  );
}
