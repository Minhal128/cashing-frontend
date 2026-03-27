"use client";

import { useState, useEffect } from "react";
import Security from "../Account/Security";
import PaymentMethods from "../Account/PaymentMethods";
import Verification from "../Account/Verification";
import Preference from "../Account/Preference";
import ProfileInfo from "../Account/ProfileInfo";
import api from "@/lib/api";
import AccountHeader from "../Account/AccountHeader";
import AccountSidebar from "../Account/AccountSidebar";
import Support from "../Account/Support";

export const TABS = {
  PROFILE: "profile",
  SECURITY: "security",
  PAYMENT: "payment",
  VERIFICATION: "verification",
  PREFERENCE: "preference",
  SUPPORT: "support",
};

export default function AccountPage() {
  const [active, setActive] = useState<string>(TABS.PROFILE);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/auth/status"); // Or implement a /user/profile
        // In my backend I have verifyIdentity but I can add a simple /me
        const meRes = await api.get("/wallet/profile");
        setUser(meRes.data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const renderComponent = () => {
    switch (active) {
      case TABS.SECURITY:
        return <Security />;
      case TABS.PAYMENT:
        return <PaymentMethods />;
      case TABS.VERIFICATION:
        return <Verification />;
      case TABS.PREFERENCE:
        return <Preference />;
      case TABS.SUPPORT:
        return <Support />;
      default:
        return <ProfileInfo />;
    }
  };

  return (
    <div className="text-white">
      <div className="mb-4">
        <h1 className="text-2xl">Account Settings</h1>
        <p className="text-sm text-[#7A869C]">
          Transfer funds to other Cha $Ching users
        </p>
      </div>

      <AccountHeader />

      {/* MAIN LAYOUT */}
      <div className="mt-4 flex flex-col lg:flex-row gap-3">
        {/* Sidebar */}
        <div className="lg:w-90 shrink-0">
          <AccountSidebar active={active} setActive={setActive} />
        </div>

        {/* Content */}
        <div className="flex-1 min-h-130 bg-[#121826] rounded-xl p-4">
          {renderComponent()}
        </div>
      </div>
    </div>
  );
}
