interface Props {
  activeTab: "send" | "receive";
  setActiveTab: (tab: "send" | "receive") => void;
}

export default function PaymentTabs({ activeTab, setActiveTab }: Props) {
  return (
    <div>
      <div className="inline-flex gap-6 border-b border-[#353B40]">
        <button
          onClick={() => setActiveTab("send")}
          className={`pb-2 text-sm  transition font-DMSans border-b-3 ${
            activeTab === "send"
              ? "border-[#82F764] text-[#FFFFFF]"
              : "border-transparent text-[#828A92]"
          }`}
        >
          Send money
        </button>

        <button
          onClick={() => setActiveTab("receive")}
          className={`pb-2 text-sm font-medium font-DMSans transition border-b-3 ${
            activeTab === "receive"
              ? "border-[#82F764] text-[#FFFFFF]"
              : "border-transparent text-[#828A92]"
          }`}
        >
          Receive money
        </button>
      </div>
    </div>
  );
}
