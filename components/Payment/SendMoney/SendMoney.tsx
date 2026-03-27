import BalanceCard from "./BalanceCard";
import RecentTransactions from "./RecentTransactions";
import SavedContacts from "./SavedContacts";
import SendMoneyForm from "./SendMoneyForm";

export default function SendMoney({ balance, loading, onRefresh, refreshCount }: { balance: number, loading: boolean, onRefresh?: () => void, refreshCount: number }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left Section */}
      <div className="lg:col-span-2 space-y-4">
        <BalanceCard balance={balance} loading={loading} />

        <SendMoneyForm onRefresh={onRefresh} />

        <RecentTransactions key={refreshCount} />
      </div>

      {/* Right Section */}
      <SavedContacts />
    </div>
  );
}
