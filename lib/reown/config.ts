import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, sepolia } from "@reown/appkit/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";

export const reownProjectId =
  process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ||
  "819b8988644732b6f180e148da212a47";

export const reownNetworks: [AppKitNetwork, ...AppKitNetwork[]] = [
  sepolia,
  mainnet,
];

export const reownMetadata = {
  name: "CHA $CHING",
  description: "CHA $CHING wallet connection",
  url: "https://walrus-app-mnbzr.ondigitalocean.app",
  icons: ["https://walrus-app-mnbzr.ondigitalocean.app/assets/logo.png"],
};

export const wagmiAdapter = new WagmiAdapter({
  projectId: reownProjectId,
  networks: reownNetworks,
});
