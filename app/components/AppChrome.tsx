import type { ReactNode } from "react";
import Link from "next/link";
import InstallPrompt from "./InstallPrompt";
import ReportSwitcher from "./report/ReportSwitcher";

export default function AppChrome({
  title,
  subtitle,
  badge,
  homeLink = false,
  currentHref,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  homeLink?: boolean;
  currentHref?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="vader-bg flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold uppercase tracking-[0.2em] text-chrome sm:text-base">
              {homeLink ? (
                <>
                  <Link
                    href="/"
                    className="transition-colors hover:text-sith"
                  >
                    chalk/dog
                  </Link>
                  <span className="text-muted"> / </span>
                  <span>{title}</span>
                </>
              ) : (
                title
              )}
            </p>
            <p className="truncate text-xs text-muted sm:text-sm">{subtitle}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {currentHref ? <ReportSwitcher currentHref={currentHref} /> : null}
            {badge ? (
              <span className="shrink-0 rounded-sm border border-sith-dim/60 bg-surface px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-sith sm:text-xs">
                {badge}
              </span>
            ) : null}
          </div>
        </div>
        <div className="imperial-rule" aria-hidden />
      </header>

      <InstallPrompt />

      {children}

      {footer ? (
        <footer className="mt-auto border-t border-border/60 px-4 py-4 sm:px-6">
          {footer}
        </footer>
      ) : (
        <div className="mt-auto" />
      )}
    </div>
  );
}
