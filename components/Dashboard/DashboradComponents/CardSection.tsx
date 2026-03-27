// CardSection.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import BgImgLeft from "../../../public/assets/bgleft (1).png";
import BgRight from "../../../public/assets/bgright.png";
import MasetrImg from "../../../public/assets/master.png";
import Image from "next/image";
import api from "@/lib/api";
import { useCurrency } from "@/context/CurrencyContext";

interface Card {
  id: number;
  number: string;
  expiry: string;
  balance: number;
  cardHolder: string;
  gradient: string;
  logo: "mastercard" | "visa" | "amex";
  bgImageTopRight: string;
  bgImageBottomLeft: string;
}

interface CardSectionProps {
  setActivePage?: (page: string) => void;
}

export default function CardSection({ setActivePage }: CardSectionProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const [response, walletRes, profileRes] = await Promise.all([
          api.get("/wallet/payment-methods"),
          api.get("/wallet/wallets"),
          api.get("/wallet/profile"),
        ]);
        const fiatWallet = walletRes.data.find((w: any) => w.type === 'fiat');
        const walletBalance = fiatWallet?.balance || 0;
        const userName = profileRes.data
          ? `${profileRes.data.firstName || ''} ${profileRes.data.lastName || ''}`.trim()
          : 'User';
        const fetchedCards = response.data
          .filter((m: any) => m.type === 'card')
          .map((m: any, index: number) => ({
            id: m._id,
            number: m.details,
            expiry: "12/25",
            balance: walletBalance,
            cardHolder: userName,
            gradient: index % 2 === 0 ? "from-[#9C2CF3] to-[#3A6FF9]" : "from-[#f093fb] to-[#f5576c]",
            logo: m.provider === 'visa' ? 'visa' : 'mastercard',
            bgImageTopRight: "",
            bgImageBottomLeft: "",
          }));

        setCards(fetchedCards);
      } catch (error) {
        console.error("Failed to fetch cards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();

    window.addEventListener("refresh-balances", fetchCards);
    return () => {
      window.removeEventListener("refresh-balances", fetchCards);
    };
  }, []);

  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) handleNext();
    if (isRightSwipe) handlePrev();
  };

  const handleNext = () => {
    setCurrentCardIndex((prevIndex) =>
      prevIndex === cards.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const handlePrev = () => {
    setCurrentCardIndex((prevIndex) =>
      prevIndex === 0 ? cards.length - 1 : prevIndex - 1,
    );
  };

  const formatCardNumber = (number: string) => {
    return number.replace(/(\d{4})/g, "$1 ").trim();
  };

  return (
    <div className="w-full rounded-2xl bg-[#1D2430] p-4 text-white relative">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-DMSans">My Cards</h2>
      </div>

      {/* Card Container with hover group */}
      {loading ? (
        <div className="h-48 w-full flex items-center justify-center text-gray-400">
          Loading cards...
        </div>
      ) : cards.length === 0 ? (
        <div className="h-48 w-full flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-600 rounded-2xl mb-4">
          <p>No cards found</p>
          <button className="mt-2 text-sm text-[#82F764] hover:underline">
            link a card
          </button>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="group relative mb-4 h-50 border border-[#2B3343] overflow-hidden rounded-2xl flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Card */}
          <div
            className={`relative h-full w-full max-w-md rounded-2xl bg-linear-to-br ${cards[currentCardIndex]?.gradient || 'from-gray-700 to-gray-900'} p-6`}
          >
            {/* Top Right Image Removed */}
            {/* Bottom Left Image Removed */}

            {/* Card Content */}
            <div className="relative z-10 flex h-full flex-col justify-between">
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="mt-0">
                  <div className="text-sm font-DMSans opacity-80">
                    Current Balance
                  </div>
                  <div className="text-xl font-DMSans">
                    {formatCurrency(cards[currentCardIndex]?.balance || 0)}
                  </div>
                </div>
                <div className="relative h-10 w-16">
                  {cards[currentCardIndex]?.logo === "mastercard" && (
                    <div className="flex items-center justify-center">
                      <Image
                        src={MasetrImg}
                        alt="Mastercard"
                        width={50}
                        height={20}
                      />
                    </div>
                  )}
                  {cards[currentCardIndex]?.logo === "visa" && (
                    <div className="flex items-center justify-center rounded-md bg-white/20 p-2">
                      <span className="text-xs font-bold font-DMSans">VISA</span>
                    </div>
                  )}
                  {cards[currentCardIndex]?.logo === "amex" && (
                    <div className="flex items-center font-DMSans justify-center rounded-md bg-white/20 p-2">
                      <span className="text-xs font-bold">AMEX</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-DMSans">
                    {formatCardNumber(cards[currentCardIndex]?.number || "**** **** **** ****")}
                  </div>
                </div>
                <div>
                  <div className="font-DMSans">
                    {cards[currentCardIndex]?.expiry || "**/**"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Left Arrow (outside card, hidden by default) */}
          <button
            onClick={handlePrev}
            className="absolute left-2 z-20 hidden group-hover:flex rounded-full bg-white/20 p-3 backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Right Arrow (outside card, hidden by default) */}
          <button
            onClick={handleNext}
            className="absolute right-2 z-20 hidden group-hover:flex rounded-full bg-white/20 p-3 backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Card Indicators (Dots) */}
      <div className="mb-4 flex justify-center space-x-1">
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentCardIndex(index)}
            className={`h-2 rounded-full transition-all ${index === currentCardIndex
              ? "w-6 bg-[#6359E9]"
              : "w-2 bg-[#27264E]"
              }`}
            aria-label={`Go to card ${index + 1}`}
          />
        ))}
      </div>

      {/* Manage Cards Button */}
      <button
        onClick={() => setActivePage?.("card")}
        className="w-full rounded-full cursor-pointer font-DMSans bg-[#2B3343] py-3 text-white font-semibold border border-[#434B5C] transition-colors"
      >
        Manage Cards
      </button>
    </div>
  );
}
