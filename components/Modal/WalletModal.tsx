"use client";

import { useState } from "react";
import { X } from "lucide-react";
import ReactCountryFlag from "react-country-flag";

interface Props {
  onClose: () => void;
}

const currencies = [
  { code: "USD", countryCode: "US" },
  { code: "EUR", countryCode: "EU" },
  { code: "CAD", countryCode: "CA" },
  { code: "JPY", countryCode: "JP" },
  { code: "GBP", countryCode: "GB" },
  { code: "CHF", countryCode: "CH" },
];

export default function WalletModal({ onClose }: Props) {
  const [step, setStep] = useState<"currency" | "confirm">("currency");
  const [selected, setSelected] = useState<string>("");

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div onClick={onClose} className="absolute inset-0 bg-black/40" />

      <div className="absolute md:right-30 right-25 top-16 w-[70vw] max-w-xs space-y-4">
        {step === "currency" && (
          <div className="rounded-2xl bg-[#0F172A] p-4 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-DMSans">Select preferred currency</h2>
              <X
                onClick={onClose}
                className="h-4 w-4 cursor-pointer text-gray-400"
              />
            </div>

            <input
              placeholder="Search currency"
              className="w-full mb-3 font-DMSans rounded-full bg-[#202736] px-3 py-2 text-sm outline-none"
            />

            <div className="space-y-2">
              {currencies.map((c) => (
                <div
                  key={c.code}
                  onClick={() => {
                    setSelected(c.code);
                    setStep("confirm");
                  }}
                  className="flex items-center gap-3 rounded-full px-3 py-2 hover:bg-[#1E293B] cursor-pointer"
                >
                  {/* Flag */}
                  <ReactCountryFlag
                    svg
                    countryCode={c.countryCode}
                    style={{
                      width: "1.2em",
                      height: "1.2em",
                    }}
                  />

                  <span className="text-xs font-DMSans">{c.code}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className="rounded-2xl bg-[#0F172A] p-4 text-white shadow-xl">
            <h3 className="mb-3 text-xs font-DMSans text-gray-400 uppercase">
              Confirmation
            </h3>

            <p className="text-center font-DMSans text-lg font-semibold mb-4">
              $145,000.00
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span className="font-DMSans text-xs">Recipient</span>
                <span className="text-white font-DMSans text-xs">Sarah</span>
              </div>

              <div className="flex justify-between text-gray-400">
                <span className="font-DMSans text-xs">Fee</span>
                <span className="text-white text-xs font-DMSans">0</span>
              </div>

              <div className="flex justify-between text-gray-400">
                <span className="font-DMSans text-xs">Reference</span>
                <span className="text-white text-xs font-DMSans">
                  646586547HF646
                </span>
              </div>

              <div className="flex justify-between font-semibold">
                <span className="font-DMSans text-xs">Total</span>
                <span className="font-DMSans text-xs">$145,000</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-4 w-full rounded-lg cursor-pointer font-DMSans bg-[#82F764] py-2 text-sm text-black"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
