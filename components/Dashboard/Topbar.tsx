"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, Search } from "lucide-react";
import api from "@/lib/api";
import Image from "next/image";
import WalletImg from "../../public/assets/wallet.png";
import { HiBell } from "react-icons/hi";
import { IoMdArrowDropdown } from "react-icons/io";
import NotificationModal from "../Modal/NotificationModal";
import WalletModal from "../Modal/WalletModal";

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [openWallet, setOpenWallet] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);

  const fetchData = async () => {
    try {
      const profileRes = await api.get("/wallet/profile");
      setUser(profileRes.data);

      const walletsRes = await api.get("/wallet/wallets");
      const total = walletsRes.data.reduce((acc: number, w: any) => acc + (w.type === 'fiat' ? w.balance : 0), 0);
      setBalance(total);
    } catch (error) {
      console.error("Topbar data fetch failed:", error);
    }
  };

  useEffect(() => {
    fetchData();

    const handleRefresh = () => {
      console.log("[TOPBAR] Refreshing balances...");
      fetchData();
    };

    window.addEventListener('refresh-balances', handleRefresh);
    return () => window.removeEventListener('refresh-balances', handleRefresh);
  }, []);

  const getInitials = () => {
    if (!user) return "A";
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U";
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <header className="w-full flex h-16 items-center justify-between border-b border-white/10 bg-[#020617] px-4 md:px-6">
      {/* Left Side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 hover:bg-white/10 md:hidden"
        >
          <Menu className="h-5 w-5 text-white" />
        </button>

        <div className="hidden md:flex items-center gap-2 rounded-full border border-[#303745] bg-[#202736] px-4 py-2.5 w-100">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            placeholder="Search"
            className="bg-transparent text-sm outline-none placeholder:text-gray-400 w-full text-white"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Wallet */}
        <div
          onClick={() => setOpenWallet(true)}
          className="flex items-center gap-2 h-9 px-3 rounded-md border border-[#2B3343] bg-[#202736] cursor-pointer"
        >
          <Image
            src={WalletImg}
            alt="Wallet"
            width={18}
            height={18}
            className="object-contain"
          />

          <span className="text-sm font-medium text-white">${balance.toLocaleString()}</span>

          <IoMdArrowDropdown className="h-4 w-4 text-[#969EA6]" />
        </div>

        {openWallet && <WalletModal onClose={() => setOpenWallet(false)} />}

        {/* Notification */}
        <div
          onClick={() => setOpen(!open)}
          className="relative flex items-center justify-center h-10 w-10 border border-[#2B3343] rounded-full bg-[#202736] hover:bg-white/20 cursor-pointer"
        >
          <HiBell className="h-4.5 w-4.5 text-white" />

          <span className="absolute top-2.5 right-3 h-1 w-1 rounded-full bg-green-500" />
        </div>

        {open && <NotificationModal />}

        {/* Profile Avatar + Info */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#FF8D28] font-DMSans justify-center h-10 w-10 rounded-full border border-[#FFFFFF] text-white font-semibold shrink-0">
            {getInitials()}
          </div>
          <div className="hidden md:block">
            <p className="text-sm text-white font-DMSans font-medium leading-tight">
              {user ? `${user.firstName} ${user.lastName}` : '...'}
            </p>
            <p className="text-xs text-gray-400 font-DMSans leading-tight">
              {user?.email || ''}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
