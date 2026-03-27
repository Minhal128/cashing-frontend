"use client";

import { useState } from "react";
import { FiPlus, FiMinus, FiSearch } from "react-icons/fi";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

export default function Support() {
  const [openSection, setOpenSection] = useState<string | null>("Account");
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const faqData: FAQSection[] = [
    {
      title: "Account",
      items: [
        {
          question: "How do I create an account?",
          answer:
            "You can create an account by clicking on the Sign Up button and filling in the required details.",
        },
        {
          question: "How do I change my email or phone number?",
          answer:
            "Go to Account Settings and update your email or phone number from there.",
        },
        {
          question: "Why is my account locked?",
          answer:
            "Your account may be locked due to security reasons or multiple failed login attempts.",
        },
        {
          question: "How do I check my account verification (KYC) status?",
          answer:
            "Navigate to the KYC section in your profile to check your verification status.",
        },
        {
          question: "How do I recover my account if I lose access?",
          answer:
            "Use the account recovery option on the login page to regain access.",
        },
      ],
    },
    {
      title: "Security",
      items: [
        {
          question: "How do I change my password?",
          answer:
            "You can change your password from the Security section in Account Settings.",
        },
        {
          question: "How do I enable two-factor authentication (2FA)?",
          answer:
            "Go to Security settings and enable 2FA using your preferred authentication method.",
        },
        {
          question: "What should I do if I notice suspicious activity?",
          answer:
            "Immediately change your password and contact support for further assistance.",
        },
      ],
    },
    {
      title: "Wallets",
      items: [
        {
          question: "How do I add a new wallet?",
          answer:
            "Navigate to the Wallets section and click on Add Wallet to link a new wallet.",
        },
        {
          question: "Why is my wallet balance not updating?",
          answer:
            "Wallet balance updates may take some time depending on network confirmations.",
        },
        {
          question: "Can I link multiple wallets?",
          answer:
            "Yes, you can link multiple wallets to your account from the Wallets section.",
        },
      ],
    },
    {
      title: "Transactions",
      items: [
        {
          question: "How can I view my transaction history?",
          answer:
            "All your transactions are available in the Transactions section of your dashboard.",
        },
        {
          question: "Why is my transaction pending?",
          answer:
            "Transactions may remain pending due to network congestion or verification delays.",
        },
        {
          question: "Can I cancel a transaction?",
          answer:
            "Once initiated, transactions cannot be canceled. Please double-check before confirming.",
        },
      ],
    },
    {
      title: "KYC",
      items: [
        {
          question: "What documents are required for KYC?",
          answer:
            "You need a valid government-issued ID and proof of address for KYC verification.",
        },
        {
          question: "How long does KYC verification take?",
          answer:
            "KYC verification usually takes 24–48 hours after document submission.",
        },
        {
          question: "Why was my KYC rejected?",
          answer:
            "KYC may be rejected due to unclear documents or mismatched information.",
        },
      ],
    },
  ];

  return (
    <div className="w-full flex items-center justify-center">
      <div className="w-full rounded-2xl text-white">
        {/* Header */}
        <h2 className="text-md text-gray-400 font-DMSans">Support</h2>
        <h1 className="text-md md:text-lg font-DMSans mt-1">
          How can we help you?
        </h1>
        <p className="text-sm text-gray-400 font-DMSans mt-0">
          Find answers to the most commonly asked questions
        </p>

        {/* Search */}
        <div className="relative mt-3">
          <FiSearch
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search for your answers"
            className="w-full rounded-full font-DMSans bg-[#202736] pl-11 pr-4 py-4 text-sm outline-none"
          />
        </div>

        {/* FAQ Sections */}
        <div className="mt-3 space-y-3 rounded-xl bg-[#202736]">
          {faqData.map((section) => {
            const isSectionOpen = openSection === section.title;

            return (
              <div key={section.title} className="rounded-full bg-[#2027369c]">
                {/* Section Header */}
                <button
                  onClick={() =>
                    setOpenSection(isSectionOpen ? null : section.title)
                  }
                  className="w-full flex items-center cursor-pointer font-DMSans justify-between px-4 py-4 text-left"
                >
                  <span className="font-DMSans text-sm">{section.title}</span>
                  {isSectionOpen ? <FiMinus size={14} /> : <FiPlus size={14} />}
                </button>

                {/* Questions */}
                {isSectionOpen && section.items.length > 0 && (
                  <div className="">
                    {section.items.map((item) => {
                      const isQuestionOpen = openQuestion === item.question;

                      return (
                        <div key={item.question} className="last:border-none">
                          <button
                            onClick={() =>
                              setOpenQuestion(
                                isQuestionOpen ? null : item.question,
                              )
                            }
                            className="w-full font-DMSans cursor-pointer flex justify-between items-center px-4 py-3 text-sm text-left text-gray-300 hover:text-white"
                          >
                            {item.question}
                          </button>

                          {isQuestionOpen && (
                            <div className="px-4 font-DMSans pb-4 text-sm text-gray-400">
                              {item.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
