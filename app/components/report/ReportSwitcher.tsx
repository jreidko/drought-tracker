"use client";

import {
  REPORTS,
  SPORT_LABEL,
  SPORT_ORDER,
  type ReportDef,
} from "@/lib/reports/catalog";
import { useRouter } from "next/navigation";

function liveReports(): ReportDef[] {
  return REPORTS.filter((report) => report.status === "live");
}

export default function ReportSwitcher({ currentHref }: { currentHref: string }) {
  const router = useRouter();
  const reports = liveReports();

  return (
    <label className="flex min-w-0 items-center gap-2">
      <span className="sr-only">Switch report</span>
      <select
        value={currentHref}
        onChange={(event) => router.push(event.target.value)}
        className="max-w-[11rem] truncate rounded-sm border border-border bg-surface-elevated px-2 py-1.5 font-mono text-[11px] uppercase tracking-wide text-chrome transition-colors focus:border-sith/60 focus:outline-none sm:max-w-[16rem]"
      >
        {SPORT_ORDER.map((sport) => {
          const group = reports.filter((report) => report.sport === sport);
          if (group.length === 0) {
            return null;
          }
          return (
            <optgroup key={sport} label={SPORT_LABEL[sport]}>
              {group.map((report) => (
                <option key={report.slug} value={report.href}>
                  {report.title}
                </option>
              ))}
            </optgroup>
          );
        })}
      </select>
    </label>
  );
}
