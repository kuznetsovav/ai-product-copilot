"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { DecisionActionResult } from "@/app/actions/decision-actions";

interface DecisionContextValue {
  result: DecisionActionResult | null;
  setResult: (r: DecisionActionResult | null) => void;
}

const DecisionContext = createContext<DecisionContextValue | null>(null);

export function DecisionProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<DecisionActionResult | null>(null);
  return (
    <DecisionContext.Provider value={{ result, setResult }}>
      {children}
    </DecisionContext.Provider>
  );
}

export function useDecisionResult() {
  const ctx = useContext(DecisionContext);
  if (!ctx) {
    throw new Error("useDecisionResult must be used within DecisionProvider");
  }
  return ctx;
}
