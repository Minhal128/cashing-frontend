"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import api from "@/lib/api";

type AssetTicker = "BTC" | "ETH" | "USDT";

type WalletMethod = {
  _id: string;
  type: string;
  provider?: string;
  details: string;
};

type AssetSummary = {
  ticker: AssetTicker;
  address: string | null;
  linked: boolean;
  balance: number;
  balanceFormatted: string;
  usdRate: number;
  usdRateFormatted: string;
  usdValue: number;
  usdValueFormatted: string;
  source: string;
};

type SummaryResponse = {
  assets: AssetSummary[];
  fetchedAt: string;
};

type SummaryErrorResponse = {
  message?: string;
};

const INITIAL_ASSETS: AssetSummary[] = [
  {
    ticker: "BTC",
    address: null,
    linked: false,
    balance: 0,
    balanceFormatted: "0.00000000 BTC",
    usdRate: 0,
    usdRateFormatted: "$0.00",
    usdValue: 0,
    usdValueFormatted: "$0.00",
    source: "not-linked",
  },
  {
    ticker: "ETH",
    address: null,
    linked: false,
    balance: 0,
    balanceFormatted: "0.00000000 ETH",
    usdRate: 0,
    usdRateFormatted: "$0.00",
    usdValue: 0,
    usdValueFormatted: "$0.00",
    source: "not-linked",
  },
  {
    ticker: "USDT",
    address: null,
    linked: false,
    balance: 0,
    balanceFormatted: "0.000000 USDT",
    usdRate: 0,
    usdRateFormatted: "$0.00",
    usdValue: 0,
    usdValueFormatted: "$0.00",
    source: "not-linked",
  },
];

const truncateAddress = (address: string | null) => {
  if (!address) return "Not linked";
  if (address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
};

const isBitcoinProvider = (provider?: string) =>
  provider?.toLowerCase() === "bitcoin";

export default function CryptoWalletOverview() {
  const [assets, setAssets] = useState<AssetSummary[]>(INITIAL_ASSETS);
  const [selectedTicker, setSelectedTicker] = useState<AssetTicker>("BTC");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [fetchedAt, setFetchedAt] = useState<string>("");

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const methodsResponse = await api.get("/wallet/payment-methods");
      const methods = methodsResponse.data as WalletMethod[];
      const cryptoMethods = methods.filter((method) => method.type === "crypto_wallet");

      const btcMethod = cryptoMethods.find((method) =>
        isBitcoinProvider(method.provider)
      );

      const evmMethod = cryptoMethods.find(
        (method) => !isBitcoinProvider(method.provider)
      );

      const params = new URLSearchParams();
      if (btcMethod?.details) {
        params.set("btcAddress", btcMethod.details.trim());
      }
      if (evmMethod?.details) {
        params.set("evmAddress", evmMethod.details.trim());
      }

      const summaryResponse = await fetch(
        `/api/crypto-wallet-summary?${params.toString()}`,
        { cache: "no-store" }
      );
      const summaryPayload = (await summaryResponse.json()) as
        | SummaryResponse
        | SummaryErrorResponse;

      if (!summaryResponse.ok) {
        const errorPayload = summaryPayload as SummaryErrorResponse;
        throw new Error(errorPayload.message || "Failed to load crypto summary");
      }

      const payloadAssets = (summaryPayload as SummaryResponse).assets || [];
      const mergedAssets = INITIAL_ASSETS.map(
        (fallbackAsset) =>
          payloadAssets.find((asset) => asset.ticker === fallbackAsset.ticker) ||
          fallbackAsset
      );

      setAssets(mergedAssets);
      setFetchedAt((summaryPayload as SummaryResponse).fetchedAt || "");
    } catch (caughtError: unknown) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to load crypto summary";
      setError(message);
      setAssets(INITIAL_ASSETS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();

    const handleWalletUpdate = () => {
      fetchSummary();
    };

    window.addEventListener("crypto-wallets-updated", handleWalletUpdate);

    return () => {
      window.removeEventListener("crypto-wallets-updated", handleWalletUpdate);
    };
  }, [fetchSummary]);

  const selectedAsset = useMemo(() => {
    return assets.find((asset) => asset.ticker === selectedTicker) || assets[0];
  }, [assets, selectedTicker]);

  return (
    <div className="w-full rounded-2xl bg-[#111827] border border-[#2B3343] px-4 py-4 text-white shadow-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-DMSans text-lg">Crypto Wallet Overview</h2>
          <p className="text-xs text-[#7A869C]">
            Price + live wallet balance by asset
          </p>
        </div>

        <button
          onClick={fetchSummary}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-full bg-[#2B3343] px-3 py-2 text-xs font-DMSans hover:bg-[#3b4455] disabled:opacity-50"
        >
          <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
          {isLoading ? "Refreshing" : "Refresh"}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#202736] border border-[#394150] px-3 py-3">
          <p className="text-xs text-[#7A869C] mb-1">Asset</p>
          <select
            value={selectedTicker}
            onChange={(event) => setSelectedTicker(event.target.value as AssetTicker)}
            className="w-full rounded-lg bg-[#2B3343] px-3 py-2 text-sm font-DMSans outline-none"
          >
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
            <option value="USDT">USDT</option>
          </select>
        </div>

        <div className="rounded-xl bg-[#202736] border border-[#394150] px-3 py-3">
          <p className="text-xs text-[#7A869C] mb-1">Linked wallet</p>
          <p className="text-sm font-DMSans text-white">{truncateAddress(selectedAsset?.address || null)}</p>
          <p className="mt-1 text-[11px] text-[#7A869C]">Source: {selectedAsset?.source || "unknown"}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl bg-[#202736] border border-[#394150] px-3 py-3">
          <p className="text-xs text-[#7A869C]">Wallet Balance</p>
          <p className="text-sm font-semibold mt-1">{selectedAsset?.balanceFormatted || "0.00"}</p>
        </div>
        <div className="rounded-xl bg-[#202736] border border-[#394150] px-3 py-3">
          <p className="text-xs text-[#7A869C]">Current Price</p>
          <p className="text-sm font-semibold mt-1">{selectedAsset?.usdRateFormatted || "$0.00"}</p>
        </div>
        <div className="rounded-xl bg-[#202736] border border-[#394150] px-3 py-3">
          <p className="text-xs text-[#7A869C]">Estimated Value</p>
          <p className="text-sm font-semibold mt-1">{selectedAsset?.usdValueFormatted || "$0.00"}</p>
        </div>
      </div>

      {error && <p className="mt-3 text-xs text-[#ff8b8b]">{error}</p>}

      {fetchedAt && (
        <p className="mt-3 text-[11px] text-[#7A869C]">
          Updated {new Date(fetchedAt).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
