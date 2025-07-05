import { usePrivy } from "@privy-io/react-auth";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { flowTestnet } from "viem/chains";

const { authenticated, user } = usePrivy();
export const publicClient = createPublicClient({
  chain: flowTestnet,
  transport: http(),
});

export const walletClient =
  authenticated && user?.wallet && (window as any).ethereum
    ? createWalletClient({
        chain: flowTestnet,
        transport: custom((window as any).ethereum),
        account: user.wallet.address as `0x${string}`,
      })
    : null;
