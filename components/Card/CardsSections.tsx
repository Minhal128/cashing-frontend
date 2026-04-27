import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";

import ChipImg from "@/public/assets/chip.png";
import MastercardImg from "@/public/assets/mastercard.png";

interface CreditCardProps {
  balance?: number;
  cardHolder?: string;
  validThru?: string;
  cardNumber?: string;
  className?: string;
}

const CreditCard: React.FC<CreditCardProps> = ({
  balance = 5756,
  cardHolder = "Eddy Cusuma",
  validThru = "12/22",
  cardNumber = "3778 ****** 1234",
  className = "",
}) => {
  return (
    <div
      className={`relative w-full rounded-2xl cursor-pointer text-white p-6 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${className}`}
    >
      <div className="absolute top-6 right-6">
        <Image
          src={ChipImg}
          alt="Card Chip"
          width={48}
          height={36}
          className="object-contain"
        />
      </div>

      <div className="absolute bottom-6 right-6">
        <Image
          src={MastercardImg}
          alt="Payment Network"
          width={48}
          height={32}
          className="object-contain"
        />
      </div>

      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-white/5"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-white/5"></div>

      <div className="mb-6">
        <div className="text-[10px] tracking-wider text-white/80 mb-0 font-DMSans">
          Balance
        </div>
        <div className="text-lg font-DMSans">${balance.toLocaleString()}</div>
      </div>

      <div className="flex justify-between mb-10">
        <div>
          <div className="text-[9px] tracking-widest text-white/80 font-DMSans">
            CARD HOLDER
          </div>
          <div className="text-base font-DMSans tracking-wider">
            {cardHolder}
          </div>
        </div>
        <div>
          <div className="text-[9px] tracking-widest text-white/80 font-DMSans">
            VALID THRU
          </div>
          <div className="text-base font-DMSans tracking-wider">
            {validThru}
          </div>
        </div>
      </div>

      <div className="text-md font-DMSans tracking-[0.2em]">{cardNumber}</div>
    </div>
  );
};

const CardSection: React.FC = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [userName, setUserName] = useState("User");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteCard = async (cardId: string) => {
    if (!confirm("Are you sure you want to remove this card?")) return;
    
    setDeletingId(cardId);
    try {
      await api.delete(`/wallet/payment-methods/${cardId}`);
      toast.success("Card removed successfully!");
      setCards(cards.filter(c => c._id !== cardId));
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to remove card");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const fetchCardsData = async () => {
      try {
        const [pmRes, walletRes, profileRes] = await Promise.all([
          api.get("/wallet/payment-methods"),
          api.get("/wallet/wallets"),
          api.get("/wallet/profile")
        ]);

        setCards(pmRes.data.filter((m: any) => m.type === 'card'));

        const fiatWallet = walletRes.data.find((w: any) => w.type === 'fiat');
        if (fiatWallet) setBalance(fiatWallet.balance);

        if (profileRes.data) {
          setUserName(`${profileRes.data.firstName || ''} ${profileRes.data.lastName || ''}`.trim() || "User");
        }
      } catch (e) {
        console.error(e);
        const { toast } = await import("react-hot-toast");
        toast.error("Failed to load cards. Please check your connection.");
      }
    };
    fetchCardsData();
  }, []);

  return (
    <div className="">
      <div className="mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-5">
          {cards.length === 0 ? (
            <div className="text-gray-500 py-4">No cards added yet. Add one below.</div>
          ) : (
            cards.map((card, i) => (
              <div key={card._id} className="flex flex-col items-center gap-3">
                <CreditCard
                  className={`bg-linear-to-br ${i % 2 === 0 ? 'from-[#2D60FF] via-[#539BFF] to-blue-700' : 'from-[#4C49ED] via-[#0A06F4] to-[#4C49ED]'}`}
                  balance={balance}
                  cardNumber={`**** **** **** ${card.details.slice(-4)}`}
                  cardHolder={userName}
                  validThru="12/28"
                />
                <button
                  onClick={() => deleteCard(card._id)}
                  disabled={deletingId === card._id}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16} />
                  {deletingId === card._id ? "Removing..." : "Remove Card"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CardSection;
