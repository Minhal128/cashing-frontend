import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BTC_ADDRESS_REGEX = /^(bc1|tb1|bcrt1)[ac-hj-np-z02-9]{11,71}$|^(1|3|m|n|2)[a-km-zA-HJ-NP-Z1-9]{25,39}$/i;

type BlockstreamAddressResponse = {
  chain_stats?: {
    funded_txo_sum?: number;
    spent_txo_sum?: number;
  };
  mempool_stats?: {
    funded_txo_sum?: number;
    spent_txo_sum?: number;
  };
};

type CoinGeckoResponse = {
  bitcoin?: {
    usd?: number;
  };
};

const isValidBtcAddress = (address: string): boolean => {
  const normalized = address.trim();
  if (!normalized) return false;

  const isMixedCase =
    normalized !== normalized.toLowerCase() && normalized !== normalized.toUpperCase();

  if (isMixedCase && normalized.toLowerCase().startsWith("bc1")) {
    return false;
  }

  return BTC_ADDRESS_REGEX.test(normalized);
};

const isTestnetAddress = (address: string): boolean => {
  const normalized = address.trim().toLowerCase();
  return (
    normalized.startsWith("tb1") ||
    normalized.startsWith("bcrt1") ||
    normalized.startsWith("m") ||
    normalized.startsWith("n") ||
    normalized.startsWith("2")
  );
};

const getSatoshisFromStats = (stats: BlockstreamAddressResponse): number => {
  const chainFunded = stats.chain_stats?.funded_txo_sum || 0;
  const chainSpent = stats.chain_stats?.spent_txo_sum || 0;
  const mempoolFunded = stats.mempool_stats?.funded_txo_sum || 0;
  const mempoolSpent = stats.mempool_stats?.spent_txo_sum || 0;

  return Math.max(0, chainFunded - chainSpent + mempoolFunded - mempoolSpent);
};

const getUsdRate = async (): Promise<number> => {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
    { cache: "no-store" }
  );

  if (!response.ok) {
    return 0;
  }

  const data = (await response.json()) as CoinGeckoResponse;
  return data.bitcoin?.usd || 0;
};

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address")?.trim() || "";

  if (!address) {
    return NextResponse.json({ message: "BTC address is required" }, { status: 400 });
  }

  if (!isValidBtcAddress(address)) {
    return NextResponse.json({ message: "Invalid BTC address format" }, { status: 400 });
  }

  const testnet = isTestnetAddress(address);
  const blockstreamBaseUrl = testnet
    ? "https://blockstream.info/testnet/api"
    : "https://blockstream.info/api";

  try {
    const walletResponse = await fetch(
      `${blockstreamBaseUrl}/address/${encodeURIComponent(address)}`,
      { cache: "no-store" }
    );

    if (!walletResponse.ok) {
      const status = walletResponse.status === 404 ? 404 : 502;
      const message =
        status === 404
          ? "Wallet not found on blockchain provider"
          : "Unable to fetch BTC balance right now";

      return NextResponse.json({ message }, { status });
    }

    const walletStats = (await walletResponse.json()) as BlockstreamAddressResponse;
    const satoshis = getSatoshisFromStats(walletStats);
    const balance = satoshis / 100_000_000;

    const usdRate = testnet ? 0 : await getUsdRate();
    const usdValue = balance * usdRate;

    return NextResponse.json({
      wallet: address,
      ticker: "BTC",
      satoshis,
      balance,
      balanceFormatted: `${balance.toFixed(8)} BTC`,
      usdRate: Number(usdRate.toFixed(2)),
      usdValue: Number(usdValue.toFixed(2)),
      usdValueFormatted: `$${usdValue.toFixed(2)}`,
      source: testnet ? "blockstream-testnet" : "blockstream-mainnet",
      fetchedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to fetch BTC balance right now" },
      { status: 502 }
    );
  }
}
