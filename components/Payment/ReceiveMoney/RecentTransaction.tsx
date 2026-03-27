import Image, { StaticImageData } from "next/image";
import UserImg from "../../../public/assets/user.png";
import CardImg from "../../../public/assets/card.png";

import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function RecentTransaction() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get("/transactions/history");
        setTransactions(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div className="w-full rounded-2xl bg-[#111827] border border-[#2B3343] p-4 text-white">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-DMSans">Recent Transactions</h2>
        <button className="rounded-full font-DMSans bg-[#82F764] px-6 py-2 text-sm cursor-pointer font-medium text-black transition">
          View all
        </button>
      </div>

      {/* Transactions */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-center py-4">Loading...</p>
        ) : transactions.length === 0 ? (
          <p className="text-center py-4">No recent transactions</p>
        ) : (
          transactions.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between border-b border-white/10 pb-4 last:border-none"
            >
              {/* Left */}
              <div className="flex items-center gap-4">
                <div className="relative object-contain h-12 w-12 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-xs">{item.type[0].toUpperCase()}</span>
                </div>

                <div>
                  <p className="text-sm font-DMSans capitalize">{item.type.replace('_', ' ')}</p>
                  <p className="text-xs text-[#828EA7] font-DMSans">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Right */}
              <div className="text-right">
                <p
                  className={`text-sm font-DMSans ${item.amount < 0 ? "text-[#FF383C]" : "text-white"
                    }`}
                >
                  ${Math.abs(item.amount).toLocaleString()}
                </p>
                <p className="text-xs font-DMSans text-[#82F764] capitalize">
                  {item.status}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
