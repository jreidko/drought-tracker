import Link from "next/link";

export default function LeaderboardError() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 sm:px-6 sm:py-6">
      <section className="rounded-sm border border-sith/40 bg-sith/5 px-4 py-8 text-center sm:px-6">
        <h2 className="text-lg font-bold uppercase tracking-[0.08em] text-chrome">
          Could not load leaderboard
        </h2>
        <p className="mt-2 text-sm text-muted sm:text-base">
          The MLB Stats API did not respond. Try again in a few minutes.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex min-h-11 items-center rounded-sm border border-sith-dim/50 bg-surface-elevated px-4 text-sm font-bold uppercase tracking-wide text-sith transition-colors hover:bg-sith/10"
        >
          Retry
        </Link>
      </section>
    </main>
  );
}
