import { createPublicClient, createWalletClient, custom, http } from "viem";
import { flowTestnet } from "viem/chains";

export const publicClient = createPublicClient({
  chain: flowTestnet,
  transport: http(),
});

export const createCentralizedWalletClient = (userAddress: string) => {
  if (!(window as any).ethereum) {
    throw new Error("Ethereum provider not found");
  }

  return createWalletClient({
    chain: flowTestnet,
    transport: custom((window as any).ethereum),
    account: userAddress as `0x${string}`,
  });
};

let walletClientInstance: ReturnType<typeof createWalletClient> | null = null;

export const getWalletClient = (userAddress: string) => {
  if (!walletClientInstance || walletClientInstance.account?.address !== userAddress) {
    walletClientInstance = createCentralizedWalletClient(userAddress);
  }
  return walletClientInstance;
};
