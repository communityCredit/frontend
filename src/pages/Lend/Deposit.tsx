import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, CheckCircle, DollarSign, Info, Loader, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { parseUnits } from "viem";
import { FloatingOrbs } from "../../components/FloatingOrbs";
import { GlowingButton } from "../../components/GlowingButton";
import { LENDING_POOL_ABI } from "../../contracts/abis/LendingPool";
import { USDC_ABI } from "../../contracts/abis/USDC";
import { publicClient, walletClient } from "../../utils/viemUtils";

const LENDING_POOL_ADDRESS = import.meta.env.VITE_LENDING_POOL_CONTRACT_ADDRESS;
const USDC_TOKEN_ADDRESS = import.meta.env.VITE_USDC_TOKEN_CONTRACT_ADDRESS;

type LockupPeriod = {
  months: number;
  multiplier: number;
  label: string;
};

type LockupPeriodSelectorProps = {
  selectedPeriod: LockupPeriod;
  onPeriodChange: (period: LockupPeriod) => void;
};

const LockupPeriodSelector = ({ selectedPeriod, onPeriodChange }: LockupPeriodSelectorProps) => {
  const periods: LockupPeriod[] = [
    { months: 1, multiplier: 1.0, label: "1 month" },
    { months: 3, multiplier: 1.25, label: "3 months" },
    { months: 6, multiplier: 1.5, label: "6 months" },
    { months: 12, multiplier: 2.0, label: "12 months" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-white">Lockup Period</h3>
        <Info className="w-4 h-4 text-gray-400" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {periods.map((period) => (
          <motion.button
            key={period.months}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onPeriodChange(period)}
            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
              selectedPeriod.months === period.months
                ? "border-purple-500 bg-gradient-to-r from-purple-500/20 to-cyan-500/20"
                : "border-gray-700/50 hover:border-purple-500/50"
            }`}
          >
            <div className="text-center">
              <div className="text-white font-medium mb-1">{period.label}</div>
              <div className="text-cyan-400 text-sm font-semibold">{period.multiplier}x multiplier</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default function Deposit() {
  const { authenticated, user, login } = usePrivy();

  const [depositAmount, setDepositAmount] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState({
    months: 3,
    multiplier: 1.25,
    label: "3 months",
  });
  const [transactionStatus, setTransactionStatus] = useState("idle");
  const [userBalance, setUserBalance] = useState<string>("0");
  const [userAllowance, setUserAllowance] = useState<string>("0");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const tokenData = {
    name: "USD Coin",
    symbol: "USDC",
    balance: parseFloat(userBalance) / 1e6,
    apy: 12.5,
  };

  const fetchUserData = async () => {
    if (!authenticated || !user?.wallet?.address) return;

    try {
      const [balance, allowance] = await Promise.all([
        publicClient.readContract({
          address: USDC_TOKEN_ADDRESS as `0x${string}`,
          abi: USDC_ABI,
          functionName: "balanceOf",
          args: [user.wallet.address as `0x${string}`],
        }),
        publicClient.readContract({
          address: USDC_TOKEN_ADDRESS as `0x${string}`,
          abi: USDC_ABI,
          functionName: "allowance",
          args: [user.wallet.address as `0x${string}`, LENDING_POOL_ADDRESS as `0x${string}`],
        }),
      ]);

      setUserBalance(balance.toString());
      setUserAllowance(allowance.toString());
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      fetchUserData();
    }
  }, [authenticated, user?.wallet?.address]);

  const needsApproval = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return false;
    const amountWei = parseUnits(depositAmount, 6);
    return BigInt(userAllowance) < amountWei;
  };

  const handleApprove = async () => {
    if (!walletClient || !depositAmount) return;

    try {
      setTransactionStatus("approving");
      setErrorMessage("");

      const amountWei = parseUnits(depositAmount, 6);

      const hash = await walletClient.writeContract({
        address: USDC_TOKEN_ADDRESS as `0x${string}`,
        abi: USDC_ABI,
        functionName: "approve",
        args: [LENDING_POOL_ADDRESS as `0x${string}`, amountWei],
      });

      await publicClient.waitForTransactionReceipt({ hash });

      await fetchUserData();
      setTransactionStatus("idle");
    } catch (error: any) {
      setErrorMessage(error.shortMessage || error.message || "Approval failed");
      setTransactionStatus("error");
      setTimeout(() => setTransactionStatus("idle"), 5000);
    }
  };

  const handleDeposit = async () => {
    if (!authenticated) {
      login();
      return;
    }

    if (!walletClient || !depositAmount || parseFloat(depositAmount) <= 0) return;

    try {
      if (needsApproval()) {
        handleApprove();
      }

      setTransactionStatus("depositing");
      setErrorMessage("");

      const amountWei = parseUnits(depositAmount, 6);

      const hash = await walletClient.writeContract({
        address: LENDING_POOL_ADDRESS as `0x${string}`,
        abi: LENDING_POOL_ABI,
        functionName: "deposit",
        args: [amountWei],
      });

      await publicClient.waitForTransactionReceipt({ hash });

      await fetchUserData();
      setTransactionStatus("success");
      setDepositAmount("");

      setTimeout(() => setTransactionStatus("idle"), 3000);
    } catch (error: any) {
      setErrorMessage(error.message || "Deposit failed");
      setTransactionStatus("error");
    }
  };

  const calculateEstimatedYield = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return 0;
    const amount = parseFloat(depositAmount);
    const baseApy = tokenData.apy / 100;
    const boostedApy = baseApy * selectedPeriod.multiplier;
    const monthlyYield = (amount * boostedApy) / 12;
    return monthlyYield * selectedPeriod.months;
  };

  const calculateEffectiveAPY = () => {
    return (tokenData.apy * selectedPeriod.multiplier).toFixed(1);
  };

  const isLoading = transactionStatus === "depositing";
  const canDeposit = authenticated && depositAmount && parseFloat(depositAmount) > 0 && !isLoading;

  return (
    <div className="min-h-screen bg-black text-white">
      <FloatingOrbs />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            Deposit & Earn
          </h1>
          <p className="text-gray-400 text-lg">Lock your tokens for higher yields and bonus rewards</p>
        </motion.div>

        {!authenticated ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 text-center"
          >
            <Wallet className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Connect Wallet to Start Earning</h2>
            <p className="text-gray-400 mb-6">
              Connect your wallet to deposit tokens and start earning competitive yields
            </p>
            <GlowingButton onClick={login} className="text-lg px-8 py-4">
              Connect Wallet
              <ArrowRight className="w-5 h-5" />
            </GlowingButton>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 space-y-8"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Deposit Amount</h3>
                <div className="text-sm text-gray-400">
                  Available: {tokenData.balance.toFixed(2)} {tokenData.symbol}
                </div>
              </div>

              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <input
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-transparent text-3xl font-bold text-white placeholder-gray-500 focus:outline-none w-full"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-gray-400">{tokenData.symbol}</span>
                    <button
                      onClick={() => setDepositAmount(tokenData.balance.toString())}
                      className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-400 hover:text-purple-300 transition-colors duration-300 text-sm font-medium"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400">Available capacity</span>
                    <span className="text-white">∞</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Wallet</span>
                    <span className="text-white">{tokenData.balance.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <LockupPeriodSelector selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod} />

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Estimated Returns</h3>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Effective APY</div>
                  <div className="text-2xl font-bold text-cyan-400">{calculateEffectiveAPY()}%</div>
                </div>

                <div>
                  <div className="text-gray-400 text-sm mb-1">Est. yield ({selectedPeriod.label})</div>
                  <div className="text-2xl font-bold text-white">
                    {calculateEstimatedYield().toFixed(2)}
                    <span className="text-lg text-gray-400 ml-1">{tokenData.symbol}</span>
                  </div>
                </div>
              </div>

              {selectedPeriod.multiplier > 1 && (
                <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✦</span>
                    </div>
                    <span className="text-white font-medium">Bonus Multiplier Active</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Earn {selectedPeriod.multiplier}x rewards by locking for {selectedPeriod.label}
                  </p>
                </div>
              )}
            </div>

            <GlowingButton onClick={handleDeposit} className="w-full text-lg py-6" disabled={!canDeposit}>
              {transactionStatus === "depositing" ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Depositing...
                </>
              ) : transactionStatus === "success" ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Deposit Successful!
                </>
              ) : !authenticated ? (
                <>
                  Connect Wallet
                  <Wallet className="w-5 h-5" />
                </>
              ) : (
                <>
                  Deposit & Start Earning
                  <DollarSign className="w-5 h-5" />
                </>
              )}
            </GlowingButton>

            {transactionStatus === "error" && errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center gap-3"
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
                className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <div>
                  <div className="text-green-400 font-medium">Deposit Successful!</div>
                  <div className="text-green-300 text-sm">
                    Your USDC has been deposited and is now earning interest.
                  </div>
                </div>
              </motion.div>
            )}

            {authenticated && (
              <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Your USDC Balance:</span>
                  <span className="text-white">{tokenData.balance.toFixed(6)} USDC</span>
                </div>
                {needsApproval() && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Approval Status:</span>
                    <span className="text-yellow-400">Approval Required</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
