import { mainnet, arbitrum, optimism, polygon, sepolia } from "@reown/appkit/networks";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

export const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID";

if (!projectId || projectId === "YOUR_PROJECT_ID") {
  console.warn(
    "WalletConnect Project ID is not set. Please set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in your .env.local file",
  );
}

export const networks = [sepolia, mainnet, arbitrum, optimism, polygon];

export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;
