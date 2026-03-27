"use client";

import Link from "next/link";
import api from "@/lib/api";
import { useEffect } from "react";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";

declare global {
  interface Window {
    ethereum?: any;
  }
}
import { useState } from "react";
import { Check, Trash2, Plus } from "lucide-react";
import AddNewCardForm from "../Card/AddNewCardForm";

interface PaymentMethod {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 1,
    title: "Visa",
    subtitle: "Ending with 5769",
    icon: "/assets/visa.png",
  },
  {
    id: 2,
    title: "Apple Pay",
    subtitle: "josh436@gmail.com",
    icon: "/assets/pay.png",
  },
  {
    id: 3,
    title: "Cashapp",
    subtitle: "josh436@gmail.com",
    icon: "/assets/cash.png",
  },
];

export default function PaymentMethods() {
  const [activeId, setActiveId] = useState<string>("");
  const [methods, setMethods] = useState<any[]>([]);
  const [showAddCard, setShowAddCard] = useState(false);

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      const res = await api.get("/wallet/payment-methods");
      setMethods(res.data);
      if (res.data.length > 0) setActiveId(res.data[0]._id);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteMethod = async (methodId: string) => {
    try {
      await api.delete(`/wallet/payment-methods/${methodId}`);
      toast.success("Payment method removed!");
      fetchMethods();
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to remove payment method");
    }
  };

  // Add test card for demo purposes
  const addTestCard = async () => {
    try {
      // Use Stripe test token for test cards
      await api.post("/wallet/payment-methods", {
        type: 'card',
        provider: 'Visa',
        details: 'Ending with 4242',
        paymentMethodId: 'pm_card_visa' // Stripe test payment method
      });

      toast.success("Test card added!");
      fetchMethods();
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to add test card");
    }
  };

  // Connect Wallet (MetaMask)
  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];

      // Save to backend
      await api.post("/wallet/payment-methods", {
        type: 'crypto_wallet',
        provider: 'MetaMask',
        details: address
      });

      toast.success("Wallet connected!");
      fetchMethods();
    } catch (error: any) {
      console.error(error);
      toast.error("Connection failed");
    }
  };

  return (
    <div className="w-full rounded-2xl text-white">
      <h2 className="mb-2 text-md font-DMSans">Payment methods</h2>

      <div>
        {methods.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No payment methods linked.</p>
        ) : (
          methods.map((item, index) => {
            const isActive = activeId === item._id;

            return (
              <div
                key={item._id}
                className={`
                  flex items-center justify-between gap-4 py-2
                  ${index !== methods.length - 1 ? "border-b border-white/10" : ""}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2B3343]">
                    <span className="font-bold text-xs">{item.provider?.[0]}</span>
                  </div>

                  <div>
                    <p className="text-sm font-DMSans mb-0.5 capitalize">{item.type} - {item.provider}</p>
                    <p className="text-xs text-[#6F81A0] font-DMSans">
                      {item.details}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteMethod(item._id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    title="Delete payment method"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div
                    onClick={() => setActiveId(item._id)}
                    className={`
                      flex h-4 w-4 cursor-pointer items-center justify-center rounded-md
                      border transition-all
                      ${isActive
                        ? "border-[#82F764] text-black bg-[#82F764]"
                        : "border-gray-500"
                      }
                    `}
                  >
                    {isActive && <Check size={14} />}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-4 flex-wrap">
        <button
          onClick={() => setShowAddCard(!showAddCard)}
          className="
            rounded-lg bg-[#82F764]
            px-6 py-2 text-sm font-DMSans text-black
            cursor-pointer hover:opacity-90 flex items-center gap-2
          "
        >
          <Plus size={16} />
          {showAddCard ? "Cancel" : "Add Real Card"}
        </button>

        <button
          onClick={addTestCard}
          className="
            rounded-lg bg-[#2B3343]
            px-6 py-2 text-sm font-DMSans text-white
            cursor-pointer hover:bg-[#3b4455]
          "
        >
          Add Test Card (Mock)
        </button>

        <button
          onClick={connectWallet}
          className="
            rounded-lg bg-[#2B3343]
            px-6 py-2 text-sm font-DMSans text-white
            cursor-pointer hover:bg-[#3b4455]
          "
        >
          Connect Crypto Wallet
        </button>
      </div>

      {/* Add Card Form */}
      {showAddCard && (
        <div className="mt-4">
          <AddNewCardForm />
        </div>
      )}
    </div>
  );
}
