"use client";

import { useState } from "react";
import Image from "next/image";
import BgImg from "../../public/assets/otpbg.png";
import Link from "next/link";

export default function ForgotPasswordOTP() {
  const [otp, setOtp] = useState("");

  const handleOtpChange = (value: string) => {
    const numeric = value.replace(/\D/g, "");

    if (numeric.length <= 6) {
      const formatted =
        numeric.length > 3
          ? `${numeric.slice(0, 3)}-${numeric.slice(3)}`
          : numeric;

      setOtp(formatted);
    }
  };

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

      {/* OTP Card */}
      <div className="relative z-20 w-full max-w-lg h-130 bg-[#202736] rounded-lg shadow-xl p-6 sm:p-8 text-center">
        <h1 className="text-white font-DMSans text-xl md:text-3xl font-semibold mb-2">
          OTP Verification
        </h1>

        <p className="text-[#8CA1C2] px-14 pt-3 font-DMSans text-sm mb-6">
          Enter the OTP code sent to your phone number, or use your email
          address to complete verification
        </p>

        {/* OTP Input */}
        <input
          type="text"
          value={otp}
          onChange={(e) => handleOtpChange(e.target.value)}
          placeholder="333-333"
          maxLength={7}
          className="w-full text-center text-white text-2xl tracking-widest bg-transparent border-b border-[#23446E] outline-none py-3 mb-6"
        />

        {/* Button */}
        <Link href="/changepassword">
          <button className="w-full bg-[#82F764] cursor-pointer font-DMSans text-black py-3 rounded-full transition">
            Confirm code
          </button>
        </Link>

        {/* Resend */}
        <p className="text-gray-400 font-DMSans text-sm mt-6">
          Didn’t receive any code?{" "}
          <span className="text-white font-DMSans cursor-pointer hover:text-[#82F764]">
            Resend
          </span>
        </p>
      </div>
    </div>
  );
}
