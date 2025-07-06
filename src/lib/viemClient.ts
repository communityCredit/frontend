import { createPublicClient, http, type PublicClient } from "viem";
import { flowTestnet } from "viem/chains";

export const defaultChain = flowTestnet;

export const supportedChains = [flowTestnet] as const;

export const publicClient: PublicClient = createPublicClient({
  chain: defaultChain,
  transport: http(),
});

export const createPublicClientForChain = (chainId: number): PublicClient => {
  const chain = supportedChains.find((c) => c.id === chainId) || defaultChain;

  return createPublicClient({
    chain,
    transport: http(),
  });
};

export const getRpcUrl = (chainId: number): string => {
  const chain = supportedChains.find((c) => c.id === chainId);
  return chain?.rpcUrls.default.http[0] || defaultChain.rpcUrls.default.http[0];
};

export default publicClient;
