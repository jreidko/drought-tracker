import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AppChrome from "@/app/components/AppChrome";
import LeaderboardSkeleton from "@/app/components/LeaderboardSkeleton";
import NflReportLoader from "@/app/components/nfl/NflReportLoader";
import { NFL_REPORT_SPECS } from "@/lib/nfl-reports";
import { REPORTS, SPORT_LABEL, type ReportDef } from "@/lib/reports/catalog";
import { Suspense } from "react";

export const revalidate = 900;
export const maxDuration = 60;
export const dynamicParams = false;

const footerLinkClass =
  "text-chrome underline-offset-2 transition-colors hover:text-sith hover:underline";

function reportFromSlug(slug: string): ReportDef | undefined {
  return REPORTS.find((item) => item.slug === slug);
}

export function generateStaticParams() {
  return Object.keys(NFL_REPORT_SPECS).map((report) => ({ report }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ report: string }>;
}): Promise<Metadata> {
  const { report: slug } = await params;
  const report = reportFromSlug(slug);
  if (!report || report.status !== "live" || !NFL_REPORT_SPECS[slug]) {
    return { title: "Report" };
  }
  return {
    title: report.title,
    description: report.description,
  };
}

function NflFooter({ espnStatsUrl }: { espnStatsUrl: string }) {
  return (
    <p className="mx-auto max-w-6xl text-center text-xs leading-relaxed text-muted">
      Stats refresh every 15 minutes from{" "}
      <a
        href={espnStatsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={footerLinkClass}
      >
        ESPN
      </a>
      . Projected totals use in-season pace at 17 games; for official numbers see{" "}
      <a
        href="https://www.espn.com/nfl/stats"
        target="_blank"
        rel="noopener noreferrer"
        className={footerLinkClass}
      >
        ESPN
      </a>{" "}
      and{" "}
      <a
        href="https://www.pro-football-reference.com/"
        target="_blank"
        rel="noopener noreferrer"
        className={footerLinkClass}
      >
        Pro-Football-Reference
      </a>
      .
    </p>
  );
}

export default async function NflReportPage({
  params,
}: {
  params: Promise<{ report: string }>;
}) {
  const { report: slug } = await params;
  const spec = NFL_REPORT_SPECS[slug];
  const report = reportFromSlug(slug);

  if (!spec || !report || report.status !== "live") {
    notFound();
  }

  return (
    <AppChrome
      title={report.title}
      subtitle={report.subtitle}
      badge={SPORT_LABEL[report.sport]}
      homeLink
      currentHref={report.href}
      footer={<NflFooter espnStatsUrl={spec.espnStatsUrl} />}
    >
      <Suspense fallback={<LeaderboardSkeleton />}>
        <NflReportLoader spec={spec} report={report} />
      </Suspense>
    </AppChrome>
  );
}
