"use client";

import { useState, useEffect } from "react";
import ReactCountryFlag from "react-country-flag";
import { X, ChevronDown, Check } from "lucide-react";
import { IoMdArrowDropdown } from "react-icons/io";
import api from "@/lib/api";
import { toast } from "react-hot-toast";


type TabType = "user" | "bank" | "crypto";

const tabs: { label: string; value: TabType }[] = [
  { label: "Send by user ID or Tag", value: "user" },
  { label: "Send to Chime", value: "bank" },
  { label: "Crypto", value: "crypto" },
];

const currencies = [
  { code: "USD", countryCode: "US" },
  { code: "EUR", countryCode: "EU" },
  { code: "GBP", countryCode: "GB" },
  { code: "PKR", countryCode: "PK" },
];

export default function SendMoneyForm({ onRefresh }: { onRefresh?: () => void }) {
  const [activeTab, setActiveTab] = useState<TabType>("user");
  const [mobileTabOpen, setMobileTabOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);

  const handleUserTransfer = async () => {
    if (!recipient || !amount) {
      toast.error("Please fill in recipient and amount");
      return;
    }
    setLoading(true);
    try {
      await api.post("/transactions/transfer", {
        recipientIdentifier: recipient,
        amount: parseFloat(amount),
        description
      });
      toast.success("Transfer successful!");
      // Reset form
      setRecipient("");
      setAmount("");
      setDescription("");
      onRefresh?.();
      window.dispatchEvent(new CustomEvent('refresh-balances'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  const activeTabLabel =
    tabs.find((t) => t.value === activeTab)?.label || "";

  return (
    <div className="bg-[#111827] border border-[#2B3343] rounded-xl w-full p-3 mx-auto">
      <div className="relative sm:hidden mb-6">
        <button
          onClick={() => setMobileTabOpen(!mobileTabOpen)}
          className="w-full bg-[#2B3343] border border-[#434B5C] px-4 py-3 rounded-xl flex items-center justify-between font-DMSans text-sm text-white"
        >
          <span>{activeTabLabel}</span>
          <ChevronDown
            size={18}
            className={`transition-transform ${mobileTabOpen ? "rotate-180" : ""
              }`}
          />
        </button>

        {mobileTabOpen && (
          <div className="absolute top-full left-0 w-full mt-2 bg-[#2B3343] border border-[#434B5C] rounded-xl overflow-hidden z-50">
            {tabs
              .filter((t) => t.value !== activeTab)
              .map((tab) => (
                <div
                  key={tab.value}
                  onClick={() => {
                    setActiveTab(tab.value);
                    setMobileTabOpen(false);
                  }}
                  className="px-4 py-3 text-sm font-DMSans text-gray-300 hover:bg-[#202736] cursor-pointer"
                >
                  {tab.label}
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="hidden sm:flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <TabButton
            key={tab.value}
            label={tab.label}
            active={activeTab === tab.value}
            onClick={() => setActiveTab(tab.value)}
          />
        ))}
      </div>

      {activeTab === "user" && (
        <UserForm
          recipient={recipient}
          setRecipient={setRecipient}
          amount={amount}
          setAmount={setAmount}
          description={description}
          setDescription={setDescription}
          loading={loading}
          onSubmit={handleUserTransfer}
          selectedCurrency={selectedCurrency}
          onCurrencyChange={setSelectedCurrency}
        />
      )}
      {activeTab === "bank" && (
        <BankForm
          onRefresh={onRefresh}
          selectedCurrency={selectedCurrency}
          onCurrencyChange={setSelectedCurrency}
          amount={amount}
          setAmount={setAmount}
        />
      )}
      {activeTab === "crypto" && <CryptoForm onRefresh={onRefresh} />}
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 font-DMSans cursor-pointer rounded-full text-sm font-medium transition
        ${active
          ? "bg-[#2B3343] text-white border border-[#434B5C]"
          : "text-gray-400 hover:text-white"
        }`}
    >
      {label}
    </button>
  );
}



function UserForm({
  recipient,
  setRecipient,
  amount,
  setAmount,
  description,
  setDescription,
  loading,
  onSubmit,
  ...props
}: any) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  useEffect(() => {
    // If the recipient text doesn't match the selected user's tag/identifier, clear selection
    if (selectedUser && recipient !== `@${selectedUser.tag || selectedUser.firstName.toLowerCase()}`) {
      setSelectedUser(null);
    }

    if (!recipient || recipient.length < 1) {
      setSuggestions([]);
      return;
    }

    // Don't search if a user is already selected (shows the tick)
    if (selectedUser && recipient === `@${selectedUser.tag || selectedUser.firstName.toLowerCase()}`) {
      setSuggestions([]);
      return;
    }

    // Don't search if it looks like an email or phone
    if (recipient.includes('@') && recipient.includes('.')) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      try {
        const query = recipient.startsWith('@') ? recipient.substring(1) : recipient;
        if (query.length < 1) {
          setSuggestions([]);
          return;
        }
        const res = await api.get(`/auth/search-users?query=${query}`);
        setSuggestions(res.data);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [recipient]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          placeholder="Enter user ID or Tag (e.g. @username)"
          value={recipient}
          onChange={(e: any) => setRecipient(e.target.value)}
        />
        {selectedUser && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[#82F764]">
            <Check size={18} strokeWidth={3} />
            <span className="text-[10px] font-bold uppercase">Selected</span>
          </div>
        )}
        {!selectedUser && searching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-[#82F764] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {(suggestions.length > 0 || (recipient.length > 0 && !searching && recipient !== '@' && !recipient.includes('.') && !selectedUser && suggestions.length === 0)) && (
          <div className="absolute top-full left-0 w-full mt-1 bg-[#202736] border border-[#2B3343] rounded-lg shadow-2xl z-50 overflow-hidden">
            {suggestions.length > 0 ? (
              suggestions.map((user) => (
                <div
                  key={user._id}
                  onClick={() => {
                    const identifier = `@${user.tag || user.firstName.toLowerCase()}`;
                    setRecipient(identifier);
                    setSelectedUser(user);
                    setSuggestions([]);
                  }}
                  className="flex items-center justify-between px-4 py-3 hover:bg-[#2B3343] cursor-pointer transition border-b border-white/5 last:border-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#82F764]/10 border border-[#82F764]/20 flex items-center justify-center text-[#82F764] font-bold text-xs uppercase">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        user.firstName[0]
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-white font-medium">{user.firstName} {user.lastName}</span>
                      <span className="text-[11px] text-[#82F764] font-medium opacity-80">@{user.tag}</span>
                    </div>
                  </div>
                  <Check size={16} className="text-gray-600 opacity-0 group-hover:opacity-100" />
                </div>
              ))
            ) : (
              <div className="px-4 py-4 text-center">
                <p className="text-xs text-gray-500 font-DMSans">No users found with this tag or name</p>
                <p className="text-[10px] text-gray-600 font-DMSans mt-1">Try typing a few letters (e.g. 'poor')</p>
              </div>
            )}
          </div>
        )}
      </div>
      <AmountInput
        value={amount}
        onChange={(e: any) => setAmount(e.target.value)}
        selectedCurrency={props.selectedCurrency}
        onCurrencyChange={props.onCurrencyChange}
      />
      <Input
        placeholder="Comments (Optional)"
        value={description}
        onChange={(e: any) => setDescription(e.target.value)}
      />
      <SubmitButton onClick={onSubmit} loading={loading} />
    </div>
  );
}

function BankForm({ onRefresh, selectedCurrency, onCurrencyChange, amount, setAmount }: any) {
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const fetchSavedCards = async () => {
    try {
      const res = await api.get("/wallet/payment-methods");
      const cards = res.data.filter((m: any) => m.type === "card");
      setSavedCards(cards);
      if (cards.length > 0) {
        setSelectedCardId(cards[0]._id);
      }
    } catch (error) {
      console.error("Failed to fetch cards", error);
    }
  };

  useState(() => {
    fetchSavedCards();
  });

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const handleSubmit = async () => {
    if (!amount) {
      toast.error("Please enter an amount");
      return;
    }

    const hasSavedCard = !!selectedCardId;
    const hasManualCardDetails =
      cardholderName.trim().length > 2 &&
      cardNumber.replace(/\s/g, "").length === 16 &&
      expiry.length === 5 &&
      cvc.length >= 3;

    if (!hasSavedCard && !hasManualCardDetails) {
      toast.error("Enter Chime card details");
      return;
    }

    setLoading(true);
    try {
      await api.post("/transactions/withdraw", {
        amount: parseFloat(amount),
        paymentMethodId: selectedCardId || undefined,
        description: `Send to Chime${description ? `: ${description}` : ""}`,
        currency: selectedCurrency.code
      });
      toast.success("Chime transfer successful!");
      // Reset
      setCardholderName("");
      setCardNumber("");
      setExpiry("");
      setCvc("");
      setAmount("");
      setDescription("");
      onRefresh?.();
      window.dispatchEvent(new CustomEvent('refresh-balances'));
    } catch (error: any) {
      console.error("Withdrawal Error Response:", error.response?.data);
      toast.error(error.response?.data?.message || "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {savedCards.length > 0 ? (
        <div className="space-y-3">
          <label className="text-xs font-DMSans text-gray-400 px-1">Choose saved card:</label>
          <div className="space-y-2">
            {savedCards.map((card) => (
              <div
                key={card._id}
                onClick={() => setSelectedCardId(card._id)}
                className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${selectedCardId === card._id ? 'bg-[#202736] border-[#82F764]' : 'bg-[#111827] border-[#2B3343] hover:border-gray-600'
                  }`}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-DMSans font-medium text-white capitalize">{card.provider || "Card"}</span>
                  <span className="text-[10px] text-gray-500 uppercase">Ending in {card.details || "****"}</span>
                </div>
                {selectedCardId === card._id && <div className="w-2 h-2 rounded-full bg-[#82F764]" />}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-DMSans text-white px-1">Enter Chime card details</h3>
          <Input placeholder="Name on card" value={cardholderName} onChange={(e: any) => setCardholderName(e.target.value)} />
          <Input placeholder="Card number" value={cardNumber} onChange={(e: any) => setCardNumber(formatCardNumber(e.target.value))} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="MM/YY" value={expiry} onChange={(e: any) => setExpiry(formatExpiry(e.target.value))} />
            <Input placeholder="CVC" value={cvc} onChange={(e: any) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} />
          </div>
        </div>
      )}

      <AmountInput
        value={amount}
        onChange={(e: any) => setAmount(e.target.value)}
        selectedCurrency={selectedCurrency}
        onCurrencyChange={onCurrencyChange}
      />
      <Input placeholder="Comments (Optional)" value={description} onChange={(e: any) => setDescription(e.target.value)} />
      <SubmitButton onClick={handleSubmit} loading={loading} />
    </div>
  );
}

function CryptoForm({ onRefresh }: { onRefresh?: () => void }) {
  const [address, setAddress] = useState("");
  const [ticker, setTicker] = useState("ETH");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNative, setIsNative] = useState(false);

  const handleSubmit = async () => {
    if (!address || !amount) {
      toast.error("Please fill in address and amount");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/transactions/send-crypto", {
        toAddress: address,
        amount: parseFloat(amount),
        ticker: ticker.toUpperCase(),
        isNative: isNative
      });

      const txHash = res.data.txHash;
      if (txHash && !txHash.startsWith('simulated')) {
        toast.success(
          (t) => (
            <span>
              {ticker} withdrawal successful!{" "}
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-bold"
              >
                View on Etherscan
              </a>
            </span>
          ),
          { duration: 6000 }
        );
      } else {
        toast.success(`${ticker} withdrawal successful! (Simulated)`);
      }

      setAddress("");
      setAmount("");
      setDescription("");
      onRefresh?.();
      window.dispatchEvent(new CustomEvent('refresh-balances'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input placeholder="Wallet address" value={address} onChange={(e) => setAddress(e.target.value)} />
      <div className="flex gap-2">
        {['ETH', 'BTC', 'USDC', 'USDT'].map((t) => (
          <button
            key={t}
            onClick={() => {
              setTicker(t);
              // if switching ticker, maybe reset native mode if it's USDC/USDT for simplicity?
              // but let's keep it.
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-DMSans transition ${ticker === t ? 'bg-[#82F764] text-black' : 'bg-[#202736] text-gray-400'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Native / USD Toggle */}
      <div className="flex items-center justify-between px-1">
        <label className="text-xs font-DMSans text-gray-400">Send by:</label>
        <div className="flex bg-[#202736] p-1 rounded-lg">
          <button
            onClick={() => setIsNative(false)}
            className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold transition ${!isNative ? 'bg-[#2B3343] text-white' : 'text-gray-500'}`}
          >
            USD
          </button>
          <button
            onClick={() => setIsNative(true)}
            className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold transition ${isNative ? 'bg-[#2B3343] text-white' : 'text-gray-500'}`}
          >
            {ticker}
          </button>
        </div>
      </div>

      <AmountInput
        value={amount}
        onChange={(e: any) => setAmount(e.target.value)}
        selectedCurrency={isNative ? { code: ticker, countryCode: '' } : undefined}
      />
      <Input placeholder="Comments (Optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
      <SubmitButton onClick={handleSubmit} loading={loading} />
    </div>
  );
}

function AmountInput({ value, onChange, selectedCurrency, onCurrencyChange }: any) {
  const [open, setOpen] = useState(false);
  // Remove local state: const [selected, setSelected] = useState(currencies[0]);
  const selected = selectedCurrency || currencies[0];

  return (
    <div className="relative">
      <input
        placeholder="Amount"
        value={value}
        onChange={onChange}
        className="w-full bg-[#202736] font-DMSans text-white placeholder-gray-500 px-4 py-3 pr-32 rounded-lg outline-none"
      />

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="absolute top-1/2 right-2 font-DMSans -translate-y-1/2 flex items-center gap-2 bg-[#2B3343] px-3 py-2 rounded-lg text-xs text-white border border-gray-700"
      >
        {selected.countryCode && (
          <ReactCountryFlag
            svg
            countryCode={selected.countryCode}
            style={{ width: "1.25em", height: "1.25em" }}
          />
        )}
        <span>{selected.code}</span>
        <IoMdArrowDropdown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-2 top-full mt-2 bg-[#1f2937] border border-gray-700 rounded-lg w-36 z-50">
          {currencies.map((cur) => (
            <div
              key={cur.code}
              onClick={() => {
                if (onCurrencyChange) onCurrencyChange(cur);
                setOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 font-DMSans text-sm text-white hover:bg-[#111827] cursor-pointer"
            >
              <ReactCountryFlag
                svg
                countryCode={cur.countryCode}
                style={{ width: "1.25em", height: "1.25em" }}
              />
              <span>{cur.code}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Input({ placeholder, value, onChange }: { placeholder: string; value?: string; onChange?: (e: any) => void }) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full bg-[#202736] font-DMSans text-white placeholder-gray-500 px-4 py-3 rounded-lg outline-none"
    />
  );
}

function SubmitButton({ onClick, loading }: { onClick?: () => void; loading?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`bg-[#82F764] w-full text-sm font-DMSans cursor-pointer text-black px-6 py-3 rounded-xl transition ${loading ? 'opacity-50' : ''}`}
    >
      {loading ? "Processing..." : "Continue"}
    </button>
  );
}
