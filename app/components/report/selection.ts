"use client";

import { useCallback, useState } from "react";

function readIdSet(storageKey: string): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
  } catch {
    return new Set();
  }
}

export function useStarredPlayers(storageKey: string, migrateFrom?: string) {
  const [starredIds, setStarredIds] = useState<Set<number>>(() => {
    const current = readIdSet(storageKey);
    if (current.size > 0 || !migrateFrom) {
      return current;
    }

    const legacy = readIdSet(migrateFrom);
    if (legacy.size === 0) {
      return current;
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify([...legacy]));
    } catch {
      // Ignore quota / private-mode failures; in-memory set still works.
    }
    return legacy;
  });

  const toggleStar = useCallback(
    (id: number) => {
      setStarredIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        try {
          localStorage.setItem(storageKey, JSON.stringify([...next]));
        } catch {
          // Ignore quota / private-mode failures.
        }
        return next;
      });
    },
    [storageKey],
  );

  return { starredIds, toggleStar };
}

export function useComparedPlayers() {
  const [comparedIds, setComparedIds] = useState<Set<number>>(new Set());

  const toggleCompare = useCallback((id: number) => {
    setComparedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearComparison = useCallback(() => setComparedIds(new Set()), []);

  return { comparedIds, toggleCompare, clearComparison };
}
