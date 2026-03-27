import { useState, useEffect } from "react";
import { Search, Filter, Upload, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import api from "@/lib/api";

export default function RecentActivities() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [authRes, historyRes] = await Promise.all([
          api.get("/auth/status"),
          api.get("/transactions/history")
        ]);
        setCurrentUser(authRes.data);
        setActivities(historyRes.data);
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-[#2B3343] text-[#34C759]";
      case "pending":
        return "bg-[#2B3343] text-[#FF8D28]";
      case "failed":
        return "bg-[#2B3343] text-[#FF3B30]";
      default:
        return "bg-[#2B3343] text-gray-400";
    }
  };

  return (
    <div className="w-full rounded-2xl bg-[#111827] border border-[#2B3343] p-2 sm:p-3">
      {/* Header */}
      <div className="mb-4 flex bg-[#222937] p-3 rounded-md flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base sm:text-lg font-DMSans text-white">
          Recent wallet activities
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search"
              className="h-9 w-40 sm:w-56 font-DMSans rounded-md bg-[#2B3343] pl-9 pr-3 text-sm text-white placeholder-gray-400 outline-none ring-1 ring-white/10 focus:ring-white/20"
            />
          </div>

          {/* Filter */}
          <button className="flex h-9 items-center font-DMSans cursor-pointer gap-2 rounded-md bg-[#2B3343] px-3 text-sm text-gray-300 ring-1 ring-white/10 hover:bg-[#1F2937]">
            <Filter size={14} />
            Filter
          </button>

          {/* Export */}
          <button className="flex h-9 items-center font-DMSans gap-2 cursor-pointer rounded-md bg-[#2B3343] px-3 text-sm text-gray-300 ring-1 ring-white/10 hover:bg-[#1F2937]">
            <Upload size={14} />
            Export
          </button>

          <button className="flex h-9 w-9 items-center font-DMSans cursor-pointer justify-center rounded-md bg-[#2B3343] text-gray-300 ring-1 ring-white/10 hover:bg-[#1F2937]">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Table Wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-225">
          <thead>
            <tr className="text-left rounded-md text-xs text-gray-400">
              <th className="py-3 pr-3 pl-3">
                <input type="checkbox" className="accent-gray-500" />
              </th>
              <th className="py-3 pr-4 font-DMSans">Recipient/Sender</th>
              <th className="py-3 pr-4 font-DMSans">Transaction type</th>
              <th className="py-3 pr-4 font-DMSans">Status</th>
              <th className="py-3 pr-4 font-DMSans">Amount</th>
              <th className="py-3 pr-4 font-DMSans">Comments/Notes</th>
              <th className="py-3 pr-4 font-DMSans">Date</th>
              <th className="py-3 pr-4 font-DMSans text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="text-sm font-DMSans text-gray-300">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-gray-500">
                  Loading activities...
                </td>
              </tr>
            ) : activities.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-gray-500">
                  No activities found.
                </td>
              </tr>
            ) : (
              activities.map((item, index) => {
                const isOutcome = item.senderId?._id === currentUser?._id;
                const otherParty = isOutcome ? item.receiverId : item.senderId;
                const displayName = otherParty
                  ? `${otherParty.firstName} ${otherParty.lastName}`
                  : item.type === 'withdraw' ? 'Bank Account' : 'System';

                return (
                  <tr key={item._id} className="border-t border-white/5">
                    <td className="py-4 pr-4 pl-3">
                      <input type="checkbox" className="accent-gray-500" />
                    </td>

                    {/* Recipient */}
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-700 flex items-center justify-center">
                          {otherParty?.profileImage ? (
                            <Image
                              src={otherParty.profileImage}
                              alt={displayName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-[10px]">{displayName.charAt(0)}</span>
                          )}
                        </div>
                        {displayName}
                      </div>
                    </td>

                    <td className="py-4 pr-4 capitalize">{item.type.replace(/_/g, ' ')}</td>

                    <td className="py-4 pr-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs capitalize ${getStatusStyles(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className={`py-4 pr-4 font-medium ${isOutcome ? 'text-[#FF3B30]' : 'text-[#34C759]'}`}>
                      {isOutcome ? '-' : '+'}${item.amount.toLocaleString()}
                    </td>

                    <td className="py-4 pr-4 text-gray-400 truncate max-w-[150px]">
                      {item.description || "N/A"}
                    </td>

                    <td className="py-4 pr-4 text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 text-right pr-3">
                      <button className="rounded-md bg-white/5 p-2 hover:bg-white/10">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
