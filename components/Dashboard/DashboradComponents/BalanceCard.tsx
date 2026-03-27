"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, Send, Download, Upload } from "lucide-react";

import BgImg from "../../../public/assets/cardbg.png";
import { TbEyeFilled } from "react-icons/tb";
import { PiEyeSlashFill } from "react-icons/pi";
import { HiArrowTrendingUp } from "react-icons/hi2";
import WithdrawModal from "../../Modal/WithdrawModal";
import { FaPlusSquare } from "react-icons/fa";
import FundsModal from "../../Modal/FundsModal";

interface BalanceCardProps {
  setActivePage?: (page: string) => void;
  balance?: number;
  loading?: boolean;
  onRefresh?: () => void;
}

import { useRouter } from "next/navigation";

export default function BalanceCard({ setActivePage, balance = 0, loading = false, onRefresh }: BalanceCardProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [open, setOpen] = useState(false);
  const [isOpenFundsModal, setIsOpenFundsModal] = useState(false);
  const router = useRouter(); // If needed for navigation, but setActivePage is passed prop

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-[#202736] p-6 text-white">
      {/* Background Image */}
      <Image
        src={BgImg}
        alt="Dots background"
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-[#121A2A]/40" />

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
          {loading ? "..." : (showBalance ? `$${balance.toLocaleString()}` : "*****")}
        </h1>

        {/* Growth */}
        <p className="mb-3 flex gap-1 text-xs mt-2 font-DMSans text-[#82F764]">
          <HiArrowTrendingUp className="mt-0.5 text-[#82F764]" />
          +2.4% this week
        </p>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActivePage?.("payments")} // Maps to 'payments' in DashboardLayout
            className="flex items-center cursor-pointer gap-2 font-DMSans rounded-full pr-4 bg-[#82F764] px-2 py-2 text-sm font-semibold text-black"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#202736]">
              <Send size={13} className="text-white" />
            </span>
            Send money
          </button>

          <button
            onClick={() => setActivePage?.("wallet")} // Assuming convert/receive is in wallet or specific page
            className="flex items-center gap-2 cursor-pointer rounded-full pr-4 font-DMSans bg-[#82F764] px-2 py-2 text-sm font-semibold text-black"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#202736]">
              <Download size={13} className="text-white" />
            </span>
            Receive money
          </button>

          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 cursor-pointer pr-4 rounded-full font-DMSans bg-[#82F764] px-2 py-2 text-sm font-semibold text-black"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#202736]">
              <Upload size={13} className="text-white" />
            </span>
            Withdraw money
          </button>

          <button
            onClick={() => setIsOpenFundsModal(true)}
            className="flex items-center gap-2 cursor-pointer pr-4 rounded-full font-DMSans bg-[#82F764] px-2 py-2 text-sm font-semibold text-black"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#202736]">
              <FaPlusSquare size={13} className="text-white" />
            </span>
            Add funds
          </button>
        </div>
        <WithdrawModal open={open} onClose={() => setOpen(false)} onRefresh={onRefresh} />
        <FundsModal
          isOpenFundsModal={isOpenFundsModal}
          onClose={() => setIsOpenFundsModal(false)}
          onRefresh={onRefresh}
        />
      </div>
    </div>
  );
}
