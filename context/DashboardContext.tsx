"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type PageType =
  | "dashboard"
  | "payments"
  | "wallet"
  | "activity"
  | "card"
  | "account";

interface DashboardContextType {
  activePage: PageType;
  setActivePage: (page: PageType) => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [activePage, setActivePage] = useState<PageType>("dashboard");

  return (
    <DashboardContext.Provider value={{ activePage, setActivePage }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used inside DashboardProvider");
  }
  return context;
}
