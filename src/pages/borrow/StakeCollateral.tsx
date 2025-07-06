import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  CreditCard,
  DollarSign,
  Info,
  Loader,
  Plus,
  Shield,
  Smartphone,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { encodeFunctionData, parseUnits } from "viem";
import { flowTestnet } from "viem/chains";
import ConnectWalletButton from "../../components/ConnectWalletButton";
import { FloatingOrbs } from "../../components/FloatingOrbs";
import { GlowingButton } from "../../components/GlowingButton";
import { CREDIT_MANAGER_ABI } from "../../contracts/abis/CreditManager";
import { USDC_ABI } from "../../contracts/abis/USDC";
import { useHaloWallet } from "../../hooks/useHaloWallet";
import { HaloWallet } from "../../lib/HaloWallet";
import { getWalletClient, publicClient } from "../../utils/viemUtils";

const CREDIT_MANAGER_ADDRESS = import.meta.env.VITE_CREDIT_MANAGER_ADDRESS;
const COLLATERAL_VAULT_ADDRESS = import.meta.env.VITE_COLLATERAL_VAULT_ADDRESS;
const USDC_TOKEN_ADDRESS = import.meta.env.VITE_USDC_TOKEN_CONTRACT_ADDRESS;

type WalletType = "privy" | "halo" | null;

type WalletSelectorProps = {
  onSelectWallet: (type: WalletType) => void;
  selectedWallet: WalletType;
};

const WalletSelector = ({ onSelectWallet, selectedWallet }: WalletSelectorProps) => {
  const { login: privyLogin } = usePrivy();
  const navigate = useNavigate();

  const handlePrivyConnect = () => {
    onSelectWallet("privy");
    setTimeout(() => {
      privyLogin();
    }, 100);
  };

  const handleHaloConnect = () => {
    onSelectWallet("halo");
    setTimeout(() => {
      navigate("/welcome");
    }, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8"
    >
      <div className="text-center mb-8">
        <CreditCard className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Choose Your Wallet</h2>
        <p className="text-gray-400">
          Connect with a traditional software wallet or use your HaLo NFC hardware wallet for enhanced security
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {/* Privy Wallet Option */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePrivyConnect}
          className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 text-left min-h-[120px] touch-manipulation ${
            selectedWallet === "privy"
              ? "border-purple-500 bg-purple-500/20"
              : "border-gray-700 hover:border-purple-500/50 bg-gray-800/50 active:border-purple-500/70"
          }`}
        >
          <div className="flex items-center mb-3 sm:mb-4">
            <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 mr-3" />
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white">Software Wallet</h3>
              <p className="text-xs sm:text-sm text-gray-400">MetaMask, WalletConnect, etc.</p>
            </div>
          </div>
          <ul className="text-xs sm:text-sm text-gray-300 space-y-1 sm:space-y-2">
            <li className="flex items-center">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mr-2 flex-shrink-0" />
              Quick setup
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mr-2 flex-shrink-0" />
              Multiple wallet support
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mr-2 flex-shrink-0" />
              Cross-platform
            </li>
          </ul>
        </motion.button>

        {/* HaLo Wallet Option */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleHaloConnect}
          className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 text-left min-h-[120px] touch-manipulation ${
            selectedWallet === "halo"
              ? "border-cyan-500 bg-cyan-500/20"
              : "border-gray-700 hover:border-cyan-500/50 bg-gray-800/50 active:border-cyan-500/70"
          }`}
        >
          <div className="flex items-center mb-3 sm:mb-4">
            <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 mr-3" />
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white">HaLo NFC Wallet</h3>
              <p className="text-xs sm:text-sm text-gray-400">Hardware security card</p>
            </div>
          </div>
          <ul className="text-xs sm:text-sm text-gray-300 space-y-1 sm:space-y-2">
            <li className="flex items-center">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400 mr-2 flex-shrink-0" />
              Hardware security
            </li>
            <li className="flex items-center">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400 mr-2 flex-shrink-0" />
              NFC signing
            </li>
            <li className="flex items-center">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400 mr-2 flex-shrink-0" />
              Air-gapped security
            </li>
          </ul>
        </motion.button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">Both options provide secure access to your credit line</p>
      </div>
    </motion.div>
  );
};

export default function StakeCollateral() {
  const { authenticated, user, login } = usePrivy();
  const { isConnected: haloConnected, address: haloAddress } = useHaloWallet();
  const [stakeAmount, setStakeAmount] = useState("");
  const [transactionStatus, setTransactionStatus] = useState<"idle" | "approving" | "staking" | "success" | "error">(
    "idle"
  );
  const [userBalance, setUserBalance] = useState<string>("0");
  const [userAllowance, setUserAllowance] = useState<string>("0");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [existingCreditInfo, setExistingCreditInfo] = useState<any>(null);
  const [hasExistingCredit, setHasExistingCredit] = useState<boolean>(false);
  const [reputationScore, setReputationScore] = useState<number>(0);
  const [creditIncreaseEligibility, setCreditIncreaseEligibility] = useState<{ eligible: boolean; newLimit: number }>({
    eligible: false,
    newLimit: 0,
  });

  const [selectedWallet, setSelectedWallet] = useState<WalletType>(() => {
    if (authenticated && user?.wallet?.address) {
      localStorage.setItem("preferredWallet", "privy");
      return "privy";
    }
    if (haloConnected && haloAddress) {
      localStorage.setItem("preferredWallet", "halo");
      return "halo";
    }

    const stored = localStorage.getItem("preferredWallet") as WalletType;
    return stored || null;
  });

  const [walletDetectionComplete, setWalletDetectionComplete] = useState<boolean>(() => {
    return Boolean((authenticated && user?.wallet?.address) || (haloConnected && haloAddress));
  });

  const isWalletConnected = selectedWallet === "privy" ? authenticated : haloConnected;
  const walletAddress = selectedWallet === "privy" ? user?.wallet?.address : haloAddress;

  const usdcBalance = parseFloat(userBalance) / 1e6;
  const baseCreditRatio = 1.0;

  const walletClient =
    selectedWallet === "privy" && authenticated && user?.wallet && (window as any).ethereum
      ? getWalletClient(user.wallet.address as string)
      : null;

  const handleWalletSelection = (type: WalletType) => {
    setSelectedWallet(type);
    if (type) {
      localStorage.setItem("preferredWallet", type);
    } else {
      localStorage.removeItem("preferredWallet");
    }
  };

  const fetchUserData = async () => {
    if (!walletAddress) return;

    try {
      const [balance, allowance] = await Promise.all([
        publicClient.readContract({
          address: USDC_TOKEN_ADDRESS as `0x${string}`,
          abi: USDC_ABI,
          functionName: "balanceOf",
          args: [walletAddress as `0x${string}`],
        }),
        publicClient.readContract({
          address: USDC_TOKEN_ADDRESS as `0x${string}`,
          abi: USDC_ABI,
          functionName: "allowance",
          args: [walletAddress as `0x${string}`, CREDIT_MANAGER_ADDRESS as `0x${string}`],
        }),
      ]);

      setUserBalance((balance as bigint).toString());
      setUserAllowance((allowance as bigint).toString());

      if (CREDIT_MANAGER_ADDRESS) {
        try {
          const [creditInfo, repScore, creditEligibility] = await Promise.all([
            publicClient.readContract({
              address: CREDIT_MANAGER_ADDRESS as `0x${string}`,
              abi: CREDIT_MANAGER_ABI,
              functionName: "getCreditInfo",
              args: [walletAddress as `0x${string}`],
            }),
            publicClient
              .readContract({
                address: CREDIT_MANAGER_ADDRESS as `0x${string}`,
                abi: CREDIT_MANAGER_ABI,
                functionName: "reputationManager",
              })
              .then((reputationManagerAddress) =>
                publicClient.readContract({
                  address: reputationManagerAddress as `0x${string}`,
                  abi: [
                    {
                      inputs: [{ internalType: "address", name: "borrower", type: "address" }],
                      name: "getReputationScore",
                      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
                      stateMutability: "view",
                      type: "function",
                    },
                  ],
                  functionName: "getReputationScore",
                  args: [walletAddress as `0x${string}`],
                })
              )
              .catch(() => 0),
            publicClient
              .readContract({
                address: CREDIT_MANAGER_ADDRESS as `0x${string}`,
                abi: CREDIT_MANAGER_ABI,
                functionName: "checkCreditIncreaseEligibility",
                args: [walletAddress as `0x${string}`],
              })
              .catch(() => [false, 0]),
          ]);

          setReputationScore(Number(repScore));

          if (Array.isArray(creditEligibility)) {
            const [eligible, newLimit] = creditEligibility;
            setCreditIncreaseEligibility({
              eligible: Boolean(eligible),
              newLimit: Number(newLimit) / 1e6,
            });
          }

          if (creditInfo && Array.isArray(creditInfo)) {
            const [
              collateralDeposited,
              creditLimit,
              borrowedAmount,
              interestAccrued,
              totalDebt,
              repaymentDueDate,
              isActive,
            ] = creditInfo;

            if (isActive) {
              setHasExistingCredit(true);
              setExistingCreditInfo({
                collateralDeposited: Number(collateralDeposited) / 1e6,
                creditLimit: Number(creditLimit) / 1e6,
                borrowedAmount: Number(borrowedAmount) / 1e6,
                interestAccrued: Number(interestAccrued) / 1e6,
                totalDebt: Number(totalDebt) / 1e6,
                repaymentDueDate: Number(repaymentDueDate),
                isActive: Boolean(isActive),
              });
            }
          }
        } catch (creditError) {
          console.error("Error fetching credit info:", creditError);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchUserData();
    }
  }, [walletAddress, selectedWallet]);

  useEffect(() => {
    const detectWalletWithDelay = () => {
      setTimeout(() => {
        setWalletDetectionComplete(true);

        if (!selectedWallet) {
          if (authenticated && user?.wallet?.address) {
            setSelectedWallet("privy");
            localStorage.setItem("preferredWallet", "privy");
          } else if (haloConnected && haloAddress) {
            setSelectedWallet("halo");
            localStorage.setItem("preferredWallet", "halo");
          }
        } else if (selectedWallet === "privy" && !authenticated && haloConnected && haloAddress) {
          setSelectedWallet("halo");
          localStorage.setItem("preferredWallet", "halo");
        } else if (selectedWallet === "halo" && !haloConnected && authenticated && user?.wallet?.address) {
          setSelectedWallet("privy");
          localStorage.setItem("preferredWallet", "privy");
        }
      }, 100);
    };

    detectWalletWithDelay();
  }, [authenticated, user?.wallet?.address, haloConnected, haloAddress, selectedWallet]);

  useEffect(() => {
    const hasActiveConnection = (authenticated && user?.wallet?.address) || (haloConnected && haloAddress);
    if (hasActiveConnection) {
      setWalletDetectionComplete(true);
    }
  }, [authenticated, user?.wallet?.address, haloConnected, haloAddress]);

  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!walletDetectionComplete) {
        setWalletDetectionComplete(true);
      }
    }, 2000);

    return () => clearTimeout(fallbackTimer);
  }, [walletDetectionComplete]);

  const needsApproval = () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return false;
    const amountWei = parseUnits(stakeAmount, 6);
    return BigInt(userAllowance) < amountWei;
  };

  const handleOpenCreditLine = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0 || !walletAddress) return;

    try {
      setTransactionStatus("staking");
      setErrorMessage("");

      const amountWei = parseUnits(stakeAmount, 6);

      if (selectedWallet === "privy") {
        if (!walletClient) return;

        if (needsApproval()) {
          setTransactionStatus("approving");
          const approveCreditManagerHash = await walletClient.writeContract({
            address: USDC_TOKEN_ADDRESS as `0x${string}`,
            abi: USDC_ABI,
            functionName: "approve",
            args: [CREDIT_MANAGER_ADDRESS as `0x${string}`, amountWei],
            account: walletAddress as `0x${string}`,
            chain: flowTestnet,
          });
          await publicClient.waitForTransactionReceipt({ hash: approveCreditManagerHash });
          const approveCollateralVaultHash = await walletClient.writeContract({
            address: USDC_TOKEN_ADDRESS as `0x${string}`,
            abi: USDC_ABI,
            functionName: "approve",
            args: [COLLATERAL_VAULT_ADDRESS as `0x${string}`, amountWei],
            account: walletAddress as `0x${string}`,
            chain: flowTestnet,
          });
          await publicClient.waitForTransactionReceipt({ hash: approveCollateralVaultHash });
        }

        setTransactionStatus("staking");
        const stakeHash = await walletClient.writeContract({
          address: CREDIT_MANAGER_ADDRESS as `0x${string}`,
          abi: CREDIT_MANAGER_ABI,
          functionName: "openCreditLine",
          args: [amountWei],
          account: walletAddress as `0x${string}`,
          chain: flowTestnet,
        });

        await publicClient.waitForTransactionReceipt({ hash: stakeHash });
      } else if (selectedWallet === "halo") {
        if (needsApproval()) {
          setTransactionStatus("approving");
          toast("Please tap your HaLo NFC card to approve USDC spending...", { icon: "📱" });

          const haloWallet = new HaloWallet(walletAddress, publicClient);

          const approveCreditManagerHash = await haloWallet.sendTransaction({
            to: USDC_TOKEN_ADDRESS,
            data: encodeFunctionData({
              abi: USDC_ABI,
              functionName: "approve",
              args: [CREDIT_MANAGER_ADDRESS as `0x${string}`, amountWei],
            }),
            value: BigInt(0),
            gas: BigInt(100000),
            chainId: flowTestnet.id,
          });

          await publicClient.waitForTransactionReceipt({ hash: approveCreditManagerHash });

          toast("Please tap your HaLo NFC card again to approve collateral vault spending...", { icon: "📱" });

          const approveCollateralVaultHash = await haloWallet.sendTransaction({
            to: COLLATERAL_VAULT_ADDRESS,
            data: encodeFunctionData({
              abi: USDC_ABI,
              functionName: "approve",
              args: [COLLATERAL_VAULT_ADDRESS as `0x${string}`, amountWei],
            }),
            value: BigInt(0),
            gas: BigInt(100000),
            chainId: flowTestnet.id,
          });

          await publicClient.waitForTransactionReceipt({ hash: approveCollateralVaultHash });
        }

        setTransactionStatus("staking");
        toast("Please tap your HaLo NFC card to open credit line...", { icon: "📱" });

        const haloWallet = new HaloWallet(walletAddress, publicClient);

        const stakeHash = await haloWallet.sendTransaction({
          to: CREDIT_MANAGER_ADDRESS,
          data: encodeFunctionData({
            abi: CREDIT_MANAGER_ABI,
            functionName: "openCreditLine",
            args: [amountWei],
          }),
          value: BigInt(0),
          gas: BigInt(200000),
          chainId: flowTestnet.id,
        });

        await publicClient.waitForTransactionReceipt({ hash: stakeHash });
      }

      await fetchUserData();
      setTransactionStatus("success");
      setStakeAmount("");

      setTimeout(() => setTransactionStatus("idle"), 3000);
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to open credit line");
      setTransactionStatus("error");
      setTimeout(() => setTransactionStatus("idle"), 5000);
    }
  };

  const handleAddCollateral = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0 || !walletAddress) return;

    try {
      setTransactionStatus("staking");
      setErrorMessage("");

      const amountWei = parseUnits(stakeAmount, 6);

      if (selectedWallet === "privy") {
        if (!walletClient) return;

        if (needsApproval()) {
          setTransactionStatus("approving");
          const approveCreditManagerHash = await walletClient.writeContract({
            address: USDC_TOKEN_ADDRESS as `0x${string}`,
            abi: USDC_ABI,
            functionName: "approve",
            args: [CREDIT_MANAGER_ADDRESS as `0x${string}`, amountWei],
            account: walletAddress as `0x${string}`,
            chain: flowTestnet,
          });
          await publicClient.waitForTransactionReceipt({ hash: approveCreditManagerHash });
          const approveCollateralVaultHash = await walletClient.writeContract({
            address: USDC_TOKEN_ADDRESS as `0x${string}`,
            abi: USDC_ABI,
            functionName: "approve",
            args: [COLLATERAL_VAULT_ADDRESS as `0x${string}`, amountWei],
            account: walletAddress as `0x${string}`,
            chain: flowTestnet,
          });
          await publicClient.waitForTransactionReceipt({ hash: approveCollateralVaultHash });
        }

        setTransactionStatus("staking");
        const stakeHash = await walletClient.writeContract({
          address: CREDIT_MANAGER_ADDRESS as `0x${string}`,
          abi: CREDIT_MANAGER_ABI,
          functionName: "addCollateral",
          args: [amountWei],
          account: walletAddress as `0x${string}`,
          chain: flowTestnet,
        });

        await publicClient.waitForTransactionReceipt({ hash: stakeHash });
      } else if (selectedWallet === "halo") {
        if (needsApproval()) {
          setTransactionStatus("approving");
          toast("Please tap your HaLo NFC card to approve USDC spending...", { icon: "📱" });

          const haloWallet = new HaloWallet(walletAddress, publicClient);

          const approveCreditManagerHash = await haloWallet.sendTransaction({
            to: USDC_TOKEN_ADDRESS,
            data: encodeFunctionData({
              abi: USDC_ABI,
              functionName: "approve",
              args: [CREDIT_MANAGER_ADDRESS as `0x${string}`, amountWei],
            }),
            value: BigInt(0),
            gas: BigInt(100000),
            chainId: flowTestnet.id,
          });

          await publicClient.waitForTransactionReceipt({ hash: approveCreditManagerHash });

          toast("Please tap your HaLo NFC card again to approve collateral vault spending...", { icon: "📱" });

          const approveCollateralVaultHash = await haloWallet.sendTransaction({
            to: COLLATERAL_VAULT_ADDRESS,
            data: encodeFunctionData({
              abi: USDC_ABI,
              functionName: "approve",
              args: [COLLATERAL_VAULT_ADDRESS as `0x${string}`, amountWei],
            }),
            value: BigInt(0),
            gas: BigInt(100000),
            chainId: flowTestnet.id,
          });

          await publicClient.waitForTransactionReceipt({ hash: approveCollateralVaultHash });
        }

        setTransactionStatus("staking");
        toast("Please tap your HaLo NFC card to add collateral...", { icon: "📱" });

        const haloWallet = new HaloWallet(walletAddress, publicClient);

        const stakeHash = await haloWallet.sendTransaction({
          to: CREDIT_MANAGER_ADDRESS,
          data: encodeFunctionData({
            abi: CREDIT_MANAGER_ABI,
            functionName: "addCollateral",
            args: [amountWei],
          }),
          value: BigInt(0),
          gas: BigInt(200000),
          chainId: flowTestnet.id,
        });

        await publicClient.waitForTransactionReceipt({ hash: stakeHash });
      }

      await fetchUserData();
      setTransactionStatus("success");
      setStakeAmount("");

      setTimeout(() => setTransactionStatus("idle"), 3000);
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to add collateral");
      setTransactionStatus("error");
      setTimeout(() => setTransactionStatus("idle"), 5000);
    }
  };

  const handleStake = () => {
    if (!isWalletConnected) {
      if (!selectedWallet) {
        return;
      }
      if (selectedWallet === "privy") {
        login();
        return;
      }
    }

    if (hasExistingCredit) {
      handleAddCollateral();
    } else {
      handleOpenCreditLine();
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchUserData();
    }
  }, [walletAddress, selectedWallet]);

  const calculateCreditLimit = () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return 0;

    return parseFloat(stakeAmount) * baseCreditRatio;
  };

  const isValidAmount = stakeAmount && parseFloat(stakeAmount) > 0 && parseFloat(stakeAmount) <= usdcBalance;
  const isLoading = transactionStatus === "approving" || transactionStatus === "staking";
  const canStake = isWalletConnected && isValidAmount && !isLoading;

  return (
    <div className="min-h-screen bg-black text-white">
      <FloatingOrbs />

      <ConnectWalletButton />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            {hasExistingCredit ? "Add More Collateral" : "Stake USDC as Collateral"}
          </h1>
          {hasExistingCredit && <p className="text-gray-400 text-lg">Add more USDC to increase your credit limit</p>}
        </motion.div>

        {hasExistingCredit && existingCreditInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-cyan-400" />
              {existingCreditInfo.collateralDeposited > 0 ? "Current Credit Line" : "Active Credit Line"}
            </h3>
            {existingCreditInfo.collateralDeposited > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-sm">Collateral Deposited</div>
                  <div className="text-xl font-bold text-white">
                    ${existingCreditInfo.collateralDeposited.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Credit Limit</div>
                  <div className="text-xl font-bold text-cyan-400">${existingCreditInfo.creditLimit.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Amount Borrowed</div>
                  <div className="text-xl font-bold text-purple-400">
                    ${existingCreditInfo.borrowedAmount.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Available Credit</div>
                  <div className="text-xl font-bold text-green-400">
                    ${(existingCreditInfo.creditLimit - existingCreditInfo.borrowedAmount).toFixed(2)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-gray-400 text-sm mb-2">
                  You have an active credit line but no collateral deposited
                </div>
                <div className="text-lg font-medium text-yellow-400">
                  Add collateral below to increase your credit limit
                </div>
              </div>
            )}
          </motion.div>
        )}

        {!isWalletConnected ? (
          !walletDetectionComplete ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 text-center"
            >
              <Loader className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-bold text-white mb-2">Detecting Wallet Connection...</h2>
              <p className="text-gray-400 mb-4">Please wait while we check your wallet status</p>
              <button
                onClick={() => setWalletDetectionComplete(true)}
                className="text-sm text-gray-500 hover:text-gray-400 transition-colors duration-300"
              >
                Skip and choose wallet manually
              </button>
            </motion.div>
          ) : selectedWallet ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 text-center"
            >
              <Wallet className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">
                {selectedWallet === "privy" ? "Connect Privy Wallet" : "Connect HaLo NFC Wallet"}
              </h2>
              <p className="text-gray-400 mb-6">
                {selectedWallet === "privy"
                  ? "Connect your Privy wallet to stake USDC and establish your credit line"
                  : "Connect your HaLo NFC card to stake USDC and establish your credit line"}
              </p>
              <GlowingButton
                onClick={selectedWallet === "privy" ? login : () => (window.location.href = "/welcome")}
                className="text-lg px-8 py-4"
              >
                {selectedWallet === "privy" ? "Connect Privy Wallet" : "Connect HaLo NFC"}
                <ArrowRight className="w-5 h-5" />
              </GlowingButton>
              <button
                onClick={() => handleWalletSelection(null)}
                className="mt-4 text-gray-400 hover:text-white transition-colors duration-300"
              >
                ← Back to wallet selection
              </button>
            </motion.div>
          ) : (
            <WalletSelector onSelectWallet={handleWalletSelection} selectedWallet={selectedWallet} />
          )
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8"
          >
            <div className="mb-8">
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 focus-within:border-purple-500/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <input
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-transparent text-4xl font-bold text-white placeholder-gray-500 focus:outline-none w-full"
                  />
                  <div className="flex items-center gap-3">
                    <span className="text-xl text-gray-400">USDC</span>
                    <button
                      onClick={() => setStakeAmount(usdcBalance.toString())}
                      className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-400 hover:text-purple-300 transition-colors duration-300 text-sm font-medium"
                    >
                      MAX
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-3 px-2">
                <span className="text-gray-400 text-sm">Balance: {usdcBalance.toFixed(2)} USDC</span>
                {needsApproval() && <span className="text-yellow-400 text-sm">Will require approval</span>}
              </div>
            </div>

            {stakeAmount && parseFloat(stakeAmount) > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800/50 border border-cyan-500/30 rounded-xl p-6 mb-8"
              >
                <div className="text-center">
                  <div className="text-gray-400 text-sm mb-2">
                    {hasExistingCredit ? "Additional Credit" : "Credit Limit"}
                  </div>
                  <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
                    ${calculateCreditLimit().toFixed(2)}
                  </div>
                  {hasExistingCredit && existingCreditInfo && (
                    <div className="mt-2 text-gray-400 text-sm">
                      New Total: ${(existingCreditInfo.creditLimit + calculateCreditLimit()).toFixed(2)}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {hasExistingCredit && authenticated && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-gray-800/50 border border-purple-500/30 rounded-xl p-6 mb-8"
              >
                <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4 text-purple-400" />
                  Reputation & Credit Increases
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Reputation Score</div>
                    <div className="text-lg font-bold text-purple-400">{reputationScore}/1000</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Credit Increase Eligible</div>
                    <div
                      className={`text-lg font-bold ${creditIncreaseEligibility.eligible ? "text-green-400" : "text-red-400"}`}
                    >
                      {creditIncreaseEligibility.eligible ? "Yes" : "No"}
                    </div>
                  </div>
                </div>
                {creditIncreaseEligibility.eligible && (
                  <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="text-green-400 text-sm font-medium">
                      🎉 Eligible for credit increase to ${creditIncreaseEligibility.newLimit.toFixed(2)}
                    </div>
                    <div className="text-green-300 text-xs mt-1">
                      Make a repayment to automatically trigger the increase
                    </div>
                  </div>
                )}
                <div className="mt-3 text-xs text-gray-500">
                  Credit multipliers (1.2x) are automatically applied after good repayment history
                </div>
              </motion.div>
            )}

            <div className="text-center text-gray-400 text-sm mb-8 leading-relaxed">
              {hasExistingCredit
                ? "Adding more USDC will increase your credit limit at a 1:1 ratio. Credit multipliers are earned through good repayment history."
                : "Your staked USDC secures your credit line at a 1:1 ratio (100% of collateral)."}
            </div>

            <GlowingButton onClick={handleStake} className="w-full text-xl py-6" disabled={!canStake}>
              {transactionStatus === "approving" ? (
                <>
                  <Loader className="w-6 h-6 animate-spin" />
                  Approving USDC...
                </>
              ) : transactionStatus === "staking" ? (
                <>
                  <Loader className="w-6 h-6 animate-spin" />
                  {hasExistingCredit ? "Adding Collateral..." : "Opening Credit Line..."}
                </>
              ) : transactionStatus === "success" ? (
                <>
                  <CheckCircle className="w-6 h-6" />
                  {hasExistingCredit ? "Collateral Added!" : "Credit Line Opened!"}
                </>
              ) : !isWalletConnected ? (
                <>
                  Connect Wallet
                  <Wallet className="w-6 h-6" />
                </>
              ) : hasExistingCredit ? (
                <>
                  {existingCreditInfo?.collateralDeposited > 0 ? "Add More Collateral" : "Add Initial Collateral"}
                  <Plus className="w-6 h-6" />
                </>
              ) : (
                <>
                  Open Credit Line
                  <DollarSign className="w-6 h-6" />
                </>
              )}
            </GlowingButton>

            {transactionStatus === "error" && errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center gap-3 mt-6"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div>
                  <div className="text-red-400 font-medium">Transaction Failed</div>
                  <div className="text-red-300 text-sm">{errorMessage}</div>
                </div>
              </motion.div>
            )}

            {transactionStatus === "success" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 flex items-center gap-3 mt-6"
              >
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <div>
                  <div className="text-green-400 font-medium">
                    {hasExistingCredit ? "Collateral Added Successfully!" : "Stake"}
                  </div>
                  <div className="text-green-300 text-sm">
                    {hasExistingCredit
                      ? "Your credit limit has been increased."
                      : "You can now borrow against your collateral."}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
