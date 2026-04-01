"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAppKit, useAppKitAccount, useWalletInfo } from "@reown/appkit/react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";

const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

type LinkedMethod = {
  type?: string;
  details?: string;
};

type WalletLinkResult = {
  address: string;
  alreadyLinked: boolean;
};

export function useConnectCryptoWallet() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { walletInfo } = useWalletInfo("eip155");

  const [isLinking, setIsLinking] = useState(false);
  const addressRef = useRef<string | undefined>(address);

  useEffect(() => {
    addressRef.current = address;
  }, [address]);

  const waitForAddress = useCallback(async (timeoutMs = 8000) => {
    const startedAt = Date.now();

    return new Promise<string>((resolve, reject) => {
      const timer = window.setInterval(() => {
        const current = addressRef.current;

        if (current) {
          window.clearInterval(timer);
          resolve(current);
          return;
        }

        if (Date.now() - startedAt >= timeoutMs) {
          window.clearInterval(timer);
          reject(new Error("Wallet connection was cancelled."));
        }
      }, 200);
    });
  }, []);

  const saveWalletIfMissing = useCallback(
    async (walletAddress: string, providerName: string): Promise<WalletLinkResult> => {
      const normalizedAddress = walletAddress.toLowerCase();
      const methods = await api.get("/wallet/payment-methods");

      const alreadyLinked = methods.data.some((method: LinkedMethod) => {
        return (
          method.type === "crypto_wallet" &&
          method.details?.toLowerCase() === normalizedAddress
        );
      });

      if (alreadyLinked) {
        return { address: walletAddress, alreadyLinked: true };
      }

      await api.post("/wallet/payment-methods", {
        type: "crypto_wallet",
        provider: providerName,
        details: walletAddress,
      });

      return { address: walletAddress, alreadyLinked: false };
    },
    []
  );

  const connectAndLinkWallet = useCallback(async (): Promise<WalletLinkResult> => {
    setIsLinking(true);

    try {
      if (!isConnected || !addressRef.current) {
        await open({ view: "Connect" });
      }

      const connectedAddress = addressRef.current || (await waitForAddress());

      if (!EVM_ADDRESS_REGEX.test(connectedAddress)) {
        throw new Error("Connected wallet address is invalid.");
      }

      const providerName = walletInfo?.name || "Reown AppKit";
      const result = await saveWalletIfMissing(connectedAddress, providerName);

      if (result.alreadyLinked) {
        toast.success("Wallet already linked.");
      } else {
        toast.success("Wallet connected!");
      }

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Connection failed";
      toast.error(message);
      throw error;
    } finally {
      setIsLinking(false);
    }
  }, [isConnected, open, saveWalletIfMissing, waitForAddress, walletInfo?.name]);

  return {
    address,
    isConnected,
    isLinking,
    connectAndLinkWallet,
  };
}
