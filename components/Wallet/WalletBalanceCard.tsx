"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Send, Download, Upload } from "lucide-react";
import { TbEyeFilled } from "react-icons/tb";
import { PiEyeSlashFill } from "react-icons/pi";
import { HiArrowTrendingUp } from "react-icons/hi2";
import { FaPlusSquare } from "react-icons/fa";
import BgImg from "../../public/assets/cardbg.png";
import WithdrawModal from "../Modal/WithdrawModal";
import FundsModal from "../Modal/FundsModal";
import api from "@/lib/api";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function WalletBalanceCardWithChart({ setActivePage }: { setActivePage?: (page: string) => void }) {
  const [showBalance, setShowBalance] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [open, setOpen] = useState(false);
  const [isOpenFundsModal, setIsOpenFundsModal] = useState(false);
  const [balance, setBalance] = useState(0);
  const [chartData, setChartData] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [percentageChange, setPercentageChange] = useState<string>("0%");

  // ... (keeping existing useEffect and fetchData)

  useEffect(() => {
    setIsClient(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [walletRes, historyRes] = await Promise.all([
        api.get("/wallet/wallets"),
        api.get("/transactions/balance-history")
      ]);

      // Total balance
      const total = walletRes.data.reduce((acc: number, w: any) => acc + (w.type === 'fiat' ? w.balance : 0), 0);
      setBalance(total);

      // Chart data
      if (historyRes.data && historyRes.data.length > 0) {
        const balances = historyRes.data.map((item: any) => item.balance);
        setChartData(balances);

        // Simple percent change from previous point
        if (balances.length >= 2) {
          const last = balances[balances.length - 1];
          const prev = balances[balances.length - 2];
          if (prev !== 0) {
            const change = ((last - prev) / prev) * 100;
            setPercentageChange(`${change > 0 ? '+' : ''}${change.toFixed(1)}%`);
          } else if (last > 0) {
            setPercentageChange("+100%");
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch wallet data:", error);
    }
  };

  const series = [{ data: chartData }];

  const chartOptions: any = {
    chart: {
      type: "area",
      sparkline: { enabled: true },
      toolbar: { show: false },
      zoom: { enabled: false },
      dropShadow: {
        enabled: true,
        top: 6,
        blur: 8,
        opacity: 0.25,
        color: "#82F764",
      },
    },
    stroke: {
      curve: "straight",
      width: 3,
      colors: ["#82F764"],
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.35,
        opacityTo: 0,
        stops: [0, 100],
      },
    },
    markers: { size: 0 },
    grid: { show: false },
    tooltip: { enabled: false },
    xaxis: { labels: { show: false } },
    yaxis: { show: false },
  };

  return (
    <div className="w-full">
      <div className="relative w-full overflow-hidden rounded-2xl bg-[#202736] p-6 text-white">
        {/* Background */}
        <Image src={BgImg} alt="bg" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-[#121A2A]/50" />

        {/* Content */}
        <div className="relative z-10 flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-2 text-sm text-[#8293B7]">
            Total Balance
            <button onClick={() => setShowBalance(!showBalance)}>
              {showBalance ? (
                <TbEyeFilled size={16} />
              ) : (
                <PiEyeSlashFill size={16} />
              )}
            </button>
          </div>

          {/* Main Row */}
          <div className="flex items-center justify-between mt-4 gap-6">
            {/* Left Content */}
            <div className="w-full md:w-1/2">
              <h1 className="text-3xl font-bold font-DMSans">
                {showBalance ? `$${balance.toLocaleString()}` : "*****"}
              </h1>

              <p className="mt-2 flex items-center gap-1 text-xs text-[#82F764]">
                <HiArrowTrendingUp />
                {percentageChange} from last period
              </p>
            </div>

            {/* Desktop Chart */}
            <div className="hidden md:block w-full md:w-full md:ml-40 h-20">
              {isClient && (
                <ReactApexChart
                  options={chartOptions}
                  series={series}
                  type="area"
                  height="100%"
                  width="100%"
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => setActivePage?.("payments")}
              className="flex cursor-pointer items-center gap-2 rounded-full bg-[#82F764] px-2 pr-4 py-2 text-sm font-semibold text-black hover:opacity-90"
            >
              <span className="h-8 w-8 flex items-center justify-center rounded-full bg-[#202736]">
                <Send size={13} className="text-white" />
              </span>
              Send money
            </button>

            <button
              onClick={() => setActivePage?.("payments")}
              className="flex cursor-pointer items-center gap-2 rounded-full bg-[#82F764] px-2 pr-4 py-2 text-sm font-semibold text-black hover:opacity-90"
            >
              <span className="h-8 w-8 flex items-center justify-center rounded-full bg-[#202736]">
                <Download size={13} className="text-white" />
              </span>
              Receive money
            </button>

            <button
              onClick={() => setOpen(true)}
              className="flex cursor-pointer items-center gap-2 rounded-full bg-[#82F764] px-2 pr-4 py-2 text-sm font-semibold text-black"
            >
              <span className="h-8 w-8 flex items-center justify-center rounded-full bg-[#202736]">
                <Upload size={13} className="text-white" />
              </span>
              Withdraw money
            </button>

            <button
              onClick={() => setIsOpenFundsModal(true)}
              className="flex cursor-pointer items-center gap-2 rounded-full bg-[#82F764] px-2 pr-4 py-2 text-sm font-semibold text-black"
            >
              <span className="h-8 w-8 flex items-center justify-center rounded-full bg-[#202736]">
                <FaPlusSquare size={13} className="text-white" />
              </span>
              Add funds
            </button>
          </div>

          <WithdrawModal open={open} onClose={() => setOpen(false)} />
          <FundsModal
            isOpenFundsModal={isOpenFundsModal}
            onClose={() => setIsOpenFundsModal(false)}
            onRefresh={fetchData}
          />

          {/* Mobile Chart (BOTTOM) */}
          <div className="block md:hidden mt-6 h-24">
            {isClient && (
              <ReactApexChart
                options={chartOptions}
                series={series}
                type="area"
                height="100%"
                width="100%"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
