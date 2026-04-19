import { useState, useEffect } from "react";
import { HiCheckCircle, HiArrowSmDown } from "react-icons/hi";
import { FiArrowDown, FiLock } from "react-icons/fi";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

type FeedItemKind = "transaction" | "notification";

interface FeedItem {
  _id: string;
  createdAt: string;
  title: string;
  desc: string;
  kind: FeedItemKind;
  type: string;
}

interface TransactionItem {
  _id: string;
  type: string;
  amount?: number;
  description?: string;
  createdAt: string;
}

interface AdminNotificationItem {
  _id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "security" | "success";
  createdAt: string;
}

export default function NotificationModal() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [transactionsRes, notificationsRes] = await Promise.allSettled([
          api.get("/transactions/history"),
          api.get("/transactions/notifications", { params: { limit: 20 } }),
        ]);

        const transactions: TransactionItem[] =
          transactionsRes.status === "fulfilled" && Array.isArray(transactionsRes.value.data)
            ? transactionsRes.value.data
            : [];

        const notifications: AdminNotificationItem[] =
          notificationsRes.status === "fulfilled" && Array.isArray(notificationsRes.value.data)
            ? notificationsRes.value.data
            : [];

        const transactionFeed: FeedItem[] = transactions.map((tx) => ({
          _id: `tx-${tx._id}`,
          createdAt: tx.createdAt,
          kind: "transaction",
          type: tx.type,
          title: tx.type.charAt(0).toUpperCase() + tx.type.slice(1).replace(/_/g, " "),
          desc: tx.description || `Transaction of $${tx.amount ?? 0}`,
        }));

        const notificationFeed: FeedItem[] = notifications.map((notification) => ({
          _id: `notif-${notification._id}`,
          createdAt: notification.createdAt,
          kind: "notification",
          type: notification.type,
          title: notification.title,
          desc: notification.message,
        }));

        const mergedFeed = [...notificationFeed, ...transactionFeed].sort(
          (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
        );

        setItems(mergedFeed);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

    const intervalId = setInterval(fetchHistory, 15000);
    return () => clearInterval(intervalId);
  }, []);

  const getIcon = (kind: FeedItemKind, type: string) => {
    if (kind === "notification") {
      switch (type) {
        case "success":
          return <HiCheckCircle size={18} className="text-green-500" />;
        case "security":
          return <FiLock size={18} className="text-red-400" />;
        case "warning":
          return <FiArrowDown size={18} className="text-yellow-400" />;
        default:
          return <HiArrowSmDown size={18} className="text-blue-500 rotate-45" />;
      }
    }

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
  const todayItems = items.filter((entry) => entry.createdAt.startsWith(today));
  const previousItems = items.filter((entry) => !entry.createdAt.startsWith(today));

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

      {items.length === 0 ? (
        <p className="text-xs text-gray-400 font-DMSans">No recent activity found.</p>
      ) : (
        <>
          {todayItems.length > 0 && (
            <>
              <p className="text-xs text-gray-400 font-DMSans mb-2">Today</p>
              <div className="space-y-2 mb-4">
                {todayItems.map((entry) => (
                  <NotificationRow
                    key={entry._id}
                    icon={getIcon(entry.kind, entry.type)}
                    title={entry.title}
                    desc={entry.desc}
                    time={formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                  />
                ))}
              </div>
            </>
          )}

          {previousItems.length > 0 && (
            <>
              <p className="text-xs text-gray-400 font-DMSans mb-2">Earlier</p>
              <div className="space-y-2">
                {previousItems.map((entry) => (
                  <NotificationRow
                    key={entry._id}
                    icon={getIcon(entry.kind, entry.type)}
                    title={entry.title}
                    desc={entry.desc}
                    time={formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
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
