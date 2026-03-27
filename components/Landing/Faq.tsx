"use client";

import { useState } from "react";
import Image from "next/image";
import SmallIcon from "../../public/assets/herofirst.png";
import { FiPlusCircle, FiMinusCircle } from "react-icons/fi";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "How can I send money to another user?",
    answer:
      "You can send money instantly to any user on the platform using their unique user ID or tag. Simply enter the user ID, choose the amount, and confirm the transfer. The funds move directly from your in-app wallet to the recipient’s wallet without needing bank details.",
  },
  {
    question: "How does the in-app wallet work?",
    answer:
      "The in-app wallet allows you to store, send, and receive money securely within the platform. You can manage your balance, track transactions, and transfer funds instantly.",
  },
  {
    question: "What payment methods can I use to receive money?",
    answer:
      "You can receive money directly into your in-app wallet from other users without linking a bank account.",
  },
  {
    question: "Can I withdraw my money at any time?",
    answer:
      "Yes, you can withdraw your money anytime subject to platform policies and verification.",
  },
  {
    question: "Do I need bank details to receive money from other users?",
    answer:
      "No, you do not need bank details. Funds are transferred directly between in-app wallets.",
  },
];

const Faq = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section
      data-animate="true"
      className="relative w-full text-white py-20 px-4 md:pt-30 md:px-10"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-2">
        <div>
          {/* Badge */}
          <div className="flex justify-center md:justify-start md:mb-4 mb-6">
            <div className="flex items-center gap-1 py-1 px-3 rounded-full bg-[#2A3241] border border-[#454E5F]">
              <div className="w-6 h-6 relative">
                <Image
                  src={SmallIcon}
                  alt="Icon"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="rounded-full font-DMSans text-sm text-gray-200">
                One platform. Total control.
              </span>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl md:mb-6 font-DMSans">FAQs</h2>
          <p className="text-gray-400 md:pr-10 max-w-md font-DMSans">
            Everything you need to know about the product and billing. Can’t
            find the answer you’re looking for?
          </p>
        </div>

        {/* FAQ ACCORDION */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;

            return (
              <div
                key={index}
                className={`rounded-lg p-5 transition-all duration-300 ${
                  isOpen
                    ? "bg-[#252B37] border border-transparent"
                    : "bg-transparent border border-[#252B37]"
                }`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="text-base font-DMSans">{faq.question}</span>

                  <span className="flex h-9 w-9 items-center font-DMSans justify-center text-lg leading-none">
                    {isOpen ? (
                      <FiMinusCircle size={24} />
                    ) : (
                      <FiPlusCircle size={24} />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <p className="mt-4 text-xs font-DMSans text-gray-400 leading-relaxed">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Faq;
