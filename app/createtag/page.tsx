"use client";

import { useState } from "react";
import Image from "next/image";
import BgImg from "../../public/assets/otpbg.png";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";


export default function CreateTagPage() {
  const router = useRouter();
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tag, setTag] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateTag = async () => {
    if (!tag) {
      toast.error("Please enter a user tag");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/create-tag", { tag: tag.trim() });
      toast.success("Tag created successfully!");
      router.push("/verifyidentity");
    } catch (error: any) {
      console.error("Create Tag failed:", error);
      toast.error(error.response?.data?.message || "Failed to create tag");
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
            Create Your User Tag
          </h1>

          <p className="text-[#8CA1C2] font-DMSans text-sm mt-1">
            This is your unique handle on the platform
          </p>
        </div>

        {/* Input Field */}
        <div className="relative mt-10">
          <input
            type="text"
            placeholder="Choose your user tag (e.g. alex_pay)"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full bg-[#2A3243] font-DMSans text-sm text-white placeholder-[#8CA1C2] rounded-full px-5 py-4 pr-12 outline-none"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8CA1C2] text-xs">
            @{tag.trim()}
          </div>
        </div>

        {/* Button */}
        <button
          onClick={handleCreateTag}
          disabled={loading}
          className={`w-full mt-4 cursor-pointer font-DMSans bg-[#82F764] text-black font-medium py-3 rounded-full transition hover:opacity-90 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? "Creating..." : "Proceed"}
        </button>
      </div>
    </div>
  );
}
