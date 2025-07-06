import { useEffect, useState } from "react";
import { HaloWallet } from "../lib/HaloWallet";
import { publicClient } from "../lib/viemClient";

interface HaloWalletData {
  address: string;
  publicKey: string;
  isConnected: boolean;
}

// Local storage keys
const HALO_WALLET_KEY = "halo_wallet_data";
const HALO_ADDRESS_KEY = "halo_address";
const HALO_CONNECTED_KEY = "halo_connected";

export const useHaloWallet = () => {
  const [walletData, setWalletData] = useState<HaloWalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load wallet data from localStorage on mount
  useEffect(() => {
    loadWalletFromStorage();
  }, []);

  const loadWalletFromStorage = () => {
    try {
      const isConnected = localStorage.getItem(HALO_CONNECTED_KEY) === "true";
      const storedData = localStorage.getItem(HALO_WALLET_KEY);

      if (isConnected && storedData) {
        const parsedData = JSON.parse(storedData) as HaloWalletData;
        if (parsedData.address && parsedData.isConnected) {
          setWalletData(parsedData);
        }
      }
    } catch (error) {
      console.error("Error loading wallet from localStorage:", error);
      clearWalletStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const saveWalletToStorage = (data: HaloWalletData) => {
    try {
      localStorage.setItem(HALO_WALLET_KEY, JSON.stringify(data));
      localStorage.setItem(HALO_ADDRESS_KEY, data.address);
      localStorage.setItem(HALO_CONNECTED_KEY, "true");
      setWalletData(data);
    } catch (error) {
      console.error("Failed to save wallet data to localStorage:", error);
      throw new Error("Failed to save wallet data");
    }
  };

  const clearWalletStorage = () => {
    localStorage.removeItem(HALO_WALLET_KEY);
    localStorage.removeItem(HALO_ADDRESS_KEY);
    localStorage.removeItem(HALO_CONNECTED_KEY);
    setWalletData(null);
  };

  const createHaloWallet = (customPublicClient?: any): HaloWallet | null => {
    if (!walletData) return null;
    return new HaloWallet(walletData.address, customPublicClient || publicClient);
  };

  const isConnected = (): boolean => {
    return walletData?.isConnected ?? false;
  };

  const getAddress = (): string | null => {
    return walletData?.address ?? null;
  };

  return {
    walletData,
    isLoading,
    isConnected: isConnected(),
    address: getAddress(),
    saveWalletToStorage,
    clearWalletStorage,
    createHaloWallet,
    loadWalletFromStorage,
  };
};

export default useHaloWallet;
