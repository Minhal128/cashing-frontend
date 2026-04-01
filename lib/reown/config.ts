import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, sepolia } from "@reown/appkit/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";

const FALLBACK_APP_URL = "https://walrus-app-mnbzr.ondigitalocean.app";

const sanitizeBaseUrl = (value?: string): string | undefined => {
  if (!value) return undefined;

  const trimmed = value.trim().replace(/\/+$/, "");
  return /^https?:\/\//i.test(trimmed) ? trimmed : undefined;
};

export const buildReownMetadata = (runtimeOrigin?: string) => {
  const baseUrl =
    sanitizeBaseUrl(runtimeOrigin) ||
    sanitizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL) ||
    sanitizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    FALLBACK_APP_URL;

  return {
    name: "CHA $CHING",
    description: "CHA $CHING wallet connection",
    url: baseUrl,
    icons: [`${baseUrl}/assets/logo.png`],
  };
};

export const reownProjectId =
  process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ||
  "819b8988644732b6f180e148da212a47";

export const reownNetworks: [AppKitNetwork, ...AppKitNetwork[]] = [
  sepolia,
  mainnet,
];

export const reownMetadata = buildReownMetadata();

export const wagmiAdapter = new WagmiAdapter({
  projectId: reownProjectId,
  networks: reownNetworks,
});
