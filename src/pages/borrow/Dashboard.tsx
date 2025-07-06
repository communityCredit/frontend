import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CreditCard,
  DollarSign,
  ExternalLink,
  Info,
  Loader,
  Plus,
  Shield,
  Target,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { parseUnits } from "viem";
import { flowTestnet } from "viem/chains";
import ConnectWalletButton from "../../components/ConnectWalletButton";
import { FloatingOrbs } from "../../components/FloatingOrbs";
import { GlowingButton } from "../../components/GlowingButton";
import { COLLATERAL_VAULT_ABI } from "../../contracts/abis/CollateralVault";
import { CREDIT_MANAGER_ABI } from "../../contracts/abis/CreditManager";
import { USDC_ABI } from "../../contracts/abis/USDC";
import { getWalletClient, publicClient } from "../../utils/viemUtils";

const CREDIT_MANAGER_ADDRESS = import.meta.env.VITE_CREDIT_MANAGER_ADDRESS;
const COLLATERAL_VAULT_ADDRESS = import.meta.env.VITE_COLLATERAL_VAULT_ADDRESS;
const USDC_TOKEN_ADDRESS = import.meta.env.VITE_USDC_TOKEN_CONTRACT_ADDRESS;
const LENDING_POOL_ADDRESS = import.meta.env.VITE_LENDING_POOL_CONTRACT_ADDRESS;

type CreditSummaryCardProps = {
  creditLimit: number;
  usedCredit: number;
  availableCredit: number;
};

const CreditSummaryCard = ({ creditLimit, usedCredit, availableCredit }: CreditSummaryCardProps) => {
  const usagePercentage = (usedCredit / creditLimit) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 text-center"
    >
      <div className="flex items-center justify-center gap-2 mb-4">
        <CreditCard className="w-6 h-6 text-cyan-400" />
        <h2 className="text-xl font-semibold text-white">Credit Overview</h2>
      </div>

      <div className="mb-6">
        <div className="text-5xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text mb-2">
          ${creditLimit.toLocaleString()}
        </div>
        <div className="text-gray-400">Total Credit Limit</div>
      </div>

      <div className="mb-6">
        <div className="text-2xl font-bold text-white mb-2">${availableCredit.toLocaleString()}</div>
        <div className="text-gray-400 text-sm">Available Credit</div>
      </div>

      <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${usagePercentage}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className="bg-gradient-to-r from-purple-500 to-cyan-500 h-3 rounded-full"
        />
      </div>
      <div className="flex justify-between text-sm text-gray-400">
        <span>Used: ${usedCredit.toLocaleString()}</span>
        <span>{usagePercentage.toFixed(1)}% utilized</span>
      </div>
    </motion.div>
  );
};

type CollateralCardProps = {
  stakedAmount: number;
  onStakeMore: () => void;
};

const CollateralCard = ({ stakedAmount, onStakeMore }: CollateralCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="flex flex-col justify-between bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Collateral</h3>
        </div>
        <div className="group relative">
          <Info className="w-4 h-4 text-gray-400 cursor-help" />
          <div className="absolute right-0 top-6 w-64 bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            Your staked USDC acts as collateral and determines your credit limit
          </div>
        </div>
      </div>

      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-white mb-1">${stakedAmount.toLocaleString()}</div>
        <div className="text-gray-400 text-sm">USDC Staked</div>
      </div>

      <GlowingButton onClick={onStakeMore} className="w-full">
        <Plus className="w-4 h-4" />
        Stake More
      </GlowingButton>
    </motion.div>
  );
};

type OutstandingLoanCardProps = {
  principal: number;
  interest: number;
  isOverdue: boolean;
  daysUntilDue: number;
  onRepay: () => void;
  isRepayLoading?: boolean;
};

const OutstandingLoanCard = ({
  principal,
  interest,
  isOverdue,
  daysUntilDue,
  onRepay,
  isRepayLoading = false,
}: OutstandingLoanCardProps) => {
  const totalDebt = principal + interest;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={`flex flex-col justify-between bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border rounded-2xl p-6 ${
        isOverdue ? "border-red-500/50" : "border-gray-700/50"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Outstanding Loan</h3>
        </div>
        {(isOverdue || daysUntilDue <= 3) && (
          <div className="flex items-center gap-1 text-orange-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{isOverdue ? "Overdue" : `${daysUntilDue} days left`}</span>
          </div>
        )}
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-400">Principal</span>
          <span className="text-white font-medium">${principal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Interest</span>
          <span className="text-white font-medium">${interest.toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-700 pt-3">
          <div className="flex justify-between">
            <span className="text-white font-semibold">Total Debt</span>
            <span className="text-xl font-bold text-cyan-400">${totalDebt.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {totalDebt > 0 ? (
        <GlowingButton onClick={onRepay} className="w-full" disabled={isRepayLoading}>
          {isRepayLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Processing Repayment...
            </>
          ) : (
            <>
              Make Repayment
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </GlowingButton>
      ) : (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
          <div className="text-green-400 font-medium mb-1">✅ All Paid Up!</div>
          <div className="text-green-300 text-sm">No outstanding debt</div>
        </div>
      )}
    </motion.div>
  );
};

type ReputationCardProps = {
  creditScore: number;
  potentialIncrease: number;
  onViewDetails: () => void;
};

const ReputationCard = ({ creditScore, potentialIncrease, onViewDetails }: ReputationCardProps) => {
  const scorePercentage = (creditScore / 850) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="flex flex-col justify-between bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Credit Score</h3>
      </div>

      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text mb-2">
          {creditScore}
        </div>
        <div className="text-gray-400 text-sm">Your Credit Score</div>
      </div>

      <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${scorePercentage}%` }}
          transition={{ duration: 1, delay: 0.8 }}
          className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full"
        />
      </div>

      <div className="text-center mb-4">
        <div className="text-sm text-gray-400 mb-1">Potential Credit Increase</div>
        <div className="text-lg font-semibold text-cyan-400">+${potentialIncrease.toLocaleString()}</div>
      </div>

      <GlowingButton onClick={onViewDetails} variant="secondary" className="w-full">
        View Details
        <ExternalLink className="w-4 h-4" />
      </GlowingButton>
    </motion.div>
  );
};

type ActivityType = "borrow" | "repay" | "stake" | "payment" | string;
type ActivityStatus = "completed" | "pending" | "failed" | string;

type RecentActivityProps = {
  activities: {
    type: ActivityType;
    amount: number;
    date: string;
    status: ActivityStatus;
  }[];
  onViewAll: () => void;
};

const RecentActivity = ({ activities, onViewAll }: RecentActivityProps) => {
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "borrow":
        return <ArrowDown className="w-4 h-4 text-red-400" />;
      case "repay":
        return <ArrowUp className="w-4 h-4 text-green-400" />;
      case "stake":
        return <Shield className="w-4 h-4 text-purple-400" />;
      case "payment":
        return <DollarSign className="w-4 h-4 text-cyan-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ActivityStatus): string => {
    switch (status) {
      case "completed":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "failed":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        </div>
        <GlowingButton onClick={onViewAll} variant="secondary">
          View All
        </GlowingButton>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
            className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                {getActivityIcon(activity.type)}
              </div>
              <div>
                <div className="text-white font-medium capitalize">{activity.type}</div>
                <div className="text-gray-400 text-sm">{activity.date}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-medium">${activity.amount.toLocaleString()}</div>
              <div className={`text-sm capitalize ${getStatusColor(activity.status)}`}>{activity.status}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default function BorrowerDashboard() {
  const { authenticated, user, login } = usePrivy();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [repayLoading, setRepayLoading] = useState(false);
  const [creditData, setCreditData] = useState({
    creditLimit: 0,
    usedCredit: 0,
    availableCredit: 0,
    stakedCollateral: 0,
    loanPrincipal: 0,
    loanInterest: 0,
    totalDebt: 0,
    isOverdue: false,
    daysUntilDue: 0,
    isActive: false,
  });

  const [reputationData, setReputationData] = useState({
    creditScore: 0,
    potentialIncrease: 0,
    onTimeRepayments: 0,
    lateRepayments: 0,
    totalRepaid: 0,
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  const fetchContractData = async () => {
    if (!authenticated || !user?.wallet?.address) return;

    try {
      setLoading(true);
      setError(null);
      const userAddress = user.wallet.address as `0x${string}`;

      const creditInfo = await publicClient.readContract({
        address: CREDIT_MANAGER_ADDRESS as `0x${string}`,
        abi: CREDIT_MANAGER_ABI,
        functionName: "getCreditInfo",
        args: [userAddress],
      });

      const collateralInfo = await publicClient.readContract({
        address: COLLATERAL_VAULT_ADDRESS as `0x${string}`,
        abi: COLLATERAL_VAULT_ABI,
        functionName: "getUserCollateral",
        args: [userAddress],
      });

      const repaymentHistory = await publicClient.readContract({
        address: CREDIT_MANAGER_ADDRESS as `0x${string}`,
        abi: CREDIT_MANAGER_ABI,
        functionName: "getRepaymentHistory",
        args: [userAddress],
      });

      const creditIncreaseEligibility = await publicClient.readContract({
        address: CREDIT_MANAGER_ADDRESS as `0x${string}`,
        abi: CREDIT_MANAGER_ABI,
        functionName: "checkCreditIncreaseEligibility",
        args: [userAddress],
      });

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

        const creditLimitUSDC = Number(creditLimit) / 1e6;
        const borrowedAmountUSDC = Number(borrowedAmount) / 1e6;
        const interestAccruedUSDC = Number(interestAccrued) / 1e6;
        const totalDebtUSDC = Number(totalDebt) / 1e6;
        const availableCreditUSDC = creditLimitUSDC - borrowedAmountUSDC;

        const dueDate = Number(repaymentDueDate);
        const currentTime = Math.floor(Date.now() / 1000);
        const daysUntilDue = Math.max(0, Math.ceil((dueDate - currentTime) / (24 * 60 * 60)));
        const isOverdue = dueDate > 0 && currentTime > dueDate;

        setCreditData({
          creditLimit: creditLimitUSDC,
          usedCredit: borrowedAmountUSDC,
          availableCredit: availableCreditUSDC,
          stakedCollateral: Number(collateralDeposited) / 1e6,
          loanPrincipal: borrowedAmountUSDC,
          loanInterest: interestAccruedUSDC,
          totalDebt: totalDebtUSDC,
          isOverdue,
          daysUntilDue,
          isActive: Boolean(isActive),
        });
      }

      if (collateralInfo && Array.isArray(collateralInfo)) {
        const [amount] = collateralInfo;
        setCreditData((prev) => ({
          ...prev,
          stakedCollateral: Number(amount) / 1e6,
        }));
      }

      if (repaymentHistory && Array.isArray(repaymentHistory)) {
        const [onTimeRepayments, lateRepayments, totalRepaid] = repaymentHistory;

        const totalRepayments = Number(onTimeRepayments) + Number(lateRepayments);
        const onTimePercentage = totalRepayments > 0 ? Number(onTimeRepayments) / totalRepayments : 1;
        const baseScore = Math.floor(300 + onTimePercentage * 550);

        setReputationData({
          creditScore: baseScore,
          potentialIncrease:
            creditIncreaseEligibility && Array.isArray(creditIncreaseEligibility)
              ? Number(creditIncreaseEligibility[1]) / 1e6 - creditData.creditLimit
              : 0,
          onTimeRepayments: Number(onTimeRepayments),
          lateRepayments: Number(lateRepayments),
          totalRepaid: Number(totalRepaid) / 1e6,
        });
      }

      setRecentActivities([
        { type: "borrow", amount: creditData.loanPrincipal, date: "Recent", status: "completed" },
        { type: "stake", amount: creditData.stakedCollateral, date: "Earlier", status: "completed" },
      ]);
    } catch (error) {
      console.error("Error fetching contract data:", error);
      setError("Failed to load dashboard data. Please try refreshing the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      fetchContractData();
    }
  }, [authenticated, user?.wallet?.address]);

  const handleStakeMore = () => {
    navigate("/borrow/stake");
  };

  const handleRepay = async () => {
    if (!authenticated || !user?.wallet?.address || creditData.totalDebt <= 0) {
      toast.error("Unable to process repayment. Please check your connection and outstanding debt.");
      return;
    }

    try {
      setRepayLoading(true);
      const userAddress = user.wallet.address as `0x${string}`;

      const walletClient = getWalletClient(userAddress);
      if (!walletClient) {
        throw new Error("Failed to get wallet client");
      }

      const principalAmountWei = parseUnits(creditData.loanPrincipal.toString(), 6);
      const interestAmountWei = parseUnits(creditData.loanInterest.toString(), 6);
      const totalAmountWei = principalAmountWei + interestAmountWei;

      toast.loading("Preparing repayment transaction...", { id: "repay-loading" });

      const userBalance = await publicClient.readContract({
        address: USDC_TOKEN_ADDRESS as `0x${string}`,
        abi: USDC_ABI,
        functionName: "balanceOf",
        args: [userAddress],
      });

      if (BigInt(userBalance as string) < totalAmountWei) {
        throw new Error(`Insufficient USDC balance. Required: ${creditData.totalDebt.toFixed(2)} USDC`);
      }

      const [creditManagerAllowance, lendingPoolAllowance] = await Promise.all([
        publicClient.readContract({
          address: USDC_TOKEN_ADDRESS as `0x${string}`,
          abi: USDC_ABI,
          functionName: "allowance",
          args: [userAddress, CREDIT_MANAGER_ADDRESS as `0x${string}`],
        }),
        publicClient.readContract({
          address: USDC_TOKEN_ADDRESS as `0x${string}`,
          abi: USDC_ABI,
          functionName: "allowance",
          args: [userAddress, LENDING_POOL_ADDRESS as `0x${string}`],
        }),
      ]);

      if (BigInt(creditManagerAllowance as string) < totalAmountWei) {
        toast.loading("Approving USDC spending for Credit Manager...", { id: "repay-loading" });

        const approveCreditManagerHash = await walletClient.writeContract({
          address: USDC_TOKEN_ADDRESS as `0x${string}`,
          abi: USDC_ABI,
          functionName: "approve",
          args: [CREDIT_MANAGER_ADDRESS as `0x${string}`, totalAmountWei],
          account: userAddress,
          chain: flowTestnet,
        });

        await publicClient.waitForTransactionReceipt({ hash: approveCreditManagerHash });
      }

      if (BigInt(lendingPoolAllowance as string) < totalAmountWei) {
        toast.loading("Approving USDC spending for Lending Pool...", { id: "repay-loading" });

        const approveLendingPoolHash = await walletClient.writeContract({
          address: USDC_TOKEN_ADDRESS as `0x${string}`,
          abi: USDC_ABI,
          functionName: "approve",
          args: [LENDING_POOL_ADDRESS as `0x${string}`, totalAmountWei],
          account: userAddress,
          chain: flowTestnet,
        });

        await publicClient.waitForTransactionReceipt({ hash: approveLendingPoolHash });
      }

      toast.loading("Processing repayment...", { id: "repay-loading" });

      const repayHash = await walletClient.writeContract({
        address: CREDIT_MANAGER_ADDRESS as `0x${string}`,
        abi: CREDIT_MANAGER_ABI,
        functionName: "repay",
        args: [principalAmountWei, interestAmountWei],
        account: userAddress,
        chain: flowTestnet,
      });

      await publicClient.waitForTransactionReceipt({ hash: repayHash });

      toast.dismiss("repay-loading");
      toast.success(`Successfully repaid ${creditData.totalDebt.toFixed(2)} USDC!`, {
        icon: "💰",
        duration: 5000,
      });

      await fetchContractData();
    } catch (error: any) {
      console.error("Repayment error:", error);
      toast.dismiss("repay-loading");

      let errorMessage = "Repayment failed. Please try again.";

      if (error.message?.includes("insufficient")) {
        errorMessage = "Insufficient balance to complete repayment.";
      } else if (error.message?.includes("rejected")) {
        errorMessage = "Transaction was rejected by user.";
      } else if (error.message?.includes("allowance")) {
        errorMessage = "Failed to approve USDC spending.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, { duration: 8000 });
    } finally {
      setRepayLoading(false);
    }
  };

  const handleViewReputation = () => {
    console.log("View reputation details");
  };

  const handleViewAllActivity = () => {
    console.log("View all activity");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <FloatingOrbs />
        <ConnectWalletButton />

        <div className="relative z-10 max-w-2xl mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 text-center"
          >
            <Loader className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-bold text-white mb-2">Loading Dashboard...</h2>
            <p className="text-gray-400">Fetching your credit information from the blockchain</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <FloatingOrbs />
        <ConnectWalletButton />

        <div className="relative z-10 max-w-2xl mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-red-500/50 rounded-2xl p-8 text-center"
          >
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <GlowingButton onClick={fetchContractData} className="text-lg px-8 py-4">
              Try Again
              <ArrowRight className="w-5 h-5" />
            </GlowingButton>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black text-white">
        <FloatingOrbs />
        <ConnectWalletButton />

        <div className="relative z-10 max-w-2xl mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 text-center"
          >
            <Wallet className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Connect Wallet to View Dashboard</h2>
            <p className="text-gray-400 mb-6">
              Connect your wallet to access your borrower dashboard and manage your credit
            </p>
            <GlowingButton onClick={login} className="text-lg px-8 py-4">
              Connect Wallet
              <ArrowRight className="w-5 h-5" />
            </GlowingButton>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <FloatingOrbs />
      <ConnectWalletButton />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            Your Credit Overview
          </h1>
        </motion.div>

        {!creditData.isActive ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 text-center"
          >
            <CreditCard className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">No Active Credit Line</h2>
            <p className="text-gray-400 mb-6">
              Start by staking USDC as collateral to open your credit line and begin borrowing
            </p>
            <GlowingButton onClick={handleStakeMore} className="text-lg px-8 py-4">
              Stake Collateral & Open Credit Line
              <ArrowRight className="w-5 h-5" />
            </GlowingButton>
          </motion.div>
        ) : (
          <>
            <div className="mb-8">
              <CreditSummaryCard
                creditLimit={creditData.creditLimit}
                usedCredit={creditData.usedCredit}
                availableCredit={creditData.availableCredit}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <CollateralCard stakedAmount={creditData.stakedCollateral} onStakeMore={handleStakeMore} />

              <OutstandingLoanCard
                principal={creditData.loanPrincipal}
                interest={creditData.loanInterest}
                isOverdue={creditData.isOverdue}
                daysUntilDue={creditData.daysUntilDue}
                onRepay={handleRepay}
                isRepayLoading={repayLoading}
              />

              <ReputationCard
                creditScore={reputationData.creditScore}
                potentialIncrease={reputationData.potentialIncrease}
                onViewDetails={handleViewReputation}
              />
            </div>

            <RecentActivity activities={recentActivities} onViewAll={handleViewAllActivity} />
          </>
        )}
      </div>
    </div>
  );
}
