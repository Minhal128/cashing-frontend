"use client";

import LinkedBanks from "../Wallet/LinkedBanks";
import LinkedWallets from "../Wallet/LinkedWallets";
import RecentActivities from "../Wallet/RecentActivities";
import WalletBalanceCard from "../Wallet/WalletBalanceCard";

export default function WalletPage({ setActivePage }: { setActivePage: (page: string) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-DMSans text-white">Wallet</h1>
        <p className="text-sm font-DMSans text-[#7A869C]">
          Transfer funds to other Cha $Ching users
        </p>
      </div>

      <WalletBalanceCard setActivePage={setActivePage} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LinkedBanks />
        <LinkedWallets />
      </div>

      <RecentActivities />
    </div>
  );
}
