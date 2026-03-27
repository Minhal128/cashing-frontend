"use client";

import { useState } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  CreditCard,
  Wallet,
  Activity,
  User,
  X,
  ChevronRight,
} from "lucide-react";
import { BiLogOut } from "react-icons/bi";

import dashboardActive from "../../public/assets/sidebar/homeactive.png";
import dashboardInactive from "../../public/assets/sidebar/homeinactive.png";

import paymentsActive from "../../public/assets/sidebar/payment.png";
import paymentsInactive from "../../public/assets/sidebar/payment.png";

import walletActive from "../../public/assets/sidebar/walletactive.png";
import walletInactive from "../../public/assets/sidebar/walletinactive.png";

import activityActive from "../../public/assets/sidebar/activeactive.png";
import activityInactive from "../../public/assets/sidebar/activeinactive.png";

import cardActive from "../../public/assets/sidebar/cardactive.png";
import cardInactive from "../../public/assets/sidebar/cardinactive.png";

import accountActive from "../../public/assets/sidebar/acountactive.png";
import accountInactive from "../../public/assets/sidebar/acountinactive.png";

import LogoImg from "../../public/assets/logo.png";

import LogoutModal from "../Modal/LogoutModal";

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
}

const items = [
  {
    id: "dashboard",
    label: "Dashboard",
    activeImage: dashboardActive,
    inactiveImage: dashboardInactive,
    fallbackIcon: LayoutDashboard,
  },
  {
    id: "payments",
    label: "Payments",
    activeImage: paymentsActive,
    inactiveImage: paymentsInactive,
    fallbackIcon: CreditCard,
  },
  {
    id: "wallet",
    label: "Wallet",
    activeImage: walletActive,
    inactiveImage: walletInactive,
    fallbackIcon: Wallet,
  },
  {
    id: "activity",
    label: "Activity",
    activeImage: activityActive,
    inactiveImage: activityInactive,
    fallbackIcon: Activity,
  },
  {
    id: "card",
    label: "Card",
    activeImage: cardActive,
    inactiveImage: cardInactive,
    fallbackIcon: CreditCard,
  },
  {
    id: "account",
    label: "Account",
    activeImage: accountActive,
    inactiveImage: accountInactive,
    fallbackIcon: User,
  },
];

export default function Sidebar({
  activePage,
  setActivePage,
  isOpen,
  setIsOpen,
  isMobileOpen,
  setIsMobileOpen,
}: SidebarProps) {
  const [open, setOpen] = useState(false);

  const handleClick = (id: string) => {
    setActivePage(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen bg-[#0f172a] transition-all duration-300 ${
          isOpen ? "w-64" : "w-20"
        } hidden md:block`}
      >
        {/* TOP BAR */}
        <div className="relative flex items-center justify-between px-4 py-5 h-16 shrink-0">
          {isOpen ? (
            <>
              <div className="flex items-center gap-2 mt-3">
                <Image src={LogoImg} alt="Logo" width={60} height={20} />
              </div>

              <button onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4 text-white cursor-pointer" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsOpen(true)}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3.5"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          )}
        </div>

        {/* MENU */}
        <nav
          className={`flex flex-col gap-2 px-2 mt-4 ${
            !isOpen && "items-center"
          }`}
        >
          {items.map((item) => {
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleClick(item.id)}
                className={`flex items-center font-DMSans rounded-full cursor-pointer transition ${
                  isActive
                    ? "bg-[#2B3343] text-white"
                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                } ${
                  isOpen
                    ? "gap-3 justify-start w-full px-3 py-3"
                    : "w-12 h-12 justify-center"
                }`}
              >
                <Image
                  src={isActive ? item.activeImage : item.inactiveImage}
                  alt={item.label}
                  width={18}
                  height={18}
                />

                {isOpen && <span className="text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div
          className={`absolute bottom-4 w-full px-2 ${
            !isOpen && "flex justify-center"
          }`}
        >
          <button
            onClick={() => setOpen(true)}
            className={`flex items-center font-DMSans rounded-full cursor-pointer px-3 py-3 text-sm text-red-400 hover:bg-red-500/10 ${
              isOpen ? "gap-3 w-full" : "w-12 h-12 justify-center"
            }`}
          >
            <BiLogOut className="h-5 w-5" />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <div
          className={`fixed inset-0 z-40 bg-black/40 ${
            isMobileOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
          onClick={() => setIsMobileOpen(false)}
        />

        <aside
          className={`fixed left-0 top-0 z-50 h-screen bg-[#0f172a] w-70 max-w-[85vw] transition-transform ${
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="relative flex items-center justify-between px-4 py-5 h-16">
            <Image src={LogoImg} alt="Logo" width={60} height={20} />
            <button onClick={() => setIsMobileOpen(false)}>
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          <nav className="flex flex-col gap-2 px-2 mt-4">
            {items.map((item) => {
              const isActive = activePage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleClick(item.id)}
                  className={`flex items-center font-DMSans rounded-full cursor-pointer transition ${
                    isActive
                      ? "bg-[#2B3343] text-white"
                      : "text-gray-400 hover:bg-white/10 hover:text-white"
                  } gap-3 px-3 py-3`}
                >
                  <Image
                    src={isActive ? item.activeImage : item.inactiveImage}
                    alt={item.label}
                    width={18}
                    height={18}
                  />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="absolute bottom-4 w-full px-2">
            <button
              onClick={() => setOpen(true)}
              className="flex items-center font-DMSans rounded-full cursor-pointer px-3 py-3 text-sm text-red-400 hover:bg-red-500/10 gap-3 w-full"
            >
              <BiLogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>
      </div>

      <LogoutModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
