"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      if ("serviceWorker" in navigator) {
        void navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            void registration.unregister();
          }
        });
      }
      if ("caches" in window) {
        void caches.keys().then((keys) => {
          for (const key of keys) {
            void caches.delete(key);
          }
        });
      }
      return;
    }

    if (!("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      })
      .catch(() => {
        // Registration can fail in unsupported or insecure contexts.
      });
  }, []);

  return null;
}
