export default function LeaderboardSkeleton() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 sm:px-6 sm:py-6">
      <section className="mb-4 sm:mb-6">
        <div className="h-8 w-64 max-w-full animate-pulse rounded-sm bg-surface-elevated" />
        <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded-sm bg-surface-elevated" />
      </section>

      <div className="mb-4 h-12 animate-pulse rounded-sm bg-surface-elevated sm:mb-6" />

      <ul className="space-y-1 lg:hidden" aria-hidden>
        {Array.from({ length: 6 }).map((_, index) => (
          <li
            key={index}
            className="h-28 animate-pulse rounded-none border border-border bg-surface"
          />
        ))}
      </ul>

      <div
        className="hidden h-96 animate-pulse rounded-sm border border-border bg-surface lg:block"
        aria-hidden
      />
    </main>
  );
}
