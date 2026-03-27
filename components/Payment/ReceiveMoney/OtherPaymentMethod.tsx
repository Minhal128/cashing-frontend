"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import api from "@/lib/api";

import VisaIcon from "@/public/assets/visa.png";
import CashAppIcon from "@/public/assets/cash.png";
import ApplePayIcon from "@/public/assets/pay.png";
import VenmoIcon from "@/public/assets/venmo.png";

interface PaymentMethod {
  id: number;
  title: string;
  subtitle?: string;
  icon: any;
  status: "enabled" | "not_connected";
}

export default function OtherPaymentMethod() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/status");
        setUser(res.data);
      } catch (error) {
        console.error("Failed to fetch user status:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 1,
      title: "Bank / Card payments",
      subtitle: user?.bankAccountMask || (user?.linkedBanks?.length > 0 ? `${user.linkedBanks[0].institutionName} (**** ${user.linkedBanks[0].last4})` : "Not connected"),
      icon: VisaIcon,
      status: (user?.bankAccountMask || user?.linkedBanks?.length > 0) ? "enabled" : "not_connected",
    },
    {
      id: 2,
      title: "Cash app",
      subtitle: user?.cashappTag || "Not connected",
      icon: CashAppIcon,
      status: user?.cashappTag ? "enabled" : "not_connected",
    },
    {
      id: 3,
      title: "Apple pay",
      subtitle: user?.applePayHandle || "Not connected",
      icon: ApplePayIcon,
      status: user?.applePayHandle ? "enabled" : "not_connected",
    },
    {
      id: 4,
      title: "Venmo",
      subtitle: user?.venmoTag || "Not connected",
      icon: VenmoIcon,
      status: user?.venmoTag ? "enabled" : "not_connected",
    },
  ];

  if (loading) return <div className="text-white text-center p-10">Loading...</div>;

  return (
    <div className="w-full flex justify-center">
      <div className="w-full rounded-2xl bg-[#111827] border border-[#2B3343] p-4 shadow-xl">
        {/* Header */}
        <h2 className="text-white text-xl md:text-2xl font-DMSans mb-6">
          Other payment methods
        </h2>

        {/* Payment List */}
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between rounded-xl bg-[#202736] px-4 py-4 md:px-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-lg">
                  <Image
                    src={method.icon}
                    alt={method.title}
                    width={50}
                    height={40}
                    className="object-contain"
                  />
                </div>

                <div>
                  <p className="text-white font-DMSans text-sm md:text-base">
                    {method.title}
                  </p>
                  <p className="text-[#7A869C] text-xs font-DMSans md:text-sm">
                    {method.subtitle}
                  </p>
                </div>
              </div>

              {/* Status */}
              {method.status === "enabled" ? (
                <span className="rounded-full bg-[#2B3343] px-4 py-1 text-xs md:text-sm font-DMSans text-[#82F764]">
                  Enabled
                </span>
              ) : (
                <span className="rounded-full bg-[#2B3343] px-4 py-1 text-xs md:text-sm font-DMSans text-[#FF383C]">
                  Not connected
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
