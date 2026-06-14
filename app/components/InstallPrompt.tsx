"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function subscribeNoop() {
  return () => {};
}

function getIsStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

function getIsIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const isStandalone = useSyncExternalStore(
    subscribeNoop,
    getIsStandalone,
    () => false,
  );
  const isIOS = useSyncExternalStore(subscribeNoop, getIsIOS, () => false);

  useEffect(() => {
    function handleBeforeInstall(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  if (isStandalone || dismissed) {
    return null;
  }

  if (!deferredPrompt && !isIOS) {
    return null;
  }

  return (
    <div className="border-b border-border/60 bg-surface/90 px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-chrome">
          {isIOS
            ? "Install: tap Share, then Add to Home Screen."
            : "Install Drought Tracker for quick access from your home screen."}
        </p>
        <div className="flex shrink-0 gap-2">
          {deferredPrompt ? (
            <button
              type="button"
              onClick={handleInstall}
              className="rounded-sm border border-sith/50 bg-sith/10 px-3 py-2 text-xs font-bold uppercase tracking-wider text-sith transition-colors hover:bg-sith/20"
            >
              Install App
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-sm border border-border px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted transition-colors hover:text-chrome"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
