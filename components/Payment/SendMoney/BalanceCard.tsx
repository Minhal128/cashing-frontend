"use client";

import { useState } from "react";
import { TbEyeFilled } from "react-icons/tb";
import { PiEyeSlashFill } from "react-icons/pi";

interface BalanceCardProps {
  balance?: number;
  loading?: boolean;
}

export default function BalanceCard({ balance = 0, loading = false }: BalanceCardProps) {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-[#111827] border border-[#2B3343] p-6 text-white">
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-2 flex items-center gap-2 text-sm text-gray-300">
          <span className="font-DMSans text-[#8293B7]">Total Balance</span>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="hover:text-white"
          >
            {showBalance ? (
              <TbEyeFilled size={16} />
            ) : (
              <PiEyeSlashFill size={16} />
            )}
          </button>
        </div>

        {/* Balance */}
        <h1 className="mb-1 font-DMSans text-3xl font-bold">
          {loading ? "..." : (showBalance ? `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : "*****")}
        </h1>
      </div>
    </div>
  );
}
