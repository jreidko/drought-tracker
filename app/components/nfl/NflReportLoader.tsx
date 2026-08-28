import NflReportBoard from "@/app/components/nfl/NflReportBoard";
import LeaderboardError from "@/app/components/LeaderboardError";
import type { ReportDef } from "@/lib/reports/catalog";
import type { NflReportSpec } from "@/lib/nfl-reports";
import { getNflReportPlayers } from "@/lib/nfl-stats";

export default async function NflReportLoader({
  spec,
  report,
}: {
  spec: NflReportSpec;
  report: ReportDef;
}) {
  let data;

  try {
    data = await getNflReportPlayers(spec);
  } catch {
    return (
      <LeaderboardError
        message="ESPN did not respond with NFL stats. Try again in a few minutes."
        retryHref={report.href}
      />
    );
  }

  return <NflReportBoard spec={spec} report={report} {...data} />;
}
