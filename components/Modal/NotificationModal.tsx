import { useState, useEffect } from "react";
import { HiCheckCircle, HiArrowSmDown } from "react-icons/hi";
import { FiArrowDown, FiLock } from "react-icons/fi";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

export default function NotificationModal() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/transactions/history");
        setTransactions(res.data);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'transfer':
        return <HiArrowSmDown size={18} className="text-blue-500 rotate-45" />;
      case 'deposit':
      case 'deposit_from_card':
        return <HiCheckCircle size={18} className="text-green-500" />;
      default:
        return <FiArrowDown size={18} className="text-green-400" />;
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(tx => tx.createdAt.startsWith(today));
  const previousTransactions = transactions.filter(tx => !tx.createdAt.startsWith(today));

  if (loading) return (
    <div className="absolute md:right-20 right-3 top-12 mt-4 md:w-100 w-90 rounded-2xl bg-[#0B1220] border border-[#2B3343] shadow-2xl p-4 z-50 text-gray-400">
      Loading...
    </div>
  );

  return (
    <div
      className="
      absolute md:right-20 right-3 top-12 mt-4 md:w-100 w-90
      rounded-2xl bg-[#0B1220]
      border border-[#2B3343]
      shadow-2xl p-4 z-50
      max-h-120 overflow-y-auto
      "
    >
      <h2 className="text-white text-md font-DMSans mb-3">Notifications</h2>

      {transactions.length === 0 ? (
        <p className="text-xs text-gray-400 font-DMSans">No recent activity found.</p>
      ) : (
        <>
          {todayTransactions.length > 0 && (
            <>
              <p className="text-xs text-gray-400 font-DMSans mb-2">Today</p>
              <div className="space-y-2 mb-4">
                {todayTransactions.map(tx => (
                  <NotificationRow
                    key={tx._id}
                    icon={getIcon(tx.type)}
                    title={tx.type.charAt(0).toUpperCase() + tx.type.slice(1).replace(/_/g, ' ')}
                    desc={tx.description || `Transaction of $${tx.amount}`}
                    time={formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                  />
                ))}
              </div>
            </>
          )}

          {previousTransactions.length > 0 && (
            <>
              <p className="text-xs text-gray-400 font-DMSans mb-2">Earlier</p>
              <div className="space-y-2">
                {previousTransactions.map(tx => (
                  <NotificationRow
                    key={tx._id}
                    icon={getIcon(tx.type)}
                    title={tx.type.charAt(0).toUpperCase() + tx.type.slice(1).replace(/_/g, ' ')}
                    desc={tx.description || `Transaction of $${tx.amount}`}
                    time={formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function NotificationRow({
  icon,
  title,
  desc,
  time,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  time: string;
}) {
  return (
    <div
      className="
      flex items-center justify-between
      rounded-xl bg-[#202736]
      px-2 py-3
      transition
      "
    >
      <div className="flex gap-3 overflow-hidden">
        {/* Icon Box */}
        <div className="h-9 w-9 min-w-9 rounded-full bg-[#2B3343] flex items-center justify-center">
          {icon}
        </div>

        {/* Text */}
        <div className="overflow-hidden">
          <p className="text-xs mb-1 text-white font-DMSans truncate">{title}</p>
          <p className="text-xs text-gray-400 font-DMSans truncate">
            {desc}
          </p>
        </div>
      </div>

      <span className="text-[10px] text-white font-DMSans whitespace-nowrap ml-2">{time}</span>
    </div>
  );
}
