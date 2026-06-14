import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="vader-bg flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-chrome">
        Drought Tracker
      </p>
      <h1 className="sith-text-glow mt-3 text-xl font-bold uppercase tracking-wide text-sith">
        You Are Offline
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Reconnect to refresh the latest leaderboard data.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-sm border border-sith/50 bg-sith/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-sith"
      >
        Try Again
      </Link>
    </div>
  );
}
