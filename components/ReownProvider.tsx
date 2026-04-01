"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { WagmiProvider } from "wagmi";
import {
  reownMetadata,
  reownNetworks,
  reownProjectId,
  wagmiAdapter,
} from "@/lib/reown/config";

declare global {
  var __reownAppKitInitialized: boolean | undefined;
}

const queryClient = new QueryClient();

if (typeof window !== "undefined" && !globalThis.__reownAppKitInitialized) {
  createAppKit({
    adapters: [wagmiAdapter],
    projectId: reownProjectId,
    networks: reownNetworks,
    defaultNetwork: reownNetworks[0],
    metadata: reownMetadata,
    features: {
      analytics: true,
    },
  });

  globalThis.__reownAppKitInitialized = true;
}

export default function ReownProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
