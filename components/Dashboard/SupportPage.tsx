"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, Clock3, LifeBuoy, MessageSquare, Send } from "lucide-react";
import api from "@/lib/api";

type TicketStatus = "open" | "in_progress" | "closed";
type TicketPriority = "low" | "medium" | "high" | "urgent";

interface TicketMessage {
  authorType: "user" | "admin";
  authorId?: string;
  message: string;
  createdAt: string;
}

interface SupportTicket {
  _id: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  messages: TicketMessage[];
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

const categories = ["general", "payment", "wallet", "security", "account", "other"] as const;
const priorities: TicketPriority[] = ["low", "medium", "high", "urgent"];

const toTicketList = (payload: unknown): SupportTicket[] => {
  if (Array.isArray(payload)) return payload as SupportTicket[];

  if (payload && typeof payload === "object") {
    const record = payload as ApiEnvelope<SupportTicket[]>;
    if (Array.isArray(record.data)) return record.data;
  }

  return [];
};

const toTicket = (payload: unknown): SupportTicket | null => {
  if (payload && typeof payload === "object") {
    const record = payload as ApiEnvelope<SupportTicket>;
    if (record.data && typeof record.data === "object") return record.data;
  }

  return null;
};

const statusClassMap: Record<TicketStatus, string> = {
  open: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  in_progress: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  closed: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

export default function SupportPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("general");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [replyMessage, setReplyMessage] = useState("");

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket._id === selectedTicketId) || null,
    [selectedTicketId, tickets]
  );

  const fetchTickets = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true);

    try {
      const response = await api.get("/tickets", { params: { limit: 50 } });
      const nextTickets = toTicketList(response.data);
      setTickets(nextTickets);

      setSelectedTicketId((current) => {
        if (current && nextTickets.some((ticket) => ticket._id === current)) return current;
        return nextTickets[0]?._id || null;
      });
    } catch (error: any) {
      const apiMessage = error?.response?.data?.error || error?.response?.data?.message;
      toast.error(apiMessage || "Failed to load support tickets");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTickets(true);
  }, [fetchTickets]);

  const handleCreateTicket = useCallback(async () => {
    const nextSubject = subject.trim();
    const nextMessage = message.trim();

    if (!nextSubject || !nextMessage) {
      toast.error("Subject and message are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/tickets", {
        subject: nextSubject,
        message: nextMessage,
        category,
        priority,
      });

      const createdTicket = toTicket(response.data);
      if (createdTicket) {
        setTickets((current) => [createdTicket, ...current.filter((item) => item._id !== createdTicket._id)]);
        setSelectedTicketId(createdTicket._id);
      }

      setSubject("");
      setMessage("");
      setCategory("general");
      setPriority("medium");
      toast.success("Support ticket created");
      void fetchTickets(false);
    } catch (error: any) {
      const apiMessage = error?.response?.data?.error || error?.response?.data?.message;
      toast.error(apiMessage || "Failed to create support ticket");
    } finally {
      setIsSubmitting(false);
    }
  }, [category, fetchTickets, message, priority, subject]);

  const handleReply = useCallback(async () => {
    if (!selectedTicket) {
      toast.error("Select a ticket first");
      return;
    }

    const nextReply = replyMessage.trim();
    if (!nextReply) {
      toast.error("Reply message cannot be empty");
      return;
    }

    setIsReplying(true);
    try {
      const response = await api.post(`/tickets/${selectedTicket._id}/reply`, {
        message: nextReply,
      });

      const updatedTicket = toTicket(response.data);
      if (updatedTicket) {
        setTickets((current) =>
          current.map((ticket) => (ticket._id === updatedTicket._id ? updatedTicket : ticket))
        );
      }

      setReplyMessage("");
      toast.success("Reply sent to support");
      void fetchTickets(false);
    } catch (error: any) {
      const apiMessage = error?.response?.data?.error || error?.response?.data?.message;
      toast.error(apiMessage || "Failed to send reply");
    } finally {
      setIsReplying(false);
    }
  }, [fetchTickets, replyMessage, selectedTicket]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-DMSans text-white">Support</h1>
        <p className="text-sm font-DMSans text-[#7A869C]">
          Create tickets and chat with admin support in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
          <div className="flex items-center gap-2 text-white">
            <LifeBuoy className="h-4 w-4 text-[#78FD5E]" />
            <h2 className="font-DMSans text-base">Open New Ticket</h2>
          </div>

          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Subject"
            className="w-full rounded-xl border border-white/10 bg-[#0D1629] px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#78FD5E]/40"
          />

          <div className="grid grid-cols-2 gap-2">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as (typeof categories)[number])}
              className="rounded-xl border border-white/10 bg-[#0D1629] px-3 py-2 text-sm text-white focus:outline-none"
            >
              {categories.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>

            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as TicketPriority)}
              className="rounded-xl border border-white/10 bg-[#0D1629] px-3 py-2 text-sm text-white focus:outline-none"
            >
              {priorities.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={5}
            placeholder="Describe your issue"
            className="w-full rounded-xl border border-white/10 bg-[#0D1629] px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#78FD5E]/40"
          />

          <button
            onClick={() => void handleCreateTicket()}
            disabled={isSubmitting}
            className="w-full rounded-xl bg-[#78FD5E] text-black font-semibold py-2.5 disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Create Ticket"}
          </button>

          <div className="pt-2 border-t border-white/10">
            <p className="text-xs text-gray-400 mb-2">My Tickets</p>
            <div className="max-h-[280px] overflow-auto space-y-2 pr-1">
              {isLoading ? (
                <p className="text-sm text-gray-400">Loading tickets...</p>
              ) : tickets.length === 0 ? (
                <p className="text-sm text-gray-400">No tickets yet</p>
              ) : (
                tickets.map((ticket) => (
                  <button
                    key={ticket._id}
                    onClick={() => setSelectedTicketId(ticket._id)}
                    className={`w-full text-left rounded-xl border px-3 py-2 transition ${
                      selectedTicketId === ticket._id
                        ? "border-[#78FD5E]/40 bg-[#78FD5E]/10"
                        : "border-white/10 bg-[#0D1629]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-white truncate">{ticket.subject}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusClassMap[ticket.status]}`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{new Date(ticket.lastMessageAt).toLocaleString()}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          {!selectedTicket ? (
            <div className="h-full min-h-[420px] flex items-center justify-center text-gray-400 text-sm">
              Select a ticket to view the conversation.
            </div>
          ) : (
            <div className="flex flex-col h-full min-h-[420px]">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <div>
                  <h3 className="text-white font-semibold">{selectedTicket.subject}</h3>
                  <p className="text-xs text-gray-400">
                    {selectedTicket.category} • {selectedTicket.priority} priority
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full border ${statusClassMap[selectedTicket.status]}`}>
                    {selectedTicket.status.replace("_", " ")}
                  </span>
                  {selectedTicket.status === "closed" ? (
                    <CheckCircle2 className="h-4 w-4 text-slate-300" />
                  ) : (
                    <Clock3 className="h-4 w-4 text-yellow-400" />
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-auto space-y-3 pr-1">
                {selectedTicket.messages.map((entry, index) => (
                  <div
                    key={`${entry.createdAt}-${index}`}
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm border ${
                      entry.authorType === "user"
                        ? "ml-auto bg-[#78FD5E]/15 border-[#78FD5E]/20 text-[#D7FFD1]"
                        : "bg-[#1A2335] border-white/10 text-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className="text-[11px] uppercase tracking-wide opacity-80">
                        {entry.authorType === "user" ? "You" : "Admin Support"}
                      </span>
                      <span className="text-[11px] opacity-70">{new Date(entry.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="whitespace-pre-wrap break-words">{entry.message}</p>
                  </div>
                ))}
              </div>

              <div className="pt-3 mt-3 border-t border-white/10">
                <div className="flex gap-2">
                  <textarea
                    value={replyMessage}
                    onChange={(event) => setReplyMessage(event.target.value)}
                    rows={2}
                    placeholder="Write a reply..."
                    className="flex-1 rounded-xl border border-white/10 bg-[#0D1629] px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none"
                  />
                  <button
                    onClick={() => void handleReply()}
                    disabled={isReplying}
                    className="h-fit rounded-xl bg-[#78FD5E] px-4 py-2.5 text-black font-semibold disabled:opacity-60 inline-flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {isReplying ? "Sending" : "Send"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 inline-flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Replies are routed directly to admin support.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
