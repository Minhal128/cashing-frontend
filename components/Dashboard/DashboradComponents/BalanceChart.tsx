"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { IoMdArrowDropdown } from "react-icons/io";
import api from "@/lib/api";
import { useCurrency } from "@/context/CurrencyContext";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center">
      <div className="text-gray-400">Loading chart...</div>
    </div>
  ),
});

interface ChartData {
  month: string;
  balance: number;
}

const timeOptions = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

export default function BalanceChart() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [isClient, setIsClient] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    setIsClient(true);

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get(`/transactions/balance-history?period=${selectedPeriod}`);
        // Transform backend data {date, balance} to ChartData {month, balance}
        const formattedData = response.data.map((item: any) => ({
          month: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          balance: item.balance
        }));
        setChartData(formattedData);
      } catch (error) {
        console.error("Failed to fetch balance history:", error);
        // Set empty data on error
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [selectedPeriod]);

  const series = [
    {
      name: "Balance",
      data: chartData.map((item) => item.balance),
    },
  ];

  const options: any = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ["#82F764"],
    stroke: { curve: "straight", width: 2 },
    markers: {
      size: 4,
      colors: ["#82F764"],
      strokeColors: "#1B202A",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    grid: {
      borderColor: "#374151",
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: chartData.map((item) => item.month),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#9CA3AF", fontSize: "12px" },
      },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : `$${val.toFixed(0)}`,
        style: { colors: "#9CA3AF", fontSize: "12px" },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.4,
        opacityTo: 0.15,
        stops: [0, 80, 100],
      },
    },
  };



  const selectedLabel = timeOptions.find(
    (o) => o.value === selectedPeriod,
  )?.label;

  // Get current balance (latest data point)
  const currentBalance = chartData.length > 0 ? chartData[chartData.length - 1].balance : 0;

  // Calculate percentage change from first to last
  const percentageChange = chartData.length > 1
    ? (((chartData[chartData.length - 1].balance - chartData[0].balance) / chartData[0].balance) * 100).toFixed(1)
    : 0;

  return (
    <div className="w-full rounded-xl bg-[#1D2430] p-3 text-white">
      <div className="px-2 py-4 flex justify-between items-center">
        <h2 className="text-lg font-DMSans">Balance History</h2>

        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 rounded-lg bg-[#2B3343] border border-[#434B5C] px-4 py-2 text-sm font-DMSans"
          >
            {selectedLabel}
            <IoMdArrowDropdown />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-full rounded-lg bg-[#1E293B] shadow-lg z-20">
              {timeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedPeriod(option.value);
                    setOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-[#2A3344]
                    ${selectedPeriod === option.value ? "text-[#82F764]" : ""}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#1B202A] rounded-2xl p-4">
        <div className="flex flex-col items-start gap-2">
          <div className="text-2xl font-DMSans">{formatCurrency(currentBalance)}</div>
          <span className={`text-xs font-DMSans px-2 py-1 rounded-full ${Number(percentageChange) >= 0 ? 'text-[#82F764] bg-green-900/30' : 'text-red-500 bg-red-900/30'
            }`}>
            {Number(percentageChange) >= 0 ? '+' : ''}{percentageChange}% vs last period
          </span>
        </div>

        <div className="h-64 mt-4">
          {isClient && (
            <ReactApexChart
              options={options}
              series={series}
              type="area"
              height="100%"
            />
          )}
        </div>
      </div>
    </div>
  );
}
