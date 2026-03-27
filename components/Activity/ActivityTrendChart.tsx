"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { useState, useEffect } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import api from "@/lib/api";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ActivityTrendChartProps {
  currentValue?: number;
  percentageChange?: number;
}

export default function ActivityTrendChart({
  currentValue = 0,
  percentageChange = 0,
}: ActivityTrendChartProps) {
  const [month, setMonth] = useState("Monthly");
  const [isOpen, setIsOpen] = useState(false);
  const [chartData, setChartData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [balance, setBalance] = useState("$0.00");
  const [percentChange, setPercentChange] = useState("0%");

  const months = ["Monthly", "Weekly", "Daily"];

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        const res = await api.get("/transactions/balance-history");
        if (res.data && res.data.length > 0) {
          const values = res.data.map((item: any) => item.balance);
          const dates = res.data.map((item: any) => {
            const d = new Date(item.date);
            return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          });

          setChartData(values);
          setLabels(dates);

          const lastBalance = values[values.length - 1];
          setBalance(`$${lastBalance.toLocaleString()}`);

          if (values.length >= 2) {
            const last = values[values.length - 1];
            const prev = values[values.length - 2];
            if (prev !== 0) {
              const change = ((last - prev) / prev) * 100;
              setPercentChange(`${change > 0 ? '+' : ''}${change.toFixed(1)}%`);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch balance history for chart", error);
      }
    };
    fetchTrend();
  }, []);

  const chartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: "100%",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 5,
        columnWidth: "40%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    series: [
      {
        name: "Balance",
        data: chartData,
      },
    ],
    xaxis: {
      categories: labels,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "#FFFFFF",
          fontSize: "10px",
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (val: number) =>
          val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toString(),
        style: {
          colors: "#FFFFFF",
          fontSize: "10px",
        },
      },
      tickAmount: 5,
    },
    grid: {
      show: true,
      borderColor: '#2B3343',
      strokeDashArray: 4,
    },
    colors: ["#82F764"],
  };

  const getPercentageColor = (percentage: string) =>
    percentage.startsWith('+') ? "text-green-500" : "text-red-500";

  return (
    <div className="bg-[#111827] rounded-xl shadow-sm p-3 w-full border border-[#2B3343]">
      {/* HEADER */}
      <div className="flex items-start justify-between mb-6 relative">
        <h2 className="text-lg font-DMSans text-white">Activity Trend</h2>

        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 border bg-[#2B3343] border-[#434B5C] rounded-md px-3 py-1.5 text-sm text-white"
          >
            {month}
            <IoMdArrowDropdown size={16} />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-full bg-[#202736] border border-[#434B5C] rounded-md overflow-hidden z-10">
              {months.map((item) => (
                <div
                  key={item}
                  onClick={() => {
                    setMonth(item);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-[#2B3343] ${month === item ? "bg-[#2B3343] text-blue-400" : "text-white"
                    }`}
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#202736] rounded-lg p-4">
        {/* VALUE SECTION */}
        <div className="mb-6">
          <span className="text-xl font-DMSans text-white">
            {balance}
          </span>

          <div
            className={`text-xs font-DMSans mt-1 ${getPercentageColor(
              percentChange,
            )}`}
          >
            {percentChange} vs last period
          </div>
        </div>

        {/* CHART */}
        <div className="h-80 w-full">
          {chartData.length > 0 ? (
            <Chart
              options={chartOptions}
              series={chartOptions.series}
              type="bar"
              height="100%"
              width="100%"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm">
              No trend data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
