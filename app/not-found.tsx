import AppChrome from "@/app/components/AppChrome";
import Link from "next/link";

export default function NotFound() {
  return (
    <AppChrome title="chalk/dog" subtitle="Player reports">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <h1 className="text-xl font-bold uppercase tracking-[0.08em] text-chrome sm:text-2xl">
          Report not found
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted">
          That board isn&apos;t in the gallery. Pick a live report from the home
          screen.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center rounded-sm border border-sith-dim/50 bg-surface-elevated px-4 text-sm font-bold uppercase tracking-wide text-sith transition-colors hover:bg-sith/10"
        >
          All reports
        </Link>
      </main>
    </AppChrome>
  );
}
