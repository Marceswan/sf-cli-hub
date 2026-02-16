"use client";

import { createContext, useContext } from "react";
import type { FeatureFlagKey, FeatureFlags } from "@/types";

const FeatureFlagsContext = createContext<FeatureFlags>({ pro: false });

export function FeatureFlagsProvider({
  flags,
  children,
}: {
  flags: FeatureFlags;
  children: React.ReactNode;
}) {
  return (
    <FeatureFlagsContext.Provider value={flags}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlag(key: FeatureFlagKey): boolean {
  const flags = useContext(FeatureFlagsContext);
  return flags[key] ?? false;
}
