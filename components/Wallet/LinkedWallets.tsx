import { useState, useEffect } from "react";
import Image from "next/image";
import { FaPlus } from "react-icons/fa6";
import api from "@/lib/api";
import ConnectWalletModal from "../Modal/ConnectWalletModal";

import BitCoin from "../../public/assets/bit.png";
import Eth from "../../public/assets/eth.png";

export default function LinkedWallets() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const fetchWallets = async () => {
    try {
      const res = await api.get("/wallet/payment-methods");
      // Filter for crypto wallets
      const cryptoWallets = res.data.filter((m: any) => m.type === 'crypto_wallet');
      setWallets(cryptoWallets);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  return (
    <div className="w-full rounded-2xl bg-[#111827] border border-[#2B3343] px-3 py-4 text-white shadow-xl">
      {/* Header */}
      <div className="mb-3">
        <h2 className="font-DMSans text-lg">Linked Wallets</h2>
      </div>

      {/* Bank Rows */}
      <div className="space-y-3">
        {wallets.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-2">No linked wallets</p>
        ) : (
          wallets.map((wallet: any) => (
            <div
              key={wallet._id}
              className="flex items-center justify-between rounded-xl bg-[#202736] border border-[#394150] px-2 py-2"
            >
              {/* Left */}
              <div className="flex items-center gap-2">
                <Image
                  src={wallet.provider === 'Bitcoin' ? BitCoin : Eth}
                  alt={wallet.provider || 'Wallet'}
                  width={30}
                  height={30}
                  className="object-contain"
                />

                <div className="flex flex-col">
                  <p className="font-DMSans font-medium">{wallet.provider || 'Crypto Wallet'}</p>
                  <span className="text-xs font-DMSans text-gray-400 truncate w-32">
                    {wallet.details}
                  </span>
                </div>
              </div>

              {/* Right */}
              <span className="rounded-full bg-[#2B3343] px-3 py-1 text-xs font-DMSans text-[#82F764]">
                Connected
              </span>
            </div>
          ))
        )}
      </div>

      {/* Add Wallet Button */}
      <div className="mt-3">
        <button
          onClick={() => setShowModal(true)}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-gray-700 bg-[#2B3343] py-3 transition-all"
        >
          <FaPlus size={16} className="text-white" />
          <span className="font-DMSans text-sm">Add Crypto wallet</span>
        </button>
      </div>

      {/* Connect Wallet Modal */}
      <ConnectWalletModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConnected={() => fetchWallets()}
      />
    </div>
  );
}

