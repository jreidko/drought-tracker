import type { Metadata } from "next";
import AppChrome from "@/app/components/AppChrome";
import LeaderboardSkeleton from "@/app/components/LeaderboardSkeleton";
import PassingTdLoader from "@/app/components/nfl/PassingTdLoader";
import { PASSING_TDS, SPORT_LABEL } from "@/lib/reports/catalog";
import { Suspense } from "react";

export const revalidate = 900;
export const maxDuration = 60;

export const metadata: Metadata = {
  title: PASSING_TDS.title,
  description: PASSING_TDS.description,
};

const footerLinkClass =
  "text-chrome underline-offset-2 transition-colors hover:text-sith hover:underline";

function PassingTdFooter() {
  return (
    <p className="mx-auto max-w-6xl text-center text-xs leading-relaxed text-muted">
      Stats refresh every 15 minutes from{" "}
      <a
        href="https://www.espn.com/nfl/stats/player/_/stat/passing"
        target="_blank"
        rel="noopener noreferrer"
        className={footerLinkClass}
      >
        ESPN
      </a>
      . Projected TDs use in-season pace at 17 games; for official numbers see{" "}
      <a
        href="https://www.espn.com/nfl/stats"
        target="_blank"
        rel="noopener noreferrer"
        className={footerLinkClass}
      >
        ESPN
      </a>
      {" "}and{" "}
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

export default function PassingTdsPage() {
  return (
    <AppChrome
      title={PASSING_TDS.title}
      subtitle={PASSING_TDS.subtitle}
      badge={SPORT_LABEL[PASSING_TDS.sport]}
      homeLink
      footer={<PassingTdFooter />}
    >
      <Suspense fallback={<LeaderboardSkeleton />}>
        <PassingTdLoader />
      </Suspense>
    </AppChrome>
  );
}
