import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { IoMdArrowDropdown } from "react-icons/io";
import api from "@/lib/api";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Activity {
  label: string;
  value: number;
  amount: string;
  color: string;
}

const timeOptions = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

export default function ActivityCard() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await api.get("/transactions/activity");
        // Backend returns { label, value, amount, color }
        setActivities(response.data);
      } catch (error) {
        console.error("Failed to fetch activity:", error);
      }
    };

    fetchActivity();
  }, [selectedPeriod]); // Ensure backend handles period if needed, currently hardcoded in backend to all time or simpler logic

  /* ===== BASE ARC ===== */
  const baseOptions: ApexOptions = {
    chart: {
      type: "radialBar",
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: {
          size: "60%",
        },
        track: {
          background: "#6359E9",
        },
        dataLabels: {
          show: false,
        },
      },
    },
    stroke: {
      lineCap: "round",
      width: 20,
    },
    colors: ["#64CFF6"],
  };

  /* ===== PROGRESS ARC ===== */
  const progressOptions: ApexOptions = {
    ...baseOptions,
    colors: ["#6FDBFF"],
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = timeOptions.find(
    (o) => o.value === selectedPeriod,
  )?.label;

  return (
    <div className="w-full rounded-3xl bg-linear-to-b from-[#1F2633] to-[#171D29] p-6 text-white shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-DMSans">Activities</h2>

        {/* Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 rounded-lg bg-[#2A3142] border border-[#3A4256] px-4 py-2 text-sm font-DMSans"
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

      {/* ===== Semi Circle (2 Layers) ===== */}
      <div className="relative flex justify-center mb-10">
        {/* Base line */}
        <Chart
          options={baseOptions}
          series={[200]}
          type="radialBar"
          height={480}
          width={600}
        />

        {/* Progress line */}
        <div className="absolute inset-0 flex justify-center">
          <Chart
            options={progressOptions}
            series={[52]}
            type="radialBar"
            height={480}
            width={600}
          />
        </div>

        {/* Center text */}
        <div className="absolute bottom-12 text-center">
          <p className="text-5xl font-DMSans">52%</p>
        </div>
      </div>

      {/* Activity Rows */}
      <div className="flex flex-col gap-3 mb-6">
        {activities.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />

            <span className="text-xs font-DMSans w-28">{item.label}</span>

            <div className="flex-1 h-2 rounded-full bg-[#2A3142] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${item.value}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>

            <span className="text-xs w-16 font-DMSans text-right">
              {item.amount}
            </span>
          </div>
        ))}
      </div>

      {/* Button */}
      <button className="w-full py-3 rounded-full cursor-pointer font-DMSans bg-[#2B3343] border border-[#434B5C] text-md transition">
        View all activity
      </button>
    </div>
  );
}
