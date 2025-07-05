import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  CheckCircle,
  DollarSign,
  PieChart,
  Shield,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { FloatingOrbs } from "../../components/FloatingOrbs";
import { GlowingButton } from "../../components/GlowingButton";
import { LENDING_POOL_ABI } from "../../contracts/abis/LendingPool";
import { publicClient } from "../../utils/viemUtils";

const LENDING_POOL_ADDRESS = import.meta.env.VITE_LENDING_POOL_CONTRACT_ADDRESS;

type StatCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  trend?: number;
  className?: string;
};

const StatCard = ({ title, value, subtitle, icon: Icon, trend, className = "" }: StatCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 group hover:border-purple-500/50 transition-all duration-300 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend > 0 ? "text-green-400" : "text-red-400"}`}>
            <TrendingUp className="w-4 h-4" />
            <span>
              {trend > 0 ? "+" : ""}
              {trend}%
            </span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-gray-400 text-sm">{title}</p>
      {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
    </motion.div>
  );
};

type PortfolioData = {
  totalValue: number;
  totalEarned: number;
  currentAPY: number;
  activePositions: number;
  isLoading: boolean;
};

const PortfolioOverview = ({ userAddress }: { userAddress: string | undefined }) => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    totalValue: 0,
    totalEarned: 0,
    currentAPY: 12.5,
    activePositions: 0,
    isLoading: true,
  });

  const fetchPortfolioData = async () => {
    if (!userAddress || !LENDING_POOL_ADDRESS) {
      setPortfolioData((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const lenderInfo = await publicClient.readContract({
        address: LENDING_POOL_ADDRESS as `0x${string}`,
        abi: LENDING_POOL_ABI,
        functionName: "getLenderInfo",
        args: [userAddress as `0x${string}`],
      });

      const [depositedAmount, earnedInterest] = lenderInfo;

      const depositedValue = parseFloat(formatUnits(depositedAmount, 6));
      const earnedValue = parseFloat(formatUnits(earnedInterest, 6));
      const totalValue = depositedValue + earnedValue;

      setPortfolioData({
        totalValue,
        totalEarned: earnedValue,
        currentAPY: 12.5,
        activePositions: depositedValue > 0 ? 1 : 0,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
      setPortfolioData((prev) => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, [userAddress]);

  if (portfolioData.isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gray-700 rounded-xl"></div>
            </div>
            <div className="h-8 bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Portfolio Value"
        value={`$${portfolioData.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        icon={DollarSign}
      />
      <StatCard
        title="Total Earned"
        value={`$${portfolioData.totalEarned.toFixed(2)}`}
        subtitle="All time"
        icon={TrendingUp}
        trend={portfolioData.totalEarned > 0 ? 8.2 : undefined}
      />
      <StatCard title="Current APY" value={`${portfolioData.currentAPY}%`} icon={Target} trend={2.1} />
      <StatCard title="Active Positions" value={portfolioData.activePositions.toString()} icon={PieChart} />
    </div>
  );
};

type Position = {
  id: string;
  token: string;
  amount: number;
  apy: number;
  lockupPeriod: string;
  timeRemaining: string;
  earned: number;
  status: string;
  depositTimestamp: number;
};

const ActivePositions = ({ userAddress }: { userAddress: string | undefined }) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPositions = async () => {
    if (!userAddress || !LENDING_POOL_ADDRESS) {
      setIsLoading(false);
      return;
    }

    try {
      const lenderInfo = await publicClient.readContract({
        address: LENDING_POOL_ADDRESS as `0x${string}`,
        abi: LENDING_POOL_ABI,
        functionName: "getLenderInfo",
        args: [userAddress as `0x${string}`],
      });

      const [depositedAmount, earnedInterest, depositTimestamp] = lenderInfo;

      const depositedValue = parseFloat(formatUnits(depositedAmount, 6));
      const earnedValue = parseFloat(formatUnits(earnedInterest, 6));

      if (depositedValue > 0) {
        const position: Position = {
          id: "1",
          token: "USDC",
          amount: depositedValue,
          apy: 12.5,
          lockupPeriod: "Flexible",
          timeRemaining: "Active",
          earned: earnedValue,
          status: "earning",
          depositTimestamp: Number(depositTimestamp),
        };
        setPositions([position]);
      } else {
        setPositions([]);
      }
    } catch (error) {
      console.error("Error fetching positions:", error);
      setPositions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, [userAddress]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Active Positions</h2>
        </div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-20"></div>
                    <div className="h-3 bg-gray-700 rounded w-12"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-16"></div>
                  <div className="h-3 bg-gray-700 rounded w-20"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-16"></div>
                  <div className="h-3 bg-gray-700 rounded w-12"></div>
                </div>
                <div className="h-3 bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Active Positions</h2>
        {positions.length > 0 && (
          <GlowingButton variant="secondary" className="text-sm">
            Manage All
          </GlowingButton>
        )}
      </div>

      {positions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <PieChart className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Active Positions</h3>
          <p className="text-gray-400 mb-6">Start lending to see your positions here</p>
          <GlowingButton onClick={() => (window.location.href = "/lend/deposit")} className="text-sm">
            Start Lending
            <ArrowRight className="w-4 h-4" />
          </GlowingButton>
        </div>
      ) : (
        <div className="space-y-4">
          {positions.map((position) => (
            <motion.div
              key={position.id}
              whileHover={{ scale: 1.01 }}
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{position.token}</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      $
                      {position.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-gray-400 text-sm">{position.token}</div>
                  </div>
                </div>

                <div className="text-center md:text-left">
                  <div className="text-cyan-400 font-semibold">{position.apy}% APY</div>
                  <div className="text-gray-400 text-sm">{position.lockupPeriod}</div>
                </div>

                <div className="text-center md:text-left">
                  <div className="text-white font-semibold">${position.earned.toFixed(6)}</div>
                  <div className="text-gray-400 text-sm">Earned</div>
                </div>

                <div className="flex items-center justify-center md:justify-end gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">{position.timeRemaining}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

type PoolData = {
  utilization: number;
  totalBorrowed: number;
  totalSupplied: number;
  activeBorrowers: number;
  avgCollateralRatio: number;
  riskLevel: string;
  isLoading: boolean;
};

const PoolStats = () => {
  const [poolData, setPoolData] = useState<PoolData>({
    utilization: 0,
    totalBorrowed: 0,
    totalSupplied: 0,
    activeBorrowers: 0,
    avgCollateralRatio: 142,
    riskLevel: "Low",
    isLoading: true,
  });

  const fetchPoolData = async () => {
    if (!LENDING_POOL_ADDRESS) {
      setPoolData((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const [totalDeposited, totalBorrowed, totalRepaid, utilizationRate] = await Promise.all([
        publicClient.readContract({
          address: LENDING_POOL_ADDRESS as `0x${string}`,
          abi: LENDING_POOL_ABI,
          functionName: "totalDeposited",
        }),
        publicClient.readContract({
          address: LENDING_POOL_ADDRESS as `0x${string}`,
          abi: LENDING_POOL_ABI,
          functionName: "totalBorrowed",
        }),
        publicClient.readContract({
          address: LENDING_POOL_ADDRESS as `0x${string}`,
          abi: LENDING_POOL_ABI,
          functionName: "totalRepaid",
        }),
        publicClient.readContract({
          address: LENDING_POOL_ADDRESS as `0x${string}`,
          abi: LENDING_POOL_ABI,
          functionName: "getUtilizationRate",
        }),
      ]);

      const totalSuppliedValue = parseFloat(formatUnits(totalDeposited, 6));
      const currentBorrowed = Number(totalBorrowed) - Number(totalRepaid);
      const totalBorrowedValue = parseFloat(formatUnits(BigInt(Math.max(0, currentBorrowed)), 6));
      const utilizationPercentage = Number(utilizationRate) / 100;

      setPoolData({
        utilization: utilizationPercentage,
        totalBorrowed: totalBorrowedValue,
        totalSupplied: totalSuppliedValue,
        activeBorrowers: 0,
        avgCollateralRatio: 142,
        riskLevel: utilizationPercentage > 90 ? "High" : utilizationPercentage > 70 ? "Medium" : "Low",
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching pool data:", error);
      setPoolData((prev) => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    fetchPoolData();

    const interval = setInterval(fetchPoolData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (poolData.isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-white">Pool Health & Statistics</h2>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-6 animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="h-3 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 animate-pulse">
              <div className="h-8 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-white">Pool Health & Statistics</h2>
        <div
          className={`flex items-center gap-1 ${
            poolData.riskLevel === "Low"
              ? "text-green-400"
              : poolData.riskLevel === "Medium"
                ? "text-yellow-400"
                : "text-red-400"
          }`}
        >
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{poolData.riskLevel} Risk</span>
        </div>
      </div>

      {/* Utilization Rate */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-400 font-medium">Pool Utilization</span>
          <span className="text-2xl font-bold text-cyan-400">{poolData.utilization.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              poolData.utilization > 90
                ? "bg-gradient-to-r from-red-500 to-orange-500"
                : poolData.utilization > 70
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                  : "bg-gradient-to-r from-purple-500 to-cyan-500"
            }`}
            style={{ width: `${Math.min(poolData.utilization, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-400">
          <span>Total Borrowed: ${poolData.totalBorrowed.toFixed(2)}</span>
          <span>Total Supplied: ${poolData.totalSupplied.toFixed(2)}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Available Liquidity"
          value={`$${(poolData.totalSupplied - poolData.totalBorrowed).toFixed(2)}`}
          icon={Users}
        />
        <StatCard title="Avg. Collateral Ratio" value={`${poolData.avgCollateralRatio}%`} icon={Shield} />
        <StatCard title="Risk Level" value={poolData.riskLevel} subtitle="Well collateralized" icon={Activity} />
      </div>
    </div>
  );
};

type UnauthorizedViewProps = {
  onLogin: () => void;
};

const UnauthorizedView = ({ onLogin }: UnauthorizedViewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-12 text-center"
    >
      <div className="max-w-md mx-auto">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <PieChart className="w-10 h-10 text-white" />
        </div>

        <h2 className="text-3xl font-bold text-white mb-4">View Your Portfolio</h2>

        <p className="text-gray-400 mb-8 leading-relaxed">
          Connect your wallet to access your complete portfolio dashboard with real-time tracking of your lending
          positions, earnings, and performance analytics.
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-gray-300">
            <CheckCircle className="w-5 h-5 text-cyan-400" />
            <span>Track lending positions and earnings</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <CheckCircle className="w-5 h-5 text-cyan-400" />
            <span>Monitor APY and performance metrics</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <CheckCircle className="w-5 h-5 text-cyan-400" />
            <span>Access detailed pool analytics</span>
          </div>
        </div>

        <GlowingButton onClick={onLogin} className="text-lg px-8 py-4">
          Connect Wallet
          <ArrowRight className="w-5 h-5" />
        </GlowingButton>
      </div>
    </motion.div>
  );
};

export default function Portfolio() {
  const { authenticated, user, login } = usePrivy();

  return (
    <div className="min-h-screen bg-black text-white">
      <FloatingOrbs />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            Your Portfolio
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Complete overview of your lending positions and earnings
          </p>
        </motion.div>

        {/* Main Content */}
        {!authenticated ? (
          <UnauthorizedView onLogin={login} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            <PortfolioOverview userAddress={user?.wallet?.address} />
            <ActivePositions userAddress={user?.wallet?.address} />
            <PoolStats />
          </motion.div>
        )}
      </div>
    </div>
  );
}
