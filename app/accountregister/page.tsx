"use client";


import { useState } from "react";
import Image from "next/image";
import BgImg from "../../public/assets/otpbg.png";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function AccountRegisterPage() {
  const router = useRouter();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSetPin = async () => {
    if (!pin || !confirmPin) {
      toast.error("Please fill in both fields");
      return;
    }

    if (pin !== confirmPin) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/set-pin", { pin });
      toast.success("Wallet secured successfully!");
      router.push("/createtag");
    } catch (error: any) {
      console.error("Set PIN failed:", error);
      toast.error(error.response?.data?.message || "Failed to secure wallet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={BgImg}
          alt="Dots background"
          fill
          priority
          className="object-cover opacity-30"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 z-10 bg-[#202632]/95"></div>

      {/* Card */}
      <div className="relative z-20 w-full h-90 max-w-lg bg-[#202736] rounded-xl shadow-xl p-6 sm:p-8">
        {/* Heading (CENTERED) */}
        <div className="text-center">
          <h1 className="text-white font-DMSans text-xl md:text-2xl">
            Secure your wallet
          </h1>

          <p className="text-[#8CA1C2] font-DMSans text-sm mt-1">
            Your financial safety is our top priority
          </p>
        </div>

        {/* New Password */}
        <div className="relative mt-8">
          <input
            type={showNewPassword ? "text" : "password"}
            placeholder="Create Wallet PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full bg-[#2A3243] font-DMSans text-sm text-white placeholder-[#8CA1C2] rounded-full px-5 py-4 pr-12 outline-none"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8CA1C2]"
          >
            {showNewPassword ? (
              <AiOutlineEyeInvisible size={20} />
            ) : (
              <AiOutlineEye size={20} />
            )}
          </button>
        </div>

        {/* Confirm New Password */}
        <div className="relative mt-2">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Wallet PIN"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            className="w-full bg-[#2A3243] font-DMSans text-sm text-white placeholder-[#8CA1C2] rounded-full px-5 py-4 pr-12 outline-none"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8CA1C2]"
          >
            {showConfirmPassword ? (
              <AiOutlineEyeInvisible size={20} />
            ) : (
              <AiOutlineEye size={20} />
            )}
          </button>
        </div>

        {/* Button */}
        <button
          onClick={handleSetPin}
          disabled={loading}
          className={`w-full mt-6 cursor-pointer font-DMSans bg-[#82F764] text-black font-medium py-3 rounded-full transition hover:opacity-90 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? "Securing wallet..." : "Proceed"}
        </button>
      </div>
    </div>
  );
}
