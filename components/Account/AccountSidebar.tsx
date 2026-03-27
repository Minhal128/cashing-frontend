"use client";

import { useState } from "react";
import { FiSliders, FiChevronDown } from "react-icons/fi";
import { FaUserAlt } from "react-icons/fa";
import { BsShieldLockFill, BsCreditCardFill } from "react-icons/bs";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { TbHeadphonesFilled } from "react-icons/tb";

interface Props {
  active: string;
  setActive: (value: string) => void;
}

const menu = [
  {
    id: "profile",
    label: "Profile info",
    desc: "Personal details & avatar",
    icon: FaUserAlt,
  },
  {
    id: "security",
    label: "Security",
    desc: "Password & authentication",
    icon: BsShieldLockFill,
  },
  {
    id: "payment",
    label: "Payment methods",
    desc: "Cards & billing",
    icon: BsCreditCardFill,
  },
  {
    id: "verification",
    label: "Verification",
    desc: "Identity confirmation",
    icon: IoIosCheckmarkCircle,
    badge: "Not verified",
  },
  {
    id: "preference",
    label: "Preference",
    desc: "Language & appearance",
    icon: FiSliders,
  },
  {
    id: "support",
    label: "Support",
    desc: "Help & contact",
    icon: TbHeadphonesFilled,
  },
];

export default function AccountSidebar({ active, setActive }: Props) {
  const [open, setOpen] = useState(false);
  const activeItem = menu.find((m) => m.id === active);

  return (
    <>
      {/* MOBILE */}
      <div className="lg:hidden overflow-visible">
        <div className="bg-[#121826] rounded-xl p-4 mb-2">
          <button
            onClick={() => setOpen(!open)}
            className="w-full flex items-center justify-between text-sm"
          >
            <span>{activeItem?.label}</span>
            <FiChevronDown
              className={`transition ${open ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {open && (
          <div className="bg-[#121826] rounded-xl p-3 mb-4">
            <div className="space-y-2">
              {menu.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActive(item.id);
                      setOpen(false);
                    }}
                    className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-[#1c2333]"
                  >
                    <div className="w-8 h-8 rounded-md bg-[#1c2333] flex items-center justify-center">
                      <Icon size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* DESKTOP */}
      <div className="hidden lg:flex h-full bg-[#121826] rounded-xl p-2 flex-col">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`flex items-start cursor-pointer gap-2 mb-2 py-2 px-3 rounded-full transition
              ${
                isActive
                  ? "bg-[#202736] border border-[#2B3343]"
                  : "hover:bg-[#1c2333]"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center
                ${isActive ? "bg-[#2B3343] text-[#82F764]" : "bg-[#1c2333]"}`}
              >
                <Icon size={16} />
              </div>

              <div className="flex-1 text-left">
                <p className="text-sm">{item.label}</p>
                <p className="text-xs text-[#828EA7]">{item.desc}</p>
              </div>

              {item.badge && (
                <div className="text-[10px] px-3 py-1 rounded-full bg-[#2B3343] text-[#FF383C] self-center">
                  {item.badge}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
