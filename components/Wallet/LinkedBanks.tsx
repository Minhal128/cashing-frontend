"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import Image from "next/image";

import VisaLogo from "../../public/assets/visa.png";
import AmexLogo from "../../public/assets/amex.png";
import WalletLogo from "../../public/assets/wals.png";

// Simple mapping for logos
const logoMap: Record<string, any> = {
  'visa': VisaLogo,
  'amex': AmexLogo,
  'american express': AmexLogo,
  'wallet': WalletLogo,
  'bank': WalletLogo,
  'chase': WalletLogo, // generic for now
};

export default function LinkedBanks() {
  const [banks, setBanks] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await api.get("/wallet/payment-methods");
        // Filter for cards or banks
        const bankMethods = res.data.filter((m: any) => m.type === 'card' || m.type === 'bank');
        setBanks(bankMethods);
      } catch (error) {
        console.error(error);
      }
    };
    fetchBanks();
  }, [refreshKey]);

  return (
    <div className="w-full rounded-2xl bg-[#111827] border border-[#2B3343] px-3 py-4 text-white shadow-xl">
      {/* Header */}
      <div className="mb-3">
        <h2 className="font-DMSans text-lg">Linked bank accounts</h2>
      </div>

      {/* Bank Rows */}
      <div className="space-y-3">
        {banks.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-2">No linked banks/cards</p>
        ) : (
          banks.map((bank: any) => (
            <div
              key={bank._id}
              className="flex items-center justify-between rounded-xl bg-[#202736] border border-[#394150] px-2 py-2"
            >
              {/* Left */}
              <div className="flex items-center gap-2">
                <Image
                  src={logoMap[bank.provider?.toLowerCase()] || logoMap['bank']}
                  alt={bank.provider || 'Bank'}
                  width={40}
                  height={30}
                  className="object-contain"
                />

                <div className="flex flex-col">
                  <p className="font-DMSans font-medium capitalize">{bank.provider || 'Bank Account'}</p>
                  <span className="text-xs font-DMSans text-gray-400">
                    {bank.type === 'card' ? `Ending in ${bank.details?.slice(-4) || '****'}` : (bank.details || 'Checking')}
                  </span>
                </div>
              </div>

              {/* Right */}
              <span className="rounded-full bg-[#2B3343] px-3 py-1 text-xs font-DMSans text-[#82F764]">
                Connected
              </span>
            </div>
          ))
        )}
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Bank linking is currently disabled in this flow.
      </p>
    </div>
  );
}
