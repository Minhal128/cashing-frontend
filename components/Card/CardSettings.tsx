"use client";

import Image from "next/image";

import BlockCardIcon from "@/public/assets/cardcard.png";
import PinIcon from "@/public/assets/pin.png";
import ApplePayIcon from "@/public/assets/pay.png";
import CashAppIcon from "@/public/assets/cash.png";

interface SettingItemProps {
  icon: any;
  title: string;
  description: string;
}

const SettingItem = ({ icon, title, description }: SettingItemProps) => {
  return (
    <div className="flex items-center gap-3 transition">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2B3343]">
        <Image src={icon} alt={title} className="h-6 w-6 object-contain" />
      </div>

      <div>
        <h3 className="text-base font-DMSans text-white md:text-sm">{title}</h3>
        <p className="text-xs font-DMSans text-gray-400">{description}</p>
      </div>
    </div>
  );
};

export default function CardSettings() {
  return (
    <div className="w-full rounded-2xl bg-[#121A2A] p-3">
      <h2 className="mb-2 text-sm font-DMSans text-white md:text-lg">
        Card Settings
      </h2>

      {/* Settings List */}
      <div className="flex flex-col gap-2">
        <SettingItem
          icon={BlockCardIcon}
          title="Block card"
          description="Instantly block your card"
        />

        <SettingItem
          icon={PinIcon}
          title="Change pin code"
          description="Instantly block your card"
        />

        <SettingItem
          icon={ApplePayIcon}
          title="Connect Apple Pay"
          description="Instantly block your card"
        />

        <SettingItem
          icon={CashAppIcon}
          title="Connect Cashapp"
          description="Instantly block your card"
        />
      </div>
    </div>
  );
}
