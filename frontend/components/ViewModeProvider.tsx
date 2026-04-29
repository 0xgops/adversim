"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type ViewModeContextValue = {
  isSocView: boolean;
  setIsSocView: (enabled: boolean) => void;
};

const ViewModeContext = createContext<ViewModeContextValue | null>(null);

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [isSocView, setIsSocView] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("soc-view", isSocView);

    return () => {
      document.body.classList.remove("soc-view");
    };
  }, [isSocView]);

  const value = useMemo(() => ({ isSocView, setIsSocView }), [isSocView]);

  return <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>;
}

export function useViewMode() {
  const context = useContext(ViewModeContext);

  if (!context) {
    throw new Error("useViewMode must be used inside ViewModeProvider");
  }

  return context;
}
