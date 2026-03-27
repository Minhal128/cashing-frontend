"use client";

import { IoMdArrowDropright } from "react-icons/io";

export default function Verification() {
  return (
    <div className="flex items-center justify-center">
      <div className="w-full rounded-2xl text-white">
        {/* Header */}
        <h1 className="text-sm md:text-md font-DMSans mb-3">
          Verify your identity
        </h1>

        <div className="rounded-xl bg-[#202736] px-3 py-4 mb-3">
          <h2 className="font-DMSans mb-1">User-verification</h2>
          <p className="text-sm font-DMSans text-[#828EA7] mb-2 md:pr-70">
            Only takes 3–5 minutes to complete the identity verification to
            protect your account from fraud and illegal risks.
          </p>

          <button className="bg-[#00B595] cursor-pointer transition px-6 py-2 rounded-lg text-sm font-DMSans w-full md:w-fit">
            Verify
          </button>
        </div>

        <div className="bg-[#202736] rounded-xl px-3 py-4 mb-3">
          <h2 className="font-DMSans mb-4">Your account limit</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span className="font-DMSans text-[#828EA7]">
                Transaction limit
              </span>
              <span className="text-white font-DMSans">$50,000</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span className="font-DMSans text-[#828EA7]">
                Withdrawal limit
              </span>
              <span className="text-white font-DMSans">$50,000</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span className="font-DMSans text-[#828EA7]">Deposit limit</span>
              <span className="text-white font-DMSans">$50,000</span>
            </div>
          </div>
        </div>

        <div className="p-3 flex items-center justify-between border-b border-[#2B3343]">
          <div>
            <h3 className="text-sm font-DMSans">Phone verification</h3>
            <span className="inline-block font-DMSans mt-1 text-xs bg-[#2B3343] text-[#82F764] px-3 py-1 rounded-full">
              Completed
            </span>
          </div>
          <IoMdArrowDropright size={20} className="text-white" />
        </div>

        <div className="p-3 flex items-center justify-between border-b border-[#2B3343] mb-10">
          <div>
            <h3 className="text-sm font-DMSans">Identity verification</h3>
            <span className="inline-block font-DMSans mt-1 text-xs bg-[#2B3343] text-[#FF383C] px-3 py-1 rounded-full">
              Not verified
            </span>
          </div>
          <IoMdArrowDropright size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
}
