"use client";

import { useState } from "react";
import Image from "next/image";
import BgImg from "../../public/assets/otpbg.png";
import ReactCountryFlag from "react-country-flag";
import { MdArrowDropDown } from "react-icons/md";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Link from "next/link";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast"; // Assuming toast for feedback

const countries = [
  { name: "United States", code: "+1", iso: "US" },
  { name: "United Kingdom", code: "+44", iso: "GB" },
  { name: "Pakistan", code: "+92", iso: "PK" },
  { name: "India", code: "+91", iso: "IN" },
];

export default function SignInPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"email" | "phone">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(countries[0]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = activeTab === "email"
        ? { email, password }
        : { phone: `${selected.code}${phone}`, password };

      const response = await api.post("/auth/signin", payload);

      const { token } = response.data;
      localStorage.setItem("token", token);

      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login failed:", error);
      alert(error.response?.data?.message || "Invalid credentials");
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

      {/* Card */}
      <div className="relative z-20 w-full max-w-lg bg-[#202736] rounded-xl shadow-xl p-6 sm:p-8">
        {/* Logo */}
        <div className="flex mb-0">
          <Image
            src="/assets/logo.png"
            alt="Cha Sching"
            width={90}
            height={48}
          />
        </div>

        {/* Heading */}
        <h1 className="text-white font-DMSans text-xl md:text-2xl">
          Login to your account
        </h1>

        <p className="text-[#FFFFFF] font-DMSans text-sm mt-1">
          Don’t have an account?{" "}
          <Link href="/signup">
            <span className="text-[#82F764] font-DMSans cursor-pointer">
              Sign up
            </span>
          </Link>
        </p>

        {/* Tabs */}
        <div className="flex bg-[#2B3343] rounded-full mt-6 p-1">
          <button
            onClick={() => setActiveTab("email")}
            className={`w-1/2 py-3 rounded-full font-DMSans cursor-pointer text-sm transition ${activeTab === "email"
                ? "bg-[#3A445A] text-white"
                : "text-[#8CA1C2]"
              }`}
          >
            Email Address
          </button>

          <button
            onClick={() => setActiveTab("phone")}
            className={`w-1/2 py-3 rounded-full font-DMSans cursor-pointer text-sm transition ${activeTab === "phone"
                ? "bg-[#3C465A] text-white"
                : "text-[#8CA1C2]"
              }`}
          >
            Phone number
          </button>
        </div>

        {/* EMAIL / PHONE INPUT */}
        <form onSubmit={handleSignIn} className="mt-5">
          {activeTab === "email" ? (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Please enter your email address"
              className="w-full bg-[#2A3243] text-sm font-DMSans text-white placeholder-[#8CA1C2] rounded-full px-5 py-4 outline-none"
              required
            />
          ) : (
            <div className="relative">
              <div className="flex items-center rounded-full bg-[#2A3243] px-4 py-4">
                <button
                  type="button"
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-1 font-DMSans"
                >
                  <ReactCountryFlag
                    svg
                    countryCode={selected.iso}
                    style={{ width: "1.25em", height: "1.25em" }}
                  />
                  <span className="text-sm text-white">{selected.code}</span>
                  <MdArrowDropDown className="text-[#8CA1C2]" size={18} />
                </button>

                <div className="h-6 w-px bg-slate-600 mx-2" />

                {/* Phone */}
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="000 000 0000"
                  className="flex-1 bg-transparent text-sm font-DMSans text-white outline-none placeholder-[#8CA1C2]"
                  required
                />
              </div>

              {/* Dropdown */}
              {open && (
                <div className="absolute top-16 left-0 w-56 bg-[#1F2937] border border-slate-700 rounded-xl shadow-lg z-50">
                  {countries.map((c) => (
                    <div
                      key={c.iso}
                      onClick={() => {
                        setSelected(c);
                        setOpen(false);
                      }}
                      className="px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-slate-800 text-sm text-white"
                    >
                      <ReactCountryFlag
                        svg
                        countryCode={c.iso}
                        style={{ width: "1.25em", height: "1.25em" }}
                      />
                      <span>{c.name}</span>
                      <span className="ml-auto text-slate-400">{c.code}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Password */}
          <div className="relative mt-2">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-[#2A3243] font-DMSans text-sm text-white placeholder-[#8CA1C2] rounded-full px-5 py-4 pr-12 outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8CA1C2]"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible size={20} />
              ) : (
                <AiOutlineEye size={20} />
              )}
            </button>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 cursor-pointer font-DMSans bg-[#82F764] text-black font-medium py-3 rounded-full transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Forgot */}
        <Link href="/forgotpassword">
          <p className="text-[#ffffff] font-DMSans text-sm mt-4 cursor-pointer hover:text-white">
            Forgot password
          </p>
        </Link>
      </div>
    </div>
  );
}
