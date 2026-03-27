"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import BgImg from "../../public/assets/otpbg.png";
import Link from "next/link";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function AccountVerificationOTP() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOtpChange = (value: string) => {
    const numeric = value.replace(/\D/g, "");

    if (numeric.length <= 6) {
      setOtp(numeric);
    }
  };

  useEffect(() => {
    const email = localStorage.getItem("pending_verify_email");
    if (!email) {
      toast.error("Session expired. Please sign up again.");
      router.push("/signup");
    }
  }, [router]);

  const handleConfirmCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const email = localStorage.getItem("pending_verify_email");
      if (!email) {
        throw new Error("No pending verification found. Please sign up again.");
      }

      const response = await api.post("/auth/verify-otp", { email, code: otp });

      localStorage.removeItem("pending_verify_email");

      // Save auth token
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      toast.success("Account verified successfully!");
      router.push("/accountregister");
    } catch (error: any) {
      console.error("Verification failed:", error);
      alert(error.response?.data?.message || error.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const email = localStorage.getItem("pending_verify_email");
      if (!email) {
        toast.error("No email found. Please sign up again.");
        return;
      }

      await api.post("/auth/resend-otp", { email });
      setOtp(""); // Clear OTP field
      toast.success("Code Sent Successfully!");
    } catch (error: any) {
      console.error("Resend failed:", error);
      toast.error(error.response?.data?.message || "Failed to resend code");
    } finally {
      setLoading(false);
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
        <form onSubmit={handleConfirmCode}>
          <input
            type="text"
            value={otp}
            onChange={(e) => handleOtpChange(e.target.value)}
            placeholder="333333"
            maxLength={6}
            className="w-full text-center text-white text-2xl tracking-widest bg-transparent border-b border-[#23446E] outline-none py-3 mb-6"
            required
          />

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#82F764] cursor-pointer font-DMSans text-black py-3 rounded-full transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? "Verifying..." : "Confirm code"}
          </button>
        </form>

        {/* Resend */}
        <p className="text-gray-400 font-DMSans text-sm mt-6">
          Didn’t receive any code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="text-white font-DMSans cursor-pointer hover:text-[#82F764] bg-transparent border-none p-0 disabled:opacity-50"
          >
            Resend
          </button>
        </p>
      </div>
    </div>
  );
}
