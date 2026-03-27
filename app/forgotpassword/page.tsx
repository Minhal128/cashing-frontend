"use client";

import Image from "next/image";
import BgImg from "../../public/assets/otpbg.png";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 overflow-hidden">

      <div className="absolute inset-0 z-0">
        <Image
          src={BgImg}
          alt="Dots background"
          fill
          priority
          className="object-cover opacity-30"
        />
      </div>

      <div className="absolute inset-0 z-10 bg-[#202632]/95"></div>

      {/* Card */}
      <div className="relative z-20 h-130 w-full max-w-lg bg-[#202736] rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-white font-DMSans text-xl md:text-2xl">
          Forgot password?
        </h1>

        <p className="text-[#8CA1C2] font-DMSans md:pr-40 text-sm mt-1">
          Enter associated email address or phone number to receive OTP
        </p>

        {/* INPUT */}
        <div className="mt-10">
          <input
            type="email"
            placeholder="Please enter your email address"
            className="w-full bg-[#2A3243] text-sm font-DMSans text-white placeholder-[#8CA1C2] rounded-full px-5 py-4 outline-none"
          />
        </div>

        {/* BUTTON */}
        <Link href="/forgotpasswordotp">
          <button className="w-full cursor-pointer mt-4 font-DMSans bg-[#82F764] text-black text-sm py-3 rounded-full transition">
            Get OTP Code
          </button>
        </Link>
      </div>
    </div>
  );
}
