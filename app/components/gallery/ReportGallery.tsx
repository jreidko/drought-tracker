import {
  REPORTS,
  SPORT_LABEL,
  SPORT_ORDER,
  reportsForSport,
  type ReportDef,
} from "@/lib/reports/catalog";
import Link from "next/link";

function ReportCard({ report }: { report: ReportDef }) {
  const sportLabel = SPORT_LABEL[report.sport];
  const inner = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wide text-sith">
          {sportLabel}
        </span>
        {report.status === "live" ? (
          <span className="font-mono text-[10px] uppercase tracking-wide text-muted">
            Open →
          </span>
        ) : (
          <span className="rounded-sm border border-border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-muted">
            Coming soon
          </span>
        )}
      </div>
      <h3 className="mt-3 text-base font-bold uppercase tracking-[0.06em] text-chrome">
        {report.title}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-muted">{report.description}</p>
    </>
  );

  if (report.status === "live") {
    return (
      <article className="player-panel overflow-hidden rounded-sm border border-border bg-surface transition-colors hover:border-sith/50 hover:bg-sith/5">
        <Link href={report.href} className="block px-4 py-4">
          {inner}
        </Link>
      </article>
    );
  }

  return (
    <article className="player-panel overflow-hidden rounded-sm border border-border bg-surface/60 opacity-70">
      <div className="px-4 py-4">{inner}</div>
    </article>
  );
}

export default function ReportGallery() {
  const liveCount = REPORTS.filter((report) => report.status === "live").length;
  const comingSoonCount = REPORTS.length - liveCount;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 sm:px-6 sm:py-6">
      <section className="mb-8">
        <h1 className="text-xl font-bold uppercase tracking-[0.08em] text-chrome sm:text-2xl lg:text-3xl">
          Reports
        </h1>
        <p className="mt-1 text-sm text-muted sm:text-base">
          Same board — search, game today, stars, compare — different player stats.
        </p>
        <p className="mt-1 text-xs text-muted">
          {comingSoonCount > 0
            ? `${liveCount} live · ${comingSoonCount} coming soon`
            : `${liveCount} reports`}
        </p>
      </section>

      <div className="space-y-8">
        {SPORT_ORDER.map((sport) => {
          const reports = reportsForSport(sport);
          if (reports.length === 0) {
            return null;
          }

          return (
            <section key={sport} aria-labelledby={`sport-${sport}`}>
              <h2
                id={`sport-${sport}`}
                className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-chrome"
              >
                {SPORT_LABEL[sport]}
              </h2>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {reports.map((report) => (
                  <li key={report.slug}>
                    <ReportCard report={report} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
