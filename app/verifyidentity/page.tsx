"use client";

import { useState, forwardRef, useEffect } from "react";
import Image from "next/image";
import BgImg from "../../public/assets/otpbg.png";
import { FiShield, FiCheck, FiLoader } from "react-icons/fi";
import { FiCalendar } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IoMdArrowDropdown } from "react-icons/io";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

type Option = {
  label: string;
  value: string;
};

type DropdownProps = {
  placeholder: string;
  options: Option[];
  value: Option | null;
  onChange: (option: Option) => void;
};

const Dropdown = ({ placeholder, options, value, onChange }: DropdownProps) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="relative w-full">
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="w-full bg-[#2A3244] px-4 py-3 rounded-full cursor-pointer flex items-center justify-between"
      >
        <span className={value ? "text-white" : "text-[#8CA1C2]"}>
          {value ? value.label : placeholder}
        </span>
        <IoMdArrowDropdown
          size={16}
          className={`text-white transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-[#202736] border border-[#3C465E] rounded-xl overflow-hidden max-h-48 overflow-y-auto">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`px-4 py-3 cursor-pointer text-sm ${
                value?.value === opt.value
                  ? "bg-[#2A3244] text-[#82F764]"
                  : "text-white hover:bg-[#2A3244]"
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

type DateInputProps = {
  value?: string;
  onClick?: () => void;
  placeholder?: string;
};

const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, onClick, placeholder }, ref) => (
    <div onClick={onClick} className="relative w-full cursor-pointer">
      <input
        ref={ref}
        value={value ?? ""}
        readOnly
        placeholder={placeholder}
        className="w-full bg-[#2A3244] text-white placeholder-[#8CA1C2] px-4 py-3 pr-12 rounded-full outline-none cursor-pointer"
      />
      <FiCalendar className="absolute right-4 top-1/2 -translate-y-1/2 text-white" />
    </div>
  )
);

DateInput.displayName = "DateInput";

// US States
const US_STATES: Option[] = [
  { label: "Alabama", value: "AL" },
  { label: "Alaska", value: "AK" },
  { label: "Arizona", value: "AZ" },
  { label: "Arkansas", value: "AR" },
  { label: "California", value: "CA" },
  { label: "Colorado", value: "CO" },
  { label: "Connecticut", value: "CT" },
  { label: "Delaware", value: "DE" },
  { label: "Florida", value: "FL" },
  { label: "Georgia", value: "GA" },
  { label: "Hawaii", value: "HI" },
  { label: "Idaho", value: "ID" },
  { label: "Illinois", value: "IL" },
  { label: "Indiana", value: "IN" },
  { label: "Iowa", value: "IA" },
  { label: "Kansas", value: "KS" },
  { label: "Kentucky", value: "KY" },
  { label: "Louisiana", value: "LA" },
  { label: "Maine", value: "ME" },
  { label: "Maryland", value: "MD" },
  { label: "Massachusetts", value: "MA" },
  { label: "Michigan", value: "MI" },
  { label: "Minnesota", value: "MN" },
  { label: "Mississippi", value: "MS" },
  { label: "Missouri", value: "MO" },
  { label: "Montana", value: "MT" },
  { label: "Nebraska", value: "NE" },
  { label: "Nevada", value: "NV" },
  { label: "New Hampshire", value: "NH" },
  { label: "New Jersey", value: "NJ" },
  { label: "New Mexico", value: "NM" },
  { label: "New York", value: "NY" },
  { label: "North Carolina", value: "NC" },
  { label: "North Dakota", value: "ND" },
  { label: "Ohio", value: "OH" },
  { label: "Oklahoma", value: "OK" },
  { label: "Oregon", value: "OR" },
  { label: "Pennsylvania", value: "PA" },
  { label: "Rhode Island", value: "RI" },
  { label: "South Carolina", value: "SC" },
  { label: "South Dakota", value: "SD" },
  { label: "Tennessee", value: "TN" },
  { label: "Texas", value: "TX" },
  { label: "Utah", value: "UT" },
  { label: "Vermont", value: "VT" },
  { label: "Virginia", value: "VA" },
  { label: "Washington", value: "WA" },
  { label: "West Virginia", value: "WV" },
  { label: "Wisconsin", value: "WI" },
  { label: "Wyoming", value: "WY" },
];

type KycStatus = 'pending' | 'processing' | 'verified' | 'requires_input' | 'failed';

export default function VerifyIdentityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [kycStatus, setKycStatus] = useState<KycStatus>('pending');
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);

  // Form fields
  const [dob, setDob] = useState<Date | null>(null);
  const [gender, setGender] = useState<Option | null>(null);
  const [state, setState] = useState<Option | null>(null);
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [address, setAddress] = useState("");

  // Check current KYC status on mount
  useEffect(() => {
    checkVerificationStatus();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dotsFlowCompleted = new URLSearchParams(window.location.search).get('dots_flow') === 'completed';
      if (dotsFlowCompleted) {
        checkVerificationStatus();
      }
    }
  }, []);

  useEffect(() => {
    if (!verificationUrl) {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        const response = await api.get('/kyc/verification-status');
        const status = response.data.status as KycStatus;
        setKycStatus(status);

        if (status === 'verified') {
          setVerificationUrl(null);
          toast.success('Identity verified successfully!');
          setTimeout(() => router.push('/dashboard'), 1200);
        }
      } catch (error) {
        console.error('Error polling KYC status:', error);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [verificationUrl, router]);

  const checkVerificationStatus = async (notifyIfVerified = true) => {
    try {
      const response = await api.get('/kyc/verification-status');
      setKycStatus(response.data.status);

      if (response.data.status === 'verified' && notifyIfVerified) {
        toast.success('Identity already verified!');
        setTimeout(() => router.push('/dashboard'), 1500);
      }
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleVerify = async () => {
    // Validate form fields first
    if (!dob || !gender || !state || !city || !zipCode) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      // First, save the profile data
      await api.post("/auth/update-profile", {
        dob,
        gender: gender.value,
        country: "US",
        state: state.value,
        city: city,
        zipCode,
        address
      });

      // Then start verification flow
      const response = await api.post('/kyc/create-verification-session', {
        returnUrl: `${window.location.origin}/verifyidentity`
      });
      const { url, flowLink } = response.data;
      const finalUrl = url || flowLink;

      if (!finalUrl) {
        toast.error('Failed to create verification session');
        setLoading(false);
        return;
      }
      setKycStatus('processing');
      setVerificationUrl(finalUrl);
    } catch (error: any) {
      console.error("Verification failed:", error);
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Show processing/verified state
  if (kycStatus === 'verified' || (kycStatus === 'processing' && !verificationUrl)) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src={BgImg} alt="Background" fill priority className="object-cover opacity-30" />
        </div>
        <div className="absolute inset-0 z-10 bg-[#202632]/95" />
        
        <div className="relative z-20 w-full max-w-md bg-[#202736] rounded-xl shadow-xl p-6 sm:p-8 text-center">
          {kycStatus === 'verified' ? (
            <>
              <FiCheck className="text-[#82F764] text-5xl mx-auto mb-4" />
              <h1 className="text-white text-xl font-semibold">Identity Verified!</h1>
              <p className="text-[#8CA1C2] text-sm mt-2">Redirecting to dashboard...</p>
            </>
          ) : (
            <>
              <FiLoader className="text-[#F7B955] text-5xl mx-auto mb-4 animate-spin" />
              <h1 className="text-white text-xl font-semibold">Verification in Progress</h1>
              <p className="text-[#8CA1C2] text-sm mt-2">We&apos;re reviewing your documents...</p>
              <button
                onClick={() => checkVerificationStatus()}
                className="mt-4 text-[#82F764] text-sm hover:underline"
              >
                Refresh Status
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src={BgImg}
          alt="App background"
          fill
          priority
          className="object-cover opacity-30"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 z-10 bg-[#202632]/95" />

      {/* In-page verification embed */}
      {verificationUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 sm:p-6">
          <div className="w-full h-full max-w-5xl mx-auto bg-[#202736] rounded-xl border border-[#3C465E] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#3C465E]">
              <div>
                <h3 className="text-white text-base font-semibold">Complete Identity Verification</h3>
                <p className="text-[#8CA1C2] text-xs">Stay on this page and finish verification below.</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  setVerificationUrl(null);
                  await checkVerificationStatus(false);
                }}
                className="text-[#8CA1C2] hover:text-white text-sm"
              >
                Close
              </button>
            </div>

            <iframe
              src={verificationUrl}
              title="Identity verification"
              className="w-full flex-1 min-h-[560px] bg-white"
              allow="camera; microphone; fullscreen"
            />
          </div>
        </div>
      )}

      {/* Card */}
      <div className="relative z-20 w-full max-w-lg bg-[#202736] rounded-xl shadow-xl p-6 sm:p-8">
        {checkingStatus ? (
          <div className="flex flex-col items-center py-8">
            <FiLoader className="text-[#82F764] text-4xl animate-spin" />
            <p className="text-[#8CA1C2] mt-4">Loading...</p>
          </div>
        ) : (
          <>
            {/* Heading */}
            <div className="text-center">
              <h1 className="text-white text-xl md:text-2xl">
                Verify Your Identity
              </h1>
              <p className="text-[#8CA1C2] text-sm mt-1">
                Your data is encrypted and never shared
              </p>
            </div>

            {/* FORM */}
            <div className="mt-6 space-y-3">
              {/* Date of Birth */}
              <DatePicker
                selected={dob}
                onChange={(date: Date | null) => setDob(date)}
                dateFormat="MM/dd/yyyy"
                placeholderText="Date of birth (MM/DD/YYYY)"
                customInput={<DateInput placeholder="Date of birth" />}
                wrapperClassName="w-full"
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                maxDate={new Date()}
              />

              <Dropdown
                placeholder="Gender"
                value={gender}
                onChange={setGender}
                options={[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                  { label: "Other", value: "other" },
                ]}
              />

              <Dropdown
                placeholder="State"
                value={state}
                onChange={setState}
                options={US_STATES}
              />

              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#2A3244] text-white placeholder-[#8CA1C2] px-4 py-3 rounded-full outline-none"
              />

              <input
                type="text"
                placeholder="Street Address (Optional)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#2A3244] text-white placeholder-[#8CA1C2] px-4 py-3 rounded-full outline-none"
              />

              <input
                type="text"
                placeholder="Zip code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full bg-[#2A3244] text-white placeholder-[#8CA1C2] px-4 py-3 rounded-full outline-none"
              />

              {/* Identity Info Box */}
              <div className="border border-[#3C465E] rounded-xl p-4 bg-[#2A3244]/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#82F764]/20 flex items-center justify-center">
                    <FiShield className="text-[#82F764] text-xl" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Secure ID Verification</p>
                    <p className="text-[#8CA1C2] text-xs">
                      Complete verification directly on this page to unlock withdrawals
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleVerify}
              disabled={loading || Boolean(verificationUrl)}
              className={`w-full cursor-pointer mt-6 bg-[#82F764] text-black font-medium py-3 rounded-full hover:opacity-90 ${
                loading || Boolean(verificationUrl) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? "Processing..." : "Proceed"}
            </button>

            {/* Powered by Stripe */}
            <div className="mt-4 flex justify-center">
              <div className="flex items-center gap-2 text-[#8CA1C2] text-xs">
                <span>Secured by Stripe</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
