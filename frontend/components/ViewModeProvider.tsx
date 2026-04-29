"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type ViewMode = "beginner" | "soc";

type ViewModeContextValue = {
  viewMode: ViewMode;
  isSocView: boolean;
  setViewMode: (mode: ViewMode) => void;
  setIsSocView: (enabled: boolean) => void;
};

const viewModeStorageKey = "adversim-view-mode";
const ViewModeContext = createContext<ViewModeContextValue | null>(null);

function readInitialViewMode(): ViewMode {
  if (typeof window === "undefined") {
    return "beginner";
  }

  const storedMode = window.localStorage.getItem(viewModeStorageKey);
  return storedMode === "soc" || storedMode === "beginner" ? storedMode : "beginner";
}

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewModeState] = useState<ViewMode>(readInitialViewMode);
  const isSocView = viewMode === "soc";

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(viewModeStorageKey, mode);
    }
  }, []);

  const setIsSocView = useCallback(
    (enabled: boolean) => {
      setViewMode(enabled ? "soc" : "beginner");
    },
    [setViewMode]
  );

  useEffect(() => {
    function syncStoredMode(event: StorageEvent) {
      if (event.key !== viewModeStorageKey) {
        return;
      }

      if (event.newValue === "soc" || event.newValue === "beginner") {
        setViewModeState(event.newValue);
      }
    }

    window.addEventListener("storage", syncStoredMode);
    return () => window.removeEventListener("storage", syncStoredMode);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("soc-view", isSocView);

    return () => {
      document.body.classList.remove("soc-view");
    };
  }, [isSocView]);

  const value = useMemo(
    () => ({
      viewMode,
      isSocView,
      setViewMode,
      setIsSocView
    }),
    [isSocView, setIsSocView, setViewMode, viewMode]
  );

  return <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>;
}

export function useViewMode() {
  const context = useContext(ViewModeContext);

  if (!context) {
    throw new Error("useViewMode must be used inside ViewModeProvider");
  }

  return context;
}
