import { useState, useEffect } from "react";
import Image from "next/image";
import { Repeat, ChevronRight } from "lucide-react";
import { BiSolidCopy } from "react-icons/bi";
import { IoMdArrowDropright } from "react-icons/io";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

import ProfileImg from "@/public/assets/profileimg.png";

export default function AccountHeader() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/wallet/profile");
        setUser(res.data);
      } catch (error) {
        console.error("Failed to fetch profile in header", error);
      }
    };
    fetchProfile();
  }, []);

  const handleCopyUID = () => {
    if (user?.tag || user?._id) {
      navigator.clipboard.writeText(user?.tag || user?._id);
      toast.success("UID copied!");
    }
  };

  return (
    <div className="bg-[#111827] rounded-2xl px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">
        {/* PROFILE IMAGE */}
        <div className="relative w-16 h-16">
          <Image
            src={user?.profileImage || ProfileImg}
            alt="User Profile"
            fill
            className="rounded-full object-cover"
          />
        </div>

        {/* USER INFO */}
        <div>
          <h2 className="text-md font-DMSans">
            {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
          </h2>
          <p className="text-xs text-gray-400 font-DMSans">
            {user ? user.email : "..."}
          </p>

          {/* SWITCH ACCOUNT BUTTON */}
          <button className="mt-2 flex items-center gap-1 text-[8px] font-DMSans bg-[#82F764] text-[#202736] px-2 py-1 rounded-full hover:opacity-90 transition">
            <Repeat size={10} />
            Switch account
          </button>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4 text-sm">
        {/* UID */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-[#828A92] text-xs mb-1 font-DMSans">UID</p>
            <div className="flex items-center gap-1">
              <p className="font-DMSans pr-3 max-w-[100px] truncate">
                {user ? (user.tag || user._id.substring(0, 8)) : "..."}
              </p>
              <BiSolidCopy
                size={14}
                className="text-[#FFFFFF] cursor-pointer"
                onClick={handleCopyUID}
              />
            </div>
          </div>
        </div>

        {/* VERTICAL DIVIDER */}
        <div className="h-10 w-px bg-gray-700" />

        {/* VERIFICATION */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-[#828A92] text-xs font-DMSans mb-1">
              ID Verification
            </p>
            <p className={`font-DMSans ${user?.isVerified ? 'text-[#82F764]' : 'text-[#FFFFFF]'}`}>
              {user?.isVerified ? "Verified" : "Not verified"}
            </p>
          </div>

          <IoMdArrowDropright size={18} className="text-white mt-3" />
        </div>
      </div>
    </div>
  );
}
