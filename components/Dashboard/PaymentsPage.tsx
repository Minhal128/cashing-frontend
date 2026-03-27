"use client";

import { useState, useEffect } from "react";
import PaymentTabs from "../Payment/PaymentTabs";
import SendMoney from "../Payment/SendMoney/SendMoney";
import { GiReceiveMoney } from "react-icons/gi";
import ReceiveMoney from "../Payment/ReceiveMoney/ReceiveMoney";
import api from "@/lib/api";

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<"send" | "receive">("send");
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  const fetchData = async () => {
    try {
      const response = await api.get("/wallet/wallets");
      setWallets(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
    setRefreshCount(prev => prev + 1);
    window.dispatchEvent(new CustomEvent('refresh-balances'));
  };

  const totalBalance = wallets.reduce((acc, w) => acc + (w.type === 'fiat' ? w.balance : 0), 0);

  return (
    <div className="min-h-screen text-white">
      {/* Top Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-DMSans">Payment</h1>
        <p className="text-sm text-gray-400 font-DMSans">
          Transfer funds to other Cha $Ching users
        </p>
      </div>

      {/* Tabs */}
      <PaymentTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "send" && (
          <SendMoney
            balance={totalBalance}
            loading={loading}
            onRefresh={handleRefresh}
            refreshCount={refreshCount}
          />
        )}
        {activeTab === "receive" && <ReceiveMoney />}
      </div>
    </div>
  );
}
