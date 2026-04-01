import { useEffect, useState } from "react";
import Image from "next/image";
import { Copy } from "lucide-react";
import Bitimg from "../../../public/assets/bit.png";
import Ethimg from "../../../public/assets/eth.png";
import Timg from "../../../public/assets/t.png";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { useConnectCryptoWallet } from "@/lib/reown/useConnectCryptoWallet";

const CHING_APP_LOGIN_URL = "https://chingapp.club/login.php";

export default function DepositCrypto() {
  const [cryptoList, setCryptoList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isMetaConnected, setIsMetaConnected] = useState(false);
  const [isBtcConnected, setIsBtcConnected] = useState(false);
  const [showBtcInput, setShowBtcInput] = useState(false);
  const [btcAddressInput, setBtcAddressInput] = useState("");
  const [linking, setLinking] = useState(false);
  const { connectAndLinkWallet, isLinking } = useConnectCryptoWallet();

  const fetchAddresses = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await api.get("/transactions/deposit-addresses");
      // Handle the new response format
      const addresses = response.data.addresses || response.data;
      const metaConnected = response.data.isMetaConnected !== undefined ? response.data.isMetaConnected : false;
      const btcConnected = response.data.isBtcConnected !== undefined ? response.data.isBtcConnected : false;

      setIsMetaConnected(metaConnected);
      setIsBtcConnected(btcConnected);

      // Map icons to the response
      const dataWithIcons = addresses.map((item: any) => ({
        ...item,
        icon: item.ticker === 'BTC' ? Bitimg : item.ticker === 'ETH' ? Ethimg : Timg
      }));
      setCryptoList(dataWithIcons);
    } catch (error) {
      console.error("Failed to fetch deposit addresses:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkBtc = async () => {
    if (!btcAddressInput.trim()) {
      toast.error("Please enter a valid BTC address");
      return;
    }

    setLinking(true);
    try {
      await api.post("/wallet/payment-methods", {
        type: "crypto_wallet",
        provider: "Bitcoin",
        details: btcAddressInput.trim(),
      });

      toast.success("Bitcoin address linked!");
      setShowBtcInput(false);
      setBtcAddressInput("");
      fetchAddresses();
    } catch (error: any) {
      console.error(error);
      toast.error("Linking failed");
    } finally {
      setLinking(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connectAndLinkWallet();
      fetchAddresses(); // Refresh addresses
    } catch (error: any) {
      console.error(error);
    }
  };

  const handleGetAddress = () => {
    const opened = window.open(CHING_APP_LOGIN_URL, "_blank", "noopener,noreferrer");
    if (!opened) {
      window.location.assign(CHING_APP_LOGIN_URL);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex justify-center">
      <div className="w-full rounded-2xl bg-[#111827] border border-[#2B3343] p-4 shadow-lg">
        {/* Title & Status */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-DMSans md:text-xl text-white">
              Crypto deposit
            </h2>
            <div className="flex gap-2">
              {!isMetaConnected && (
                <button
                  onClick={handleConnectWallet}
                  disabled={isLinking}
                  className="text-[10px] bg-[#3B82F6] hover:bg-[#2563EB] text-white px-3 py-1.5 rounded-full font-bold uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                >
                  {isLinking ? "Connecting..." : "Connect Wallet"}
                </button>
              )}
              {!isBtcConnected && (
                <button
                  onClick={() => setShowBtcInput(!showBtcInput)}
                  className="text-[10px] bg-[#F7931A] hover:bg-[#E38114] text-white px-3 py-1.5 rounded-full font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  {showBtcInput ? "Cancel" : "Link Bitcoin"}
                </button>
              )}
            </div>
          </div>

          {/* Inline BTC Input */}
          {showBtcInput && (
            <div className="bg-[#2B3343] p-2 rounded-xl border border-white/10 animate-in fade-in slide-in-from-top-2 space-y-2">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Enter your BTC address (bc1q...)"
                  value={btcAddressInput}
                  onChange={(e) => setBtcAddressInput(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-xs font-DMSans text-white px-2 h-8"
                />
                <button
                  onClick={handleGetAddress}
                  className="bg-[#3B82F6] text-white text-[10px] font-bold px-3 py-2 rounded-lg hover:bg-[#2563EB] transition"
                >
                  Get Address
                </button>
                <button
                  onClick={handleLinkBtc}
                  disabled={linking}
                  className="bg-[#82F764] text-black text-[10px] font-bold px-4 py-2 rounded-lg hover:bg-[#6ed952] transition disabled:opacity-50"
                >
                  {linking ? "Linking..." : "Save"}
                </button>
              </div>

              <p className="text-[11px] font-DMSans text-gray-300 px-2">
                Login to ChingApp to get your Bitcoin wallet address, then copy and paste it here.
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {isMetaConnected && (
              <span className="text-[9px] bg-[#3B82F6]/10 text-[#3B82F6] px-2 py-1 rounded-full border border-[#3B82F6]/20 font-bold uppercase">
                ETH Connected
              </span>
            )}
            {isBtcConnected && (
              <span className="text-[9px] bg-[#F7931A]/10 text-[#F7931A] px-2 py-1 rounded-full border border-[#F7931A]/20 font-bold uppercase">
                BTC Linked
              </span>
            )}
          </div>
        </div>

        {/* Crypto List */}
        <div className="rounded-xl bg-[#1f2937] overflow-hidden">
          {loading ? (
            <p className="text-center text-gray-400 py-10 font-DMSans">Loading addresses...</p>
          ) : error ? (
            <div className="text-center py-8 px-4">
              <p className="text-sm text-gray-400 font-DMSans mb-4">Failed to load deposit addresses.</p>
              <button
                onClick={fetchAddresses}
                className="bg-[#82F764] text-black text-xs font-bold px-4 py-2 rounded-full cursor-pointer hover:bg-[#6ed952] transition"
              >
                Retry
              </button>
            </div>
          ) : (
            cryptoList.map((item, index) => (
              <div key={index} className="px-4 py-4 border-b border-white/5 last:border-none">
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center rounded-full">
                      <Image
                        src={item.icon}
                        alt={item.name}
                        width={24}
                        height={24}
                      />
                    </div>
                    <p className="text-sm font-DMSans text-[#7A869C]">
                      {item.name}
                    </p>
                  </div>
                  {item.isDynamic && (
                    <span className="text-[9px] text-[#82F764] font-medium font-DMSans">
                      Linked Address
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  {item.address ? (
                    <>
                      <p className="text-sm font-DMSans md:text-base text-white font-medium break-all pr-4">
                        {item.address}
                      </p>

                      <button
                        onClick={() => copyToClipboard(item.address)}
                        className="text-white font-DMSans cursor-pointer hover:text-[#82F764] transition"
                      >
                        <Copy size={18} />
                      </button>
                    </>
                  ) : (
                    <p className="text-sm font-DMSans text-gray-500 italic">
                      No address linked. Use {item.ticker === "BTC" ? "Link Bitcoin" : "Connect Wallet"} to add one.
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
