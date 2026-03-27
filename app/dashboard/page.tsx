"use client";

import { useState, Suspense } from "react";

import Sidebar from "@/components/Dashboard/Sidebar";
import Topbar from "@/components/Dashboard/Topbar";

import DashboardPage from "@/components/Dashboard/DashboardPage";
import PaymentsPage from "@/components/Dashboard/PaymentsPage";
import WalletPage from "@/components/Dashboard/WalletPage";
import ActivityPage from "@/components/Dashboard/ActivityPage";
import AccountPage from "@/components/Dashboard/AccountPage";
import CardPage from "@/components/Dashboard/CardPage";

export default function DashboardLayout() {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <Suspense fallback={<div>Loading dashboard...</div>}>
            <DashboardPage setActivePage={setActivePage} />
          </Suspense>
        );
      case "payments":
        return <PaymentsPage />;
      case "wallet":
        return <WalletPage setActivePage={setActivePage} />;
      case "activity":
        return <ActivityPage />;
      case "card":
        return <CardPage />;
      case "account":
        return <AccountPage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] w-full overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isMobileOpen={mobileSidebarOpen}
        setIsMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content */}
      <div
        className={`w-full min-h-screen transition-all duration-300 ${sidebarOpen ? "md:pl-64" : "md:pl-20"
          }`}
      >
        <Topbar onMenuClick={() => setMobileSidebarOpen(true)} />

        <div className="w-full px-4 md:px-6 py-4 md:py-6">
          <div className="w-full max-w-full overflow-x-hidden">
            {renderPage()}
          </div>
        </div>
      </div>
    </div>
  );
}
