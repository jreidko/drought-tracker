import type { Metadata } from "next";
import AppChrome from "@/app/components/AppChrome";
import LeaderboardLoader from "@/app/components/LeaderboardLoader";
import LeaderboardSkeleton from "@/app/components/LeaderboardSkeleton";
import { DROUGHT_TRACKER, SPORT_LABEL } from "@/lib/reports/catalog";
import { Suspense } from "react";

export const revalidate = 900;
export const maxDuration = 300;

export const metadata: Metadata = {
  title: DROUGHT_TRACKER.title,
  description: DROUGHT_TRACKER.description,
};

const footerLinkClass =
  "text-chrome underline-offset-2 transition-colors hover:text-sith hover:underline";

function DroughtTrackerFooter() {
  return (
    <p className="mx-auto max-w-6xl text-center text-xs leading-relaxed text-muted">
      Stats refresh every 15 minutes from the{" "}
      <a
        href="https://statsapi.mlb.com/"
        target="_blank"
        rel="noopener noreferrer"
        className={footerLinkClass}
      >
        MLB Stats API
      </a>
      . Projected HRs use in-season pace; for official numbers see{" "}
      <a
        href="https://www.mlb.com/stats"
        target="_blank"
        rel="noopener noreferrer"
        className={footerLinkClass}
      >
        MLB.com
      </a>
      ,{" "}
      <a
        href="https://baseballsavant.mlb.com/"
        target="_blank"
        rel="noopener noreferrer"
        className={footerLinkClass}
      >
        Baseball Savant
      </a>
      ,{" "}
      <a
        href="https://www.fangraphs.com/"
        target="_blank"
        rel="noopener noreferrer"
        className={footerLinkClass}
      >
        FanGraphs
      </a>
      , and{" "}
      <a
        href="https://www.baseball-reference.com/"
        target="_blank"
        rel="noopener noreferrer"
        className={footerLinkClass}
      >
        Baseball-Reference
      </a>
      .
    </p>
  );
}

export default function DroughtTrackerPage() {
  return (
    <AppChrome
      title={DROUGHT_TRACKER.title}
      subtitle={`2026 ${DROUGHT_TRACKER.subtitle}`}
      badge={SPORT_LABEL[DROUGHT_TRACKER.sport]}
      homeLink
      footer={<DroughtTrackerFooter />}
    >
      <Suspense fallback={<LeaderboardSkeleton />}>
        <LeaderboardLoader />
      </Suspense>
    </AppChrome>
  );
}
