import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BTC_ADDRESS_REGEX = /^(bc1|tb1|bcrt1)[ac-hj-np-z02-9]{11,71}$|^(1|3|m|n|2)[a-km-zA-HJ-NP-Z1-9]{25,39}$/i;
const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const SATOSHIS_PER_BTC = 100_000_000;
const USDT_SEPOLIA_CONTRACT = "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0";

type PriceResponse = {
  bitcoin?: { usd?: number };
  ethereum?: { usd?: number };
  tether?: { usd?: number };
};

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

type AssetSummary = {
  ticker: "BTC" | "ETH" | "USDT";
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

const isValidBtcAddress = (address: string) => {
  const normalized = address.trim();
  if (!normalized) return false;

  const isMixedCase =
    normalized !== normalized.toLowerCase() && normalized !== normalized.toUpperCase();

  if (isMixedCase && normalized.toLowerCase().startsWith("bc1")) {
    return false;
  }

  return BTC_ADDRESS_REGEX.test(normalized);
};

const isTestnetBtcAddress = (address: string) => {
  const normalized = address.toLowerCase();
  return (
    normalized.startsWith("tb1") ||
    normalized.startsWith("bcrt1") ||
    normalized.startsWith("m") ||
    normalized.startsWith("n") ||
    normalized.startsWith("2")
  );
};

const getUsdRates = async () => {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd",
    { cache: "no-store" }
  );

  if (!response.ok) {
    return { btc: 0, eth: 0, usdt: 0 };
  }

  const data = (await response.json()) as PriceResponse;

  return {
    btc: Number(data.bitcoin?.usd || 0),
    eth: Number(data.ethereum?.usd || 0),
    usdt: Number(data.tether?.usd || 0),
  };
};

const getBtcBalance = async (address: string) => {
  const testnet = isTestnetBtcAddress(address);
  const baseUrl = testnet
    ? "https://blockstream.info/testnet/api"
    : "https://blockstream.info/api";

  const response = await fetch(
    `${baseUrl}/address/${encodeURIComponent(address)}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    return { balance: 0, source: testnet ? "blockstream-testnet" : "blockstream-mainnet" };
  }

  const payload = (await response.json()) as BlockstreamAddressResponse;
  const chainFunded = payload.chain_stats?.funded_txo_sum || 0;
  const chainSpent = payload.chain_stats?.spent_txo_sum || 0;
  const mempoolFunded = payload.mempool_stats?.funded_txo_sum || 0;
  const mempoolSpent = payload.mempool_stats?.spent_txo_sum || 0;

  const satoshis = Math.max(0, chainFunded - chainSpent + mempoolFunded - mempoolSpent);
  return {
    balance: satoshis / SATOSHIS_PER_BTC,
    source: testnet ? "blockstream-testnet" : "blockstream-mainnet",
  };
};

const getEthAndUsdtBalances = async (address: string) => {
  const provider = new ethers.JsonRpcProvider(
    process.env.ETH_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com"
  );

  const ethBalanceWei = await provider.getBalance(address);
  const ethBalance = Number(ethers.formatEther(ethBalanceWei));

  const erc20Abi = [
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
  ];

  const usdtContract = new ethers.Contract(USDT_SEPOLIA_CONTRACT, erc20Abi, provider);
  const [rawUsdtBalance, usdtDecimals] = await Promise.all([
    usdtContract.balanceOf(address),
    usdtContract.decimals(),
  ]);

  const usdtBalance = Number(ethers.formatUnits(rawUsdtBalance, Number(usdtDecimals)));

  return {
    ethBalance,
    usdtBalance,
    source: "sepolia-rpc",
  };
};

const formatUsd = (value: number) => `$${value.toFixed(2)}`;

export async function GET(request: NextRequest) {
  const btcAddressRaw = request.nextUrl.searchParams.get("btcAddress")?.trim() || "";
  const evmAddressRaw = request.nextUrl.searchParams.get("evmAddress")?.trim() || "";

  const btcAddress = isValidBtcAddress(btcAddressRaw) ? btcAddressRaw : "";
  const evmAddress = EVM_ADDRESS_REGEX.test(evmAddressRaw) ? evmAddressRaw : "";

  try {
    const usdRates = await getUsdRates();

    const btcSnapshot = btcAddress
      ? await getBtcBalance(btcAddress)
      : { balance: 0, source: "not-linked" };

    let ethBalance = 0;
    let usdtBalance = 0;
    let evmSource = "not-linked";

    if (evmAddress) {
      try {
        const evmSnapshot = await getEthAndUsdtBalances(evmAddress);
        ethBalance = evmSnapshot.ethBalance;
        usdtBalance = evmSnapshot.usdtBalance;
        evmSource = evmSnapshot.source;
      } catch {
        evmSource = "sepolia-rpc-unavailable";
      }
    }

    const assets: AssetSummary[] = [
      {
        ticker: "BTC",
        address: btcAddress || null,
        linked: Boolean(btcAddress),
        balance: Number(btcSnapshot.balance.toFixed(8)),
        balanceFormatted: `${btcSnapshot.balance.toFixed(8)} BTC`,
        usdRate: Number(usdRates.btc.toFixed(2)),
        usdRateFormatted: formatUsd(usdRates.btc),
        usdValue: Number((btcSnapshot.balance * usdRates.btc).toFixed(2)),
        usdValueFormatted: formatUsd(btcSnapshot.balance * usdRates.btc),
        source: btcSnapshot.source,
      },
      {
        ticker: "ETH",
        address: evmAddress || null,
        linked: Boolean(evmAddress),
        balance: Number(ethBalance.toFixed(8)),
        balanceFormatted: `${ethBalance.toFixed(8)} ETH`,
        usdRate: Number(usdRates.eth.toFixed(2)),
        usdRateFormatted: formatUsd(usdRates.eth),
        usdValue: Number((ethBalance * usdRates.eth).toFixed(2)),
        usdValueFormatted: formatUsd(ethBalance * usdRates.eth),
        source: evmSource,
      },
      {
        ticker: "USDT",
        address: evmAddress || null,
        linked: Boolean(evmAddress),
        balance: Number(usdtBalance.toFixed(6)),
        balanceFormatted: `${usdtBalance.toFixed(6)} USDT`,
        usdRate: Number(usdRates.usdt.toFixed(4)),
        usdRateFormatted: formatUsd(usdRates.usdt),
        usdValue: Number((usdtBalance * usdRates.usdt).toFixed(2)),
        usdValueFormatted: formatUsd(usdtBalance * usdRates.usdt),
        source: evmSource,
      },
    ];

    return NextResponse.json({
      assets,
      fetchedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to load crypto wallet summary right now" },
      { status: 502 }
    );
  }
}
