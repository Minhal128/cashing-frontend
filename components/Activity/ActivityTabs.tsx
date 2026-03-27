"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/lib/api";
import { useCurrency } from "@/context/CurrencyContext";

import StatusImg from "@/public/assets/tabs.png";
import { FaArrowAltCircleUp } from "react-icons/fa";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  statusText: string;
  isCurrency?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  statusText,
  isCurrency = false,
}) => {
  const percentage = change.split(" ")[0];
  const restText = change.replace(percentage, "").trim();

  return (
    <div className="bg-[#111827] rounded-xl shadow-md px-2 py-2 flex flex-col h-full border border-[#2B3343] hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-[#828A92] text-sm font-DMSans mb-2">{title}</h3>

      <div className="flex bg-[#222937] p-2 rounded-lg flex-col mb-2">
        <span className="text-2xl md:text-2xl font-DMSans text-white">
          {value}
        </span>

        <span className="text-sm flex font-DMSans items-center gap-1">
          <span className="flex items-center gap-1 text-green-600">
            <FaArrowAltCircleUp size={14} className="mt-0.8" />
            {percentage}
          </span>
          =<span className="text-white font-DMSans">{restText}</span>
        </span>

        <div className="w-full h-px bg-[#2B3343] my-2" />

        <div className="flex items-center gap-2">
          <Image
            src={StatusImg}
            alt="status"
            width={12}
            height={12}
            className="object-contain"
          />

          <p className="text-gray-600 font-DMSans text-xs">{statusText}</p>
        </div>
      </div>
    </div>
  );
};

interface ActivityStats {
  totalSent: string;
  totalReceived: string;
  transactionCount: string;
  pendingTransactions: string;
}

export default function ActivityTabs() {
  const [stats, setStats] = useState<ActivityStats>({
    totalSent: "$0",
    totalReceived: "$0",
    transactionCount: "0",
    pendingTransactions: "0"
  });
  const [loading, setLoading] = useState(true);
  const { getCurrencySymbol } = useCurrency();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/transactions/stats");
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch activity stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const metrics = [
    {
      id: 1,
      title: "Total Sent",
      value: stats?.totalSent || "$0",
      change: "+0.2% vs last quarter",
      statusText: "Slightly higher than average",
      isCurrency: true,
    },
    {
      id: 2,
      title: "Total Received",
      value: stats?.totalReceived || "$0",
      change: "+0.2% vs last quarter",
      statusText: "Slightly higher than average",
      isCurrency: true,
    },
    {
      id: 3,
      title: "Number of transactions",
      value: stats?.transactionCount || "0",
      change: "+0.2% vs last quarter",
      statusText: "Slightly higher than average",
      isCurrency: false,
    },
    {
      id: 4,
      title: "Pending Transactions",
      value: stats?.pendingTransactions || "0",
      change: "+0.2% vs last quarter",
      statusText: "Slightly higher than average",
      isCurrency: false,
    },
  ];

  return (
    <div className="to-gray-100">
      <div className="mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.id}
              title={metric.title}
              value={metric.value}
              change={metric.change}
              statusText={metric.statusText}
              isCurrency={metric.isCurrency}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
