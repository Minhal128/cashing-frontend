"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { MdArrowDropDown } from "react-icons/md";
import SignUpRight from "../../public/assets/signupright.png";
import Logo from "../../public/assets/logo.png";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const countries = [
  { name: "United States", code: "+1", iso: "US" },
  { name: "United Kingdom", code: "+44", iso: "GB" },
  { name: "Pakistan", code: "+92", iso: "PK" },
  { name: "India", code: "+91", iso: "IN" },
];

export default function SignupPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(countries[0]);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const [firstName, ...lastNames] = fullName.split(" ");
      const lastName = lastNames.join(" ") || "User";

      const payload = {
        firstName,
        lastName,
        email,
        phone: `${selected.code}${phone}`,
        password,
      };

      const response = await api.post("/auth/signup", payload);

      // Store email for OTP verification
      localStorage.setItem("pending_verify_email", email);

      // Check if user needs verification (existing unverified account)
      if (response.data.needsVerification) {
        toast.success("OTP resent to your email");
        router.push("/accountverificationotp");
        return;
      }

      // Check if user needs to complete profile (resume flow)
      if (response.data.nextStep) {
        toast.success(response.data.message || "Resuming account setup...");

        // If the flow requires a token we might need to redirect to signin
        // But for set-pin, they need to be logged in. 
        // If they are not logged in, they should go to signin.
        if (response.data.shouldLogin) {
          toast('Please sign in to continue setup', { icon: '🔑' });
          router.push('/signin');
        } else {
          router.push(response.data.nextStep);
        }
        return;
      }

      router.push("/accountverificationotp");
    } catch (error: any) {
      console.error("Signup failed:", error);
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center py-10 bg-[#0B1220] justify-center">
      <div
        className="
          w-full max-w-8xl h-200
          grid grid-cols-1 md:grid-cols-[2fr_4fr]
          items-stretch
          rounded-2xl
          overflow-hidden
          md:p-8 p-5 gap-5
        "
      >
        <div className="h-full p-2 md:px-4 text-white rounded-xl bg-[#202736] border border-[#2a3144] flex flex-col justify-center">
          {/* LOGO */}
          <div className="flex items-center gap-2 mb-3">
            <Image src={Logo} alt="Logo" width={80} height={36} />
          </div>

          <h2 className="text-3xl font-DMSans mb-2">Create an account</h2>
          <p className="text-slate-400 font-DMSans mb-8">
            Already have an account?{" "}
            <Link href="/signin" className="text-[#82F764]">
              Log in
            </Link>
          </p>

          <form onSubmit={handleSignUp} className="space-y-3">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className="w-full h-15 font-DMSans px-4 rounded-full bg-slate-800 border border-slate-700 placeholder-slate-400 focus:outline-none"
              required
            />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Please enter your email address"
              className="w-full h-15 px-4 font-DMSans rounded-full bg-slate-800 border border-slate-700 placeholder-slate-400 focus:outline-none"
              required
            />

            {/* COUNTRY + PHONE */}
            <div className="relative">
              <div className="flex items-center h-15 rounded-full bg-slate-800 border border-slate-700 px-4">
                <button
                  type="button"
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-1 font-DMSans pr-1"
                >
                  <ReactCountryFlag
                    svg
                    countryCode={selected.iso}
                    style={{ width: "1.25em", height: "1.25em" }}
                  />
                  <span className="text-sm">{selected.code}</span>
                  <MdArrowDropDown className="text-[#8CA1C2]" size={18} />
                </button>

                <div className="h-6 w-px bg-slate-600 mr-2" />

                {/* PHONE */}
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="000 000 0000"
                  className="flex-1 font-DMSans bg-transparent outline-none placeholder-slate-400"
                  required
                />
              </div>

              {open && (
                <div className="absolute top-16 left-0 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-lg z-50">
                  {countries.map((c) => (
                    <div
                      key={c.iso}
                      onClick={() => {
                        setSelected(c);
                        setOpen(false);
                      }}
                      className="px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-slate-800 text-sm"
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

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full h-15 px-4 font-DMSans rounded-full bg-slate-800 border border-slate-700 placeholder-slate-400 focus:outline-none"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-4 h-15 font-DMSans rounded-full bg-[#82F764] text-black font-semibold cursor-pointer transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? "Creating account..." : "Create new account"}
            </button>

            <div className="space-y-3 text-sm text-slate-400 mt-4">
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" required />
                <span className="font-DMSans text-md md:pr-10">
                  By submitting your email, you confirm you’ve read this{" "}
                  <span className="text-[#82F764]">Policy Notice</span>
                </span>
              </label>

              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1 accent-[#2B3343]" />
                <span className="font-DMSans">
                  I agree to receive marketing updates and offers
                </span>
              </label>
            </div>
          </form>
        </div>

        <div className="h-full hidden md:flex relative rounded-xl bg-[#111827] border border-[#2a3144] overflow-hidden">
          <Image
            src={SignUpRight}
            alt="Signup Illustration"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}
